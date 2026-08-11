import PageHeader from "@/components/PageHeader";
import EventsList from "@/components/EventsList";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedEvents } from "@/lib/cachedSources";

export const dynamic = "force-dynamic";

export default async function ResidentEventsPage() {
  const slides = await getCachedEvents();
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
  }));

  return (
    <div className="pt-2">
      <PageHeader title="在地活動" subtitle="大溪大禧與老街周邊活動" tint="moss" />
      <EventsList events={events} />
    </div>
  );
}
