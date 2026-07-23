"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import EventModal from "./EventModal";
import PlaceholderIcon from "./PlaceholderIcon";

const phaseLabel: Record<string, string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export type HeroSlide = {
  key: string;
  phase: "past" | "ongoing" | "upcoming";
  date: string;
  time: string;
  title: string;
  desc: string;
  history?: string;
  theme?: string;
  badges?: ("route" | "live")[];
  ctaLabel?: string;
  ctaUrl?: string;
  photoSrc?: string;
  photoHistorical?: boolean;
};

export default function HeroCarousel({ slides, initialIndex = 0 }: { slides: HeroSlide[]; initialIndex?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(initialIndex);
  const [openSlide, setOpenSlide] = useState<HeroSlide | null>(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Jump straight to today's or the ongoing milestone during the festival,
  // instead of always opening on the (often already-past) first slide.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || initialIndex === 0) return;
    el.scrollLeft = initialIndex * el.clientWidth;
  }, [initialIndex]);

  // Auto-advance every 3s; paused while the detail modal is open.
  useEffect(() => {
    if (slides.length <= 1 || openSlide) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length, openSlide]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {slides.map((s) => (
          <div key={s.key} className="w-full shrink-0 snap-center safe-page-x">
            <button
              onClick={() => setOpenSlide(s)}
              className="relative flex h-[215px] w-full flex-col justify-end overflow-hidden rounded-[22px] p-5 text-left transition-opacity active:opacity-90 card-shadow sm:h-[260px] lg:h-[340px] lg:p-7"
              style={{ color: "#f4ece2" }}
            >
              {s.photoSrc ? (
                <Image
                  src={s.photoSrc}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 1024px"
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
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,13,10,0.15) 0%, rgba(15,13,10,0.1) 35%, rgba(15,13,10,0.88) 100%)",
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 mb-2"
                  style={{ background: "rgba(244,236,226,0.14)", border: "1px solid rgba(244,236,226,0.3)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.phase === "upcoming" ? "var(--cognac-tint)" : "rgba(241,228,211,0.5)" }}
                  />
                  {s.date}・{phaseLabel[s.phase]}
                </div>
                <h3 className="font-serif text-lg font-semibold mb-1.5 sm:text-2xl lg:text-[30px]">{s.title}</h3>
                <p
                  className="text-[12.5px] leading-snug mb-3"
                  style={{
                    color: "rgba(242,239,233,0.78)",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium rounded-full px-3.5 py-1.5"
                  style={{ border: "1px solid rgba(242,239,233,0.4)", color: "#f2efe9" }}
                >
                  查看詳情 →
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 pt-3">
        {slides.map((s, i) => (
          <span
            key={s.key}
            className="h-[5px] rounded-full transition-all duration-300"
            style={{ width: i === active ? 16 : 5, background: i === active ? "var(--ink)" : "var(--line)" }}
          />
        ))}
      </div>

      {openSlide ? <EventModal slide={openSlide} onClose={() => setOpenSlide(null)} /> : null}
    </div>
  );
}
