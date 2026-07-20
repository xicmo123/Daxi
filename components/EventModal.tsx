"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { HeroSlide } from "./HeroCarousel";
import PlaceholderIcon from "./PlaceholderIcon";

const phaseLabel: Record<string, string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

const badgeLabel: Record<string, string> = {
  route: "交通管制",
  live: "陸續更新",
};

export default function EventModal({ slide, onClose }: { slide: HeroSlide; onClose: () => void }) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={slide.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in"
      style={{ background: "rgba(15,13,10,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] card-shadow"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-44 shrink-0">
          {slide.photoSrc ? (
            <Image
              src={slide.photoSrc}
              alt={slide.title}
              fill
              sizes="(max-width: 448px) 100vw, 420px"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(0.97)" }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 60%, #0f0d0a 100%)",
              }}
            >
              <PlaceholderIcon kind="event" />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(15,13,10,0.1) 0%, rgba(15,13,10,0.55) 100%)" }}
          />
          <button
            onClick={onClose}
            aria-label="關閉"
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "rgba(15,13,10,0.4)", color: "#fff" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          {slide.photoHistorical ? (
            <span className="absolute left-3 top-3 text-[10px] text-white/85 rounded-full px-2 py-0.5 bg-black/30">
              示意圖・舊照
            </span>
          ) : null}
          <span className="absolute left-4 bottom-3 font-serif font-semibold text-[15px] text-white">{slide.date}</span>
        </div>

        <div className="p-6">
          <div
            className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 mb-4"
            style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: slide.phase === "upcoming" ? "var(--ink)" : "var(--ink-soft)" }}
            />
            {phaseLabel[slide.phase]}
          </div>

          <h3 className="font-serif text-xl font-semibold mb-3">
            {slide.title}
            {slide.badges?.map((b) => (
              <span
                key={b}
                className="ml-2 text-[10.5px] font-normal rounded-full px-2 py-0.5 align-middle"
                style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
              >
                {badgeLabel[b]}
              </span>
            ))}
          </h3>

          <div className="flex items-start gap-2.5 mb-4">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="mt-0.5 shrink-0"
              style={{ color: "var(--ink-soft)" }}
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            <div>
              <div className="text-[10.5px] tracking-[0.15em] uppercase mb-0.5" style={{ color: "var(--ink-soft)" }}>
                活動時間
              </div>
              <div className="text-[13.5px] font-medium" style={{ color: "var(--ink)" }}>
                {slide.date}
                {slide.time ? `・${slide.time}` : ""}
              </div>
            </div>
          </div>

          {slide.history || slide.theme ? (
            <div
              className="mb-4 pl-3.5 py-0.5"
              style={{ borderLeft: "2px solid var(--line)" }}
            >
              <div className="text-[10.5px] tracking-[0.15em] uppercase mb-1" style={{ color: "var(--ink-soft)" }}>
                {slide.history ? "歷史沿革" : "活動主軸"}
              </div>
              <p className="font-serif text-[13.5px] leading-relaxed" style={{ color: "var(--ink)" }}>
                {slide.history ?? slide.theme}
              </p>
            </div>
          ) : null}

          <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: "var(--ink-soft)" }}>
            {slide.desc}
          </p>
          {slide.ctaUrl ? (
            <a
              href={slide.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-medium transition-opacity active:opacity-60"
              style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink)" }}
            >
              {slide.ctaLabel ?? "了解更多 →"}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
