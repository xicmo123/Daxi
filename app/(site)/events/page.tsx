import { pageMetadata } from "@/lib/seo";
import TouristPageHeader from "@/components/TouristPageHeader";
import EventsList from "@/components/EventsList";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedEvents } from "@/lib/cachedSources";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/events",
  title: "大溪活動行事曆",
  description: "大溪大禧與大溪老街周邊活動時間、地點與交通管制資訊，整合桃園市政府觀光旅遊局公開資料與在地公告。",
});

export default async function EventsPage() {
  const slides = await getCachedEvents().catch(() => []);
  const events = slides.map((event) => ({
    key: event.id,
    phase: event.phase,
    date: event.date,
    time: event.time,
    title: event.title,
    desc: event.desc,
    history: event.history,
    theme: event.theme,
    badges: event.badges,
    ctaLabel: event.ctaLabel,
    ctaUrl: event.ctaUrl,
    photoSrc: event.photoSrc,
    photoHistorical: event.photoHistorical,
    source: event.source,
  }));

  return (
    <div>
      <TouristPageHeader
        title="大溪活動"
        subtitle="查找老街周邊的展覽、市集與地方慶典。"
        photo={{
          src: "/images/guanyu-birthday-celebration.jpg",
          author: "fppp053",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪普濟堂關聖帝君聖誕慶典.jpg",
        }}
      />
      <EventsList events={events} />
    </div>
  );
}
