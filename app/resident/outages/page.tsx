import PageHeader from "@/components/PageHeader";
import { listUpcomingOutages, type Outage } from "@/lib/outages";

export const dynamic = "force-dynamic";

const outageTypeLabel: Record<Outage["type"], string> = { water: "停水", power: "停電" };

const badgeStyle: Record<string, { background: string; color: string }> = {
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
      <PageHeader title="民生示警看板" subtitle="影響大溪區的停水、降壓、停電預告" tint="river" />

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

        {outages.length === 0 ? (
          <div className="rounded-xl px-5 py-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
            <div className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
              目前沒有預告中的停水停電
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              有新公告會顯示在這裡。
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {outages.map((o) => (
              <div key={o.id} className="rounded-2xl px-4 py-4 border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10.5px] font-semibold rounded-full px-2.5 py-1"
                    style={
                      o.type === "power"
                        ? badgeStyle.power
                        : o.severity === "lowPressure"
                          ? badgeStyle.lowPressure
                          : badgeStyle.outage
                    }
                  >
                    {o.type === "water" && o.severity === "lowPressure" ? "水壓降低" : outageTypeLabel[o.type]}
                  </span>
                  <span className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                    {o.date}・{o.timeRange}
                  </span>
                </div>
                <div className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
                  {o.areas.join("、")}
                </div>
                <div className="text-[12.5px] mt-1" style={{ color: "var(--ink-soft)" }}>
                  {o.reason}
                </div>
                <div className="text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>
                  資料來源：{o.source}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
