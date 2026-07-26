"use client";

import PageHeaderT from "@/components/PageHeaderT";
import { useT } from "@/lib/i18n";

function LotSkeleton() {
  return (
    <div className="flex items-center justify-between gap-5 py-6" style={{ borderBottom: "1px solid var(--line)" }}>
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="h-4 w-1/2 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-3 w-1/3 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-2.5 w-2/3 rounded skeleton" style={{ background: "var(--line)" }} />
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="h-7 w-12 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-2.5 w-16 rounded skeleton" style={{ background: "var(--line)" }} />
      </div>
    </div>
  );
}

export default function Loading() {
  const t = useT();
  return (
    <div className="pt-2">
      <PageHeaderT titleKey="parkingTitle" subtitleKey="parkingSubtitleOk" tint="river" />
      <div className="flex flex-col items-center gap-2 py-6">
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 6" />
          <g className="orbit-car-track" style={{ transform: "translate(36px, 8px)" }}>
            <rect x="-8" y="-5" width="16" height="9" rx="3" fill="var(--river-teal)" />
          </g>
        </svg>
        <div className="text-[12px] font-medium" style={{ color: "var(--ink-soft)" }}>
          {t("findingParkingLabel")}
        </div>
      </div>
      <div className="px-6 pb-10" style={{ borderTop: "1px solid var(--line)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <LotSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
