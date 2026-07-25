"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import type { Outage } from "@/lib/outages";
import { readResidentArea, subscribeResidentArea } from "@/lib/residentArea";

const outageTypeLabel: Record<Outage["type"], string> = { water: "停水", power: "停電" };

const badgeStyle: Record<string, { background: string; color: string }> = {
  outage: { background: "var(--river-teal-soft)", color: "var(--river-teal)" },
  lowPressure: { background: "var(--cognac-tint)", color: "var(--cognac-deep)" },
  power: { background: "var(--daxi-red-soft)", color: "var(--daxi-red)" },
};

function emptyArea() {
  return "";
}

function OutageCard({ o, highlighted }: { o: Outage; highlighted: boolean }) {
  const isPower = o.type === "power";
  const iconStyle = isPower ? badgeStyle.power : o.severity === "lowPressure" ? badgeStyle.lowPressure : badgeStyle.outage;
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-4 border card-shadow"
      style={{ background: "var(--card)", borderColor: highlighted ? "var(--river-teal)" : "var(--line)" }}
    >
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: iconStyle.background, color: iconStyle.color }} aria-hidden>
        {isPower ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3 5.5 13.5h4.8L11 21l7.5-10.5h-4.8L13 3Z" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c3.5 4.2 6 7.6 6 10.8A6 6 0 0 1 6 13.8C6 10.6 8.5 7.2 12 3Z" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10.5px] font-semibold rounded-full px-2.5 py-1" style={iconStyle}>
            {o.type === "water" && o.severity === "lowPressure" ? "水壓降低" : outageTypeLabel[o.type]}
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
            {o.date}・{o.timeRange}
          </span>
          {highlighted ? (
            <span className="text-[10.5px] font-semibold rounded-full px-2 py-0.5" style={{ background: "var(--river-teal)", color: "#fff" }}>
              與你相關
            </span>
          ) : null}
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
    </div>
  );
}

export default function OutagesList({ outages }: { outages: Outage[] }) {
  const area = useSyncExternalStore(subscribeResidentArea, readResidentArea, emptyArea);

  const { matched, rest } = useMemo(() => {
    const keyword = area.trim();
    if (!keyword) return { matched: [] as Outage[], rest: outages };
    const matched: Outage[] = [];
    const rest: Outage[] = [];
    for (const o of outages) {
      const inArea = o.areas.some((a) => a.includes(keyword) || keyword.includes(a));
      (inArea ? matched : rest).push(o);
    }
    return { matched, rest };
  }, [outages, area]);

  if (outages.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-10 text-center" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
        <div
          className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
          aria-hidden
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          目前沒有預告中的停水停電
        </div>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          有新公告會顯示在這裡。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matched.length > 0 ? (
        <>
          {matched.map((o) => (
            <OutageCard key={o.id} o={o} highlighted />
          ))}
          <div className="h-px my-1" style={{ background: "var(--line)" }} aria-hidden />
        </>
      ) : null}
      {rest.map((o) => (
        <OutageCard key={o.id} o={o} highlighted={false} />
      ))}
    </div>
  );
}
