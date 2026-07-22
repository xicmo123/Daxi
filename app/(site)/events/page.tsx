import PageHeader from "@/components/PageHeader";
import EventsList from "@/components/EventsList";
import { readSlides } from "@/lib/carousel";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const slides = await readSlides();
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
    photoSrc: event.photo?.src,
    photoHistorical: event.photo?.historical,
  }));

  return (
    <div className="pt-2">
      <PageHeader title="活動" subtitle="大溪大禧與老街周邊活動" />
      <EventsList events={events} />
    </div>
  );
}
