import PageHeaderT from "@/components/PageHeaderT";
import EventsList from "@/components/EventsList";
import { getMergedEvents } from "@/lib/eventsFeed";

export const dynamic = "force-dynamic";

export default async function ResidentEventsPage() {
  const slides = await getMergedEvents();
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
      <PageHeaderT titleKey="residentEventsTitle" subtitleKey="eventsSubtitle" tint="moss" />
      <EventsList events={events} residentMode />
    </div>
  );
}
