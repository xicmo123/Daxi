"use client";

import { useState } from "react";
import Image from "next/image";
import EventModal from "./EventModal";
import PlaceholderIcon from "./PlaceholderIcon";
import type { HeroSlide } from "./HeroCarousel";

const phaseLabel: Record<HeroSlide["phase"], string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export default function EventsList({ events }: { events: HeroSlide[] }) {
  const [openEvent, setOpenEvent] = useState<HeroSlide | null>(null);

  return (
    <div className="px-6 pb-10 fade-in">
      <div className="flex flex-col gap-5">
        {events.map((event) => (
          <button
            key={event.key}
            onClick={() => setOpenEvent(event)}
            className="w-full text-left rounded-[22px] overflow-hidden card-shadow transition-opacity active:opacity-90"
            style={{ background: "var(--card)" }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {event.photoSrc ? (
                <Image
                  src={event.photoSrc}
                  alt={event.title}
                  fill
                  sizes="(max-width: 448px) 100vw, 420px"
                  className="object-cover"
                  style={{ filter: "saturate(0.9) contrast(0.98)" }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 62%, #0f0d0a 100%)",
                  }}
                >
                  <PlaceholderIcon kind="event" />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(15,13,10,0.08) 0%, rgba(15,13,10,0.62) 100%)" }}
              />
              <div className="absolute left-4 right-4 bottom-4">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] mb-2"
                  style={{ background: "rgba(244,236,226,0.15)", border: "1px solid rgba(244,236,226,0.3)", color: "#f4ece2" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: event.phase === "upcoming" ? "var(--cognac-tint)" : "rgba(241,228,211,0.62)" }}
                  />
                  {event.date}・{phaseLabel[event.phase]}
                </div>
                <h2 className="font-serif text-[22px] font-semibold leading-tight" style={{ color: "#f4ece2" }}>
                  {event.title}
                </h2>
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="text-[12px] mb-2" style={{ color: "var(--ink-soft)" }}>
                {event.time ? `${event.date}・${event.time}` : event.date}
              </div>
              <p className="text-[13.5px] leading-relaxed line-clamp-2" style={{ color: "var(--ink)" }}>
                {event.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="py-16 text-center text-[13px]" style={{ color: "var(--ink-soft)" }}>
          目前尚未新增活動
        </div>
      ) : null}

      {openEvent ? <EventModal slide={openEvent} onClose={() => setOpenEvent(null)} /> : null}
    </div>
  );
}
