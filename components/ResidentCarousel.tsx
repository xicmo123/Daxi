"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResidentCarouselSlide } from "@/lib/residentCarousel";

const tagStyle: Record<ResidentCarouselSlide["tag"], { bg: string; fg: string }> = {
  一般: { bg: "var(--river-teal-soft)", fg: "var(--river-teal)" },
  緊急: { bg: "var(--daxi-red-soft)", fg: "var(--daxi-red)" },
  活動: { bg: "rgba(111,169,155,0.18)", fg: "var(--status-ok)" },
};

const ROTATE_MS = 4500;

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
      className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-opacity active:opacity-70"
      style={{ background: "var(--card)", borderColor: "var(--line)" }}
    >
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
