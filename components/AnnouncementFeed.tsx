"use client";

import { useState } from "react";
import type { Announcement } from "@/lib/announcements";
import AnnouncementModal from "./AnnouncementModal";

// Shared list renderer for both the tourist (/announcements) and resident
// (/resident/announcements) pages — same data, same card layout, just a
// different accent color. Cards open the excerpt modal instead of jumping
// straight to the government site.
export default function AnnouncementFeed({
  items,
  tint,
  tintSoft,
}: {
  items: Announcement[];
  tint: string;
  tintSoft: string;
}) {
  const [selected, setSelected] = useState<Announcement | null>(null);

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="block w-full rounded-xl px-4 py-4 text-left transition-transform active:scale-[0.99]"
            style={{ background: "var(--card)", border: "1px solid var(--line)", boxShadow: "0 14px 34px rgba(58, 45, 33, 0.08)" }}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-wide" style={{ background: tintSoft, color: tint }}>
                官方公告
              </span>
              {item.date ? (
                <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--ink-soft)" }}>
                  {item.date}
                </span>
              ) : null}
            </div>

            <h2 className="text-[16px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
              {item.title}
            </h2>

            {item.summary ? (
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {item.summary}
              </p>
            ) : null}

            <div className="mt-3 text-[12px] font-semibold" style={{ color: tint }}>
              查看摘要
            </div>
          </button>
        ))}
      </div>

      <AnnouncementModal item={selected} onClose={() => setSelected(null)} tint={tint} tintSoft={tintSoft} />
    </>
  );
}
