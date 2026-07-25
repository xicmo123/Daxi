// Merges the admin-curated festival carousel with the official Tourism
// Administration open-data feed, so the events list keeps updating even
// when nobody has touched the admin panel.
import { readSlides, isSlideInCarousel } from "./carousel";
import { fetchDaxiTourismEvents } from "./tourismEvents";

export type EventFeedSlide = {
  id: string;
  order: number;
  phase: "past" | "ongoing" | "upcoming";
  date: string;
  time: string;
  title: string;
  desc: string;
  history?: string;
  theme?: string;
  badges?: ("route" | "live")[];
  ctaLabel?: string;
  ctaUrl?: string;
  photoSrc?: string;
  photoHistorical?: boolean;
  isoDate?: string;
  showInCarousel: boolean;
  source: "admin" | "official";
};

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];

function formatDateLabel(startIso: string | null, endIso: string | null): string {
  if (!startIso) return "";
  const start = new Date(startIso);
  const startLabel = `${start.getMonth() + 1}/${start.getDate()}（${WEEKDAY[start.getDay()]}）`;
  if (!endIso) return startLabel;
  const end = new Date(endIso);
  if (start.toDateString() === end.toDateString()) return startLabel;
  const endLabel = `${end.getMonth() + 1}/${end.getDate()}（${WEEKDAY[end.getDay()]}）`;
  return `${startLabel}－${endLabel}`;
}

function computePhase(startIso: string | null, endIso: string | null): "past" | "ongoing" | "upcoming" {
  const now = Date.now();
  const start = startIso ? new Date(startIso).getTime() : null;
  const end = endIso ? new Date(endIso).getTime() : null;
  if (start !== null && now < start) return "upcoming";
  if (end !== null && now > end) return "past";
  return "ongoing";
}

function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, "").toLowerCase();
}

export async function getMergedEvents(): Promise<EventFeedSlide[]> {
  const adminSlides = await readSlides();
  const adminMapped: EventFeedSlide[] = adminSlides.map((s) => ({
    id: s.id,
    order: s.order,
    phase: s.phase,
    date: s.date,
    time: s.time,
    title: s.title,
    desc: s.desc,
    history: s.history,
    theme: s.theme,
    badges: s.badges,
    ctaLabel: s.ctaLabel,
    ctaUrl: s.ctaUrl,
    photoSrc: s.photo?.src,
    photoHistorical: s.photo?.historical,
    isoDate: s.isoDate,
    showInCarousel: isSlideInCarousel(s),
    source: "admin",
  }));

  let official: EventFeedSlide[] = [];
  try {
    const events = await fetchDaxiTourismEvents();
    official = events.map((e, i) => {
      // The Tourism Administration feed sometimes ships a near-empty
      // Description (or none at all) — falling through to a blank-feeling
      // modal is worse than an honest "官方還沒提供介紹" plus a search link.
      const hasRealDesc = e.desc.trim().length >= 5;
      const ctaUrl = e.ctaUrl || `https://www.google.com/search?q=${encodeURIComponent(`${e.title} 大溪`)}`;
      return {
        id: `tourism-${e.id}`,
        order: 1000 + i,
        phase: computePhase(e.startDate, e.endDate),
        date: formatDateLabel(e.startDate, e.endDate),
        time: "詳見官方活動資訊",
        title: e.title,
        desc: hasRealDesc ? e.desc : "官方資料庫尚未提供這個活動的詳細介紹，點下方查詢最新資訊。",
        // photoSrc points at whatever host the source city government uses —
        // rendered with unoptimized (see HeroCarousel/EventsList/EventModal)
        // instead of requiring an explicit next/image domain allowlist.
        photoSrc: e.photoSrc,
        ctaUrl,
        ctaLabel: e.ctaUrl ? "官方活動資訊" : "查詢更多資訊",
        isoDate: e.startDate ?? undefined,
        showInCarousel: true,
        source: "official" as const,
      };
    });
  } catch {
    official = [];
  }

  const adminTitles = new Set(adminMapped.map((s) => normalizeTitle(s.title)));
  const dedupedOfficial = official.filter((e) => !adminTitles.has(normalizeTitle(e.title)));

  return [...adminMapped, ...dedupedOfficial].sort((a, b) => a.order - b.order);
}
