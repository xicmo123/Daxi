import PageHeader from "@/components/PageHeader";
import EventTimeline from "@/components/EventTimeline";
import { festival, eventMilestones } from "@/lib/data";

export default function EventsPage() {
  return (
    <div className="pt-2">
      <PageHeader title={festival.name} subtitle={`活動期間 7/18–8/6・主題「${festival.theme}」`} />
      <EventTimeline />
      <div className="px-6 pb-2 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        資料來源：
        <a href={festival.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          大溪大禧 Daxidaxi 官方網站
        </a>
        （逐日詳細場次以官方公告為準）
      </div>
      <div className="px-6 pb-8 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        圖片來源：Wikimedia Commons（CC BY-SA），攝影：
        {eventMilestones.map((item, i) => (
          <span key={item.date}>
            {i > 0 ? "、" : " "}
            <a href={item.photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {item.title} - {item.photo.author}
            </a>
          </span>
        ))}
        。普濟堂聖誕慶典照片攝於 2012 年，僅供示意。
      </div>
    </div>
  );
}
