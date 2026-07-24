"use client";

import { useState } from "react";
import type { Announcement } from "@/lib/announcements";
import AnnouncementModal from "./AnnouncementModal";

export default function ResidentAnnouncementPreview({ items }: { items: Announcement[] }) {
  const [selected, setSelected] = useState<Announcement | null>(null);

  return (
    <>
      <div className="safe-page-x flex flex-col gap-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-opacity active:opacity-70"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
          >
            <span
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(215,160,107,0.22)", color: "var(--block-wood-deep)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
                <path d="M4.8 20.2h14.4" />
                <path d="M9.2 8h5.6M9.2 11.2h5.6M9.2 14.4h3.4" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                {item.title}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {item.date}
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnnouncementModal
        item={selected}
        onClose={() => setSelected(null)}
        tint="var(--block-wood-deep)"
        tintSoft="rgba(215,160,107,0.22)"
      />
    </>
  );
}
