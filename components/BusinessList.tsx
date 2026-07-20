"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { businesses, type BusinessTag } from "@/lib/businesses";

const TABS: { label: string; value: BusinessTag | "全部" }[] = [
  { label: "全部", value: "全部" },
  { label: "美食", value: "美食" },
  { label: "景點", value: "景點" },
  { label: "市集", value: "市集" },
];

function isBusinessTag(value: string | null): value is BusinessTag {
  return value === "美食" || value === "景點" || value === "市集";
}

export default function BusinessList() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");
  const [active, setActive] = useState<BusinessTag | "全部">(isBusinessTag(initialCat) ? initialCat : "全部");
  const rows = active === "全部" ? businesses : businesses.filter((b) => b.tag === active);

  return (
    <div>
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            aria-pressed={active === tab.value}
            className="shrink-0 text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 transition-transform active:scale-95"
            style={
              active === tab.value
                ? { background: "var(--bordeaux)", color: "#fff" }
                : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-6 pb-10 fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {rows.map((b, i) => (
          <a
            key={b.placeId}
            href={b.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-5 py-6 transition-opacity active:opacity-60"
            style={{
              borderBottom: "1px solid var(--line)",
              animationDelay: `${Math.min(i, 6) * 40}ms`,
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-serif mb-1.5 truncate" style={{ color: "var(--ink)" }}>
                {b.name}
              </div>
              <div className="text-[12px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                距老街 {b.distanceLabel}
                {b.rating !== null ? (
                  <>
                    {" "}
                    ・{b.rating.toFixed(1)} ★（{b.reviewCount.toLocaleString()} 則評論）
                  </>
                ) : null}
              </div>
              {b.address ? (
                <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                  {b.address}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
                導航
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
              <span className="text-[10.5px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                {b.tag}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
