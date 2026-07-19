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

      <div className="px-5 pt-1 pb-3">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
          Live
        </div>
        <h2 className="font-serif text-[17px] font-semibold">即時影像</h2>
      </div>
      <LiveCams />

      <div className="px-5 pt-6 pb-3">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
          Alerts
        </div>
        <h2 className="font-serif text-[17px] font-semibold">交通管制公告</h2>
      </div>
      <div className="px-5 flex flex-col gap-3">
        {trafficAlerts.map((a) => (
          <div
            key={a.title}
            className="rounded-2xl card-shadow p-4 flex gap-3"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: alertDot[a.level] }} />
            <div>
              <div className="text-[13.5px] font-semibold mb-0.5">{a.title}</div>
              <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                {a.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pt-3 pb-8 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。
      </div>
    </div>
  );
}
