"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import BusMap from "@/components/BusMap";

export default function BusModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0 pt-10 sm:items-center sm:px-4" role="dialog" aria-modal="true" aria-labelledby="bus-map-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="關閉客運資訊" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl" style={{ background: "var(--paper)" }}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
              客運資訊
            </div>
            <h2 id="bus-map-title" className="text-[15px] font-black leading-tight" style={{ color: "var(--ink)" }}>
              即時公車位置
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink)" }}
            aria-label="關閉"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <BusMap compact />
        </div>
      </div>
    </div>,
    document.body,
  );
}
