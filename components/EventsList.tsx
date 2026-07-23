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

const filters: { label: string; value: HeroSlide["phase"] | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "進行中", value: "ongoing" },
  { label: "即將登場", value: "upcoming" },
  { label: "已結束", value: "past" },
];

export default function EventsList({ events }: { events: HeroSlide[] }) {
  const [openEvent, setOpenEvent] = useState<HeroSlide | null>(null);
  const [activeFilter, setActiveFilter] = useState<HeroSlide["phase"] | "all">("all");
  const filteredEvents = activeFilter === "all" ? events : events.filter((event) => event.phase === activeFilter);
  const sections = filters
    .filter((filter) => filter.value !== "all")
    .map((filter) => ({
      title: filter.label,
      value: filter.value,
      rows: filteredEvents.filter((event) => event.phase === filter.value),
    }))
    .filter((section) => (activeFilter === "all" ? section.rows.length > 0 : section.value === activeFilter));

  return (
    <div className="safe-page-x pb-10 fade-in">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className="shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-transform active:scale-95"
            style={
              activeFilter === filter.value
                ? { background: "var(--accent)", color: "var(--accent-fg)" }
                : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-7">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="font-serif text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
                {section.title}
              </h2>
              <span className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                {section.rows.length} 個活動
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {section.rows.map((event) => (
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      <h3 className="font-serif text-[22px] font-semibold leading-tight" style={{ color: "#f4ece2" }}>
                        {event.title}
                      </h3>
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
          </section>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center text-[13px]" style={{ color: "var(--ink-soft)" }}>
          目前沒有{activeFilter === "all" ? "" : phaseLabel[activeFilter]}活動
        </div>
      ) : null}

      {openEvent ? <EventModal slide={openEvent} onClose={() => setOpenEvent(null)} /> : null}
    </div>
  );
}
