"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const phaseLabel: Record<string, string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export type HeroSlide = {
  key: string;
  phase: "past" | "ongoing" | "upcoming";
  date: string;
  title: string;
  desc: string;
  photoSrc?: string;
};

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {slides.map((s) => (
          <div key={s.key} className="w-full shrink-0 snap-center px-6">
            <div
              className="rounded-[22px] card-shadow overflow-hidden relative h-[300px] p-6 flex flex-col justify-end"
              style={{ color: "#f4ece2" }}
            >
              {s.photoSrc ? (
                <Image
                  src={s.photoSrc}
                  alt={s.title}
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
                />
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
                  className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 mb-3"
                  style={{ background: "rgba(244,236,226,0.14)", border: "1px solid rgba(244,236,226,0.3)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.phase === "upcoming" ? "var(--cognac-tint)" : "rgba(241,228,211,0.5)" }}
                  />
                  {s.date}・{phaseLabel[s.phase]}
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2.5">{s.title}</h3>
                <p
                  className="text-[13px] leading-relaxed mb-5"
                  style={{
                    color: "rgba(242,239,233,0.78)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.desc}
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium rounded-full px-4 py-2 transition-opacity active:opacity-70"
                  style={{ border: "1px solid rgba(242,239,233,0.4)", color: "#f2efe9" }}
                >
                  查看完整時程 →
                </Link>
              </div>
            </div>
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
    </div>
  );
}
