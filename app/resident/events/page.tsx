import EventsList from "@/components/EventsList";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedEvents } from "@/lib/cachedSources";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/events",
  title: "大溪在地活動",
  description: "大溪大禧、關公遶境、老街市集與地方慶典的時間地點，大溪居民的在地活動行事曆。",
});

export const dynamic = "force-dynamic";

export default async function ResidentEventsPage() {
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
    <main>
      <ResidentPageHeader
        href="/resident/events"
        title="在地活動"
        lead="大溪大禧、老街周邊的展覽、市集與地方慶典。"
        photo={{
          src: "/images/guanyu-birthday-celebration.jpg",
          author: "fppp053",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪普濟堂關聖帝君聖誕慶典.jpg",
        }}
      />
      <div>
        <EventsList events={events} />
      </div>
    </main>
  );
}
