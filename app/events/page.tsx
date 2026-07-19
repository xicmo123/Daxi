import PageHeader from "@/components/PageHeader";
import EventTimeline from "@/components/EventTimeline";

export default function EventsPage() {
  return (
    <div className="max-w-md mx-auto pt-2">
      <PageHeader
        title="大溪大禧"
        subtitle="普濟堂 → 中山路 → 和平路老街 → 中央路"
      />
      <EventTimeline />
    </div>
  );
}
