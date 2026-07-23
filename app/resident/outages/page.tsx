import PageHeader from "@/components/PageHeader";
import { listUpcomingOutages, type Outage } from "@/lib/outages";

export const dynamic = "force-dynamic";

const outageTypeLabel: Record<Outage["type"], string> = { water: "停水", power: "停電" };

export default async function OutagesPage() {
  const outages = await listUpcomingOutages();

  return (
    <div className="pt-2">
      <PageHeader title="停水停電通知" subtitle="影響大溪區的預告性停水停電" tint="river" />

      <div className="safe-page-x pb-10 fade-in">
        <div
          className="mb-4 rounded-xl px-4 py-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--river-teal-soft)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
        >
          即時串接台灣自來水公司停水公告與台灣電力公司計畫性工作停電資料，僅篩選影響大溪區的項目；正式時間與範圍仍以官方公告為準。
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
                    style={{
                      background: o.type === "water" ? "var(--river-teal-soft)" : "var(--daxi-red-soft)",
                      color: o.type === "water" ? "var(--river-teal)" : "var(--daxi-red)",
                    }}
                  >
                    {outageTypeLabel[o.type]}
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
