"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function AboutModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="關於"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 fade-in sm:p-5"
      style={{ background: "rgba(15,13,10,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[22px] card-shadow p-6"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold" style={{ color: "var(--ink)" }}>
            關於大溪通
          </h3>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--ink)" }}>
          此 app 非政府相關單位開發，僅為熱愛大溪的居民自行開發的系統，想為大溪盡一份力。
        </p>
        <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: "var(--ink)" }}>
          歡迎大家提供活動／景點照片，相關合作訊息可參考下方聯絡資訊。
        </p>

        <div className="rounded-2xl px-4 py-3" style={{ background: "var(--paper-2)" }}>
          <div className="text-[10.5px] tracking-[0.15em] uppercase mb-1" style={{ color: "var(--ink-soft)" }}>
            聯絡資訊
          </div>
          <a href="mailto:xicmo123@gmail.com" className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
            xicmo123@gmail.com
          </a>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
