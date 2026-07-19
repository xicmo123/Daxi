import PageHeader from "@/components/PageHeader";
import { parkingLots } from "@/lib/data";
import { statusStyle } from "@/lib/status";

export default function ParkingPage() {
  return (
    <div className="max-w-md mx-auto pt-2">
      <PageHeader title="周邊停車" subtitle="最後更新：14 分鐘前" />
      <div className="px-5 flex flex-col gap-3 pb-8">
        {parkingLots.map((lot) => {
          const style = statusStyle[lot.status];
          return (
            <div
              key={lot.name}
              className="rounded-2xl card-shadow p-4 flex items-center gap-3.5"
              style={{ background: "var(--card)", border: "1px solid var(--line)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: style.bg, color: style.fg }}
              >
                {lot.pct}%
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold mb-0.5 truncate">{lot.name}</div>
                <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                  {lot.meta}
                </div>
              </div>
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0"
                style={{ background: style.bg, color: style.fg }}
              >
                {lot.statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
