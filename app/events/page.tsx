import PageHeader from "@/components/PageHeader";
import EventTimeline from "@/components/EventTimeline";
import { festival } from "@/lib/data";

export default function EventsPage() {
  return (
    <div className="max-w-md mx-auto pt-2">
      <PageHeader title={festival.name} subtitle={`活動期間 7/18–8/6・主題「${festival.theme}」`} />
      <EventTimeline />
      <div className="px-5 pb-8 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        資料來源：
        <a href={festival.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          大溪大禧 Daxidaxi 官方網站
        </a>
        （逐日詳細場次以官方公告為準）
      </div>
    </div>
  );
}
