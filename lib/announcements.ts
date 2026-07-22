export type Announcement = {
  id: string;
  title: string;
  href: string;
  date: string;
  summary?: string;
  publishedAt: number;
};

const OFFICIAL_ORIGIN = "https://www.daxi.tycg.gov.tw";
export const ANNOUNCEMENTS_PAGE_URL = `${OFFICIAL_ORIGIN}/News.aspx?n=7532&sms=12032`;
export const ANNOUNCEMENTS_RSS_URL = `${OFFICIAL_ORIGIN}/OpenData.aspx?SN=245231F15F4B3CEF`;

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export async function fetchDaxiAnnouncements(limit = 24): Promise<Announcement[]> {
  try {
    const res = await fetch(ANNOUNCEMENTS_RSS_URL, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "daxi-guide/1.0",
      },
      next: { revalidate: 30 * 60 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      throw new Error(`Daxi announcements RSS returned ${res.status}`);
    }

    const xml = await res.text();
    return parseAnnouncements(xml).slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch Daxi announcements", error);
    return [];
  }
}

function parseAnnouncements(xml: string): Announcement[] {
  const announcements: Announcement[] = [];

  for (const [index, match] of [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].entries()) {
    const block = match[1] ?? "";
    const title = cleanXmlText(readTag(block, "title"));
    if (!title) continue;

    const rawHref = cleanXmlText(readTag(block, "link"));
    const description = readTag(block, "description");
    const pubDate = cleanXmlText(readTag(block, "pubDate"));
    const href = normalizeUrl(rawHref);
    const publishedAt = parseDate(pubDate);

    announcements.push({
      id: `${title}-${pubDate || index}`,
      title,
      href,
      date: formatDate(pubDate),
      summary: truncate(htmlToText(description), 96),
      publishedAt,
    });
  }

  return announcements.sort((a, b) => b.publishedAt - a.publishedAt);
}

function readTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function cleanXmlText(value: string) {
  return decodeEntities(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()).replace(/\s+/g, " ").trim();
}

function htmlToText(value: string) {
  return cleanXmlText(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function normalizeUrl(rawHref: string) {
  if (!rawHref) return ANNOUNCEMENTS_PAGE_URL;

  if (/^https?:\/\/[^/]+\/https?:\/\//i.test(rawHref)) {
    return ANNOUNCEMENTS_PAGE_URL;
  }

  try {
    const url = new URL(rawHref, OFFICIAL_ORIGIN);
    return url.toString();
  } catch {
    return ANNOUNCEMENTS_PAGE_URL;
  }
}

function formatDate(rawDate: string) {
  const timestamp = parseDate(rawDate);
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return dateFormatter.format(date);
}

function parseDate(rawDate: string) {
  const timestamp = new Date(rawDate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}
