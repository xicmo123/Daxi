"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResidentCarouselSlide } from "@/lib/residentCarousel";
import type { ResidentFeatureKey } from "@/lib/residentFeatures";

const tagStyle: Record<ResidentCarouselSlide["tag"], { bg: string; fg: string }> = {
  一般: { bg: "var(--river-teal-soft)", fg: "var(--river-teal)" },
  緊急: { bg: "var(--daxi-red-soft)", fg: "var(--daxi-red)" },
  活動: { bg: "rgba(111,169,155,0.18)", fg: "var(--status-ok)" },
};

// Small monoline glyphs so each rotating slide is recognizable at a
// glance instead of relying on the title text alone — keyed by the
// resident feature it links to (custom slides fall back to a dot). Each
// carries its own block color so the carousel reads as lively/varied
// instead of one flat neutral tone for every slide.
const featureIcon: Partial<Record<ResidentFeatureKey, { icon: React.ReactNode; color: string }>> = {
  roadworks: {
    color: "var(--block-river)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19h14" />
        <path d="M7.5 19 10 7h4l2.5 12" />
        <path d="M9 12h6" />
      </svg>
    ),
  },
  outages: {
    color: "var(--daxi-red)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z" />
      </svg>
    ),
  },
  garbage: {
    color: "var(--block-moss)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7.5h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.4h-7a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" />
        <path d="M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
        <path d="M4.5 7.5h15" />
      </svg>
    ),
  },
  announcements: {
    color: "var(--block-wood-deep)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
        <path d="M4.8 20.2h14.4" />
        <path d="M9.2 8h5.6M9.2 11.2h5.6M9.2 14.4h3.4" />
      </svg>
    ),
  },
  emergency: {
    color: "var(--daxi-red)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z" />
      </svg>
    ),
  },
  links: {
    color: "var(--block-wood-deep)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.2 13.8a3.4 3.4 0 0 0 4.8 0l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8l-1.3 1.3" />
        <path d="M13.8 10.2a3.4 3.4 0 0 0-4.8 0l-2.6 2.6a3.4 3.4 0 0 0 4.8 4.8l1.3-1.3" />
      </svg>
    ),
  },
};

function SlideIcon({ featureKey }: { featureKey?: ResidentFeatureKey }) {
  const entry = featureKey ? featureIcon[featureKey] : undefined;
  return (
    <span
      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: entry?.color ?? "var(--paper-2)", color: entry ? "#fff" : "var(--ink-soft)" }}
    >
      {entry ? (
        <span className="w-[17px] h-[17px] block">{entry.icon}</span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full block" style={{ background: "currentColor" }} />
      )}
    </span>
  );
}

const ROTATE_MS = 4000;

// The "長條輪播" — a slim auto-rotating banner strip, admin-editable via
// /admin (大溪人管理 → 首頁輪播), distinct from the tourist HeroCarousel's
// big photo cards since this is meant for short text announcements.
export default function ResidentCarousel({ slides }: { slides: ResidentCarouselSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index % slides.length];
  const style = tagStyle[slide.tag];

  const content = (
    <div
      className="flex min-h-[74px] items-center gap-3 rounded-2xl px-4 py-3.5 transition-opacity active:opacity-70"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
    >
      <SlideIcon featureKey={slide.kind === "feature" ? slide.featureKey : undefined} />
      <span className="shrink-0 text-[10.5px] font-semibold rounded-full px-2.5 py-1" style={{ background: style.bg, color: style.fg }}>
        {slide.tag}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
          {slide.title}
        </span>
        {slide.subtitle ? (
          <span className="block text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
            {slide.subtitle}
          </span>
        ) : null}
      </span>
      {slides.length > 1 ? (
        <span className="shrink-0 flex items-center gap-1" aria-hidden>
          {slides.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === index ? 12 : 4,
                height: 4,
                background: i === index ? "var(--river-teal)" : "var(--line)",
              }}
            />
          ))}
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="safe-page-x pt-4 fade-in">
      {slide.href ? <Link href={slide.href}>{content}</Link> : content}
    </div>
  );
}
