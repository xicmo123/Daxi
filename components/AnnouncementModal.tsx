"use client";

import { useEffect } from "react";
import type { Announcement } from "@/lib/announcements";

// Tapping an announcement used to jump straight to the government site in
// a new tab — no way to preview what it said first. This shows the
// excerpt we already fetched and only hands off to the official page if
// the resident explicitly asks for the full text.
export default function AnnouncementModal({
  item,
  onClose,
  tint = "var(--river-teal)",
  tintSoft = "var(--river-teal-soft)",
}: {
  item: Announcement | null;
  onClose: () => void;
  tint?: string;
  tintSoft?: string;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 fade-in sm:items-center sm:p-6"
      style={{ background: "rgba(15,13,10,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl px-5 pb-6 pt-4 sm:rounded-3xl"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-float)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-wide" style={{ background: tintSoft, color: tint }}>
            官方公告
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {item.date ? (
          <div className="text-[11.5px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
            {item.date}
          </div>
        ) : null}

        <h2 className="text-[16.5px] font-bold leading-snug" style={{ color: "var(--ink)" }}>
          {item.title}
        </h2>

        {item.summary ? (
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {item.summary}
          </p>
        ) : null}

        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-[13.5px] font-semibold transition-opacity active:opacity-70"
          style={{ background: tint, color: "#fff" }}
        >
          查看完整公告
          <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}
