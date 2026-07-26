import PageHeaderT from "@/components/PageHeaderT";
import OutagesList from "@/components/OutagesList";
import { listUpcomingOutages } from "@/lib/outages";

export const dynamic = "force-dynamic";

const badgeStyle = {
  outage: { background: "var(--river-teal-soft)", color: "var(--river-teal)" },
  lowPressure: { background: "var(--cognac-tint)", color: "var(--cognac-deep)" },
  power: { background: "var(--daxi-red-soft)", color: "var(--daxi-red)" },
};

export default async function OutagesPage() {
  const outages = await listUpcomingOutages();
  const outageCount = outages.filter((o) => o.type === "water" && o.severity !== "lowPressure").length;
  const lowPressureCount = outages.filter((o) => o.type === "water" && o.severity === "lowPressure").length;
  const powerCount = outages.filter((o) => o.type === "power").length;

  return (
    <div className="pt-2">
      <PageHeaderT titleKey="residentOutagesTitle" subtitleKey="residentOutagesSubtitle" tint="river" />

      <div className="safe-page-x pb-4 fade-in">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "停水", value: outageCount, style: badgeStyle.outage },
            { label: "水壓降低", value: lowPressureCount, style: badgeStyle.lowPressure },
            { label: "停電", value: powerCount, style: badgeStyle.power },
          ].map((item) => (
            <div key={item.label} className="rounded-xl px-3 py-3 text-center" style={{ background: item.style.background }}>
              <div className="text-[20px] font-bold tabular-nums" style={{ color: item.style.color }}>
                {item.value}
              </div>
              <div className="text-[10.5px] font-semibold mt-0.5" style={{ color: item.style.color }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="safe-page-x pb-10 fade-in">
        <div
          className="mb-4 rounded-xl px-4 py-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--river-teal-soft)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
        >
          即時串接台灣自來水公司停水公告與台灣電力公司計畫性工作停電資料，僅篩選影響大溪區的項目；水壓降低由公告文字自動判斷，正式時間與範圍仍以官方公告為準。
        </div>

        <OutagesList outages={outages} />
      </div>
    </div>
  );
}
