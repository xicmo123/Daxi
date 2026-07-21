import PageHeader from "@/components/PageHeader";
import LiveCams from "@/components/LiveCams";
import { trafficAlerts } from "@/lib/data";

const alertDot: Record<string, string> = {
  block: "var(--bordeaux)",
  warn: "var(--cognac-deep)",
  info: "var(--cognac)",
};

export default function RoadConditionsPage() {
  return (
    <div className="pt-2">
      <PageHeader title="路況" subtitle="大溪區・即時影像與交通管制" />

      <div className="px-6 pt-1 pb-4 fade-in">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          Live
        </div>
        <h2 className="font-serif text-[17px] font-semibold">即時影像</h2>
      </div>
      <div className="fade-in">
        <LiveCams />
      </div>

      <div className="px-6 pt-10 pb-4">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          Alerts
        </div>
        <h2 className="font-serif text-[17px] font-semibold">交通管制公告</h2>
      </div>
      <div className="px-6 fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {trafficAlerts.map((a) => (
          <div key={a.title} className="flex gap-3.5 py-5" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: alertDot[a.level] }} />
            <div>
              <div className="text-[13.5px] font-medium mb-1">{a.title}</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {a.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 pt-4 pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。
      </div>
    </div>
  );
}
