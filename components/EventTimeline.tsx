"use client";

import { useState } from "react";
import { eventDays } from "@/lib/data";

export default function EventTimeline() {
  const [activeDay, setActiveDay] = useState(eventDays[1].id);
  const day = eventDays.find((d) => d.id === activeDay) ?? eventDays[0];

  return (
    <div>
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar" role="tablist">
        {eventDays.map((d) => {
          const active = d.id === activeDay;
          return (
            <button
              key={d.id}
              role="tab"
              onClick={() => setActiveDay(d.id)}
              aria-selected={active}
              className="text-[13px] rounded-full px-3.5 py-1.5 shrink-0 whitespace-nowrap"
              style={{
                background: active ? "var(--ink)" : "var(--card)",
                color: active ? "var(--paper)" : "var(--ink-soft)",
                border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="px-5 flex flex-col gap-3 pb-8">
        {day.items.map((item) => (
          <div
            key={item.time}
            className="rounded-2xl card-shadow p-4 flex gap-4"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <div className="font-serif font-semibold text-[14px] w-11 shrink-0 pt-0.5" style={{ color: "var(--cognac-deep)" }}>
              {item.time}
            </div>
            <div className="min-w-0">
              <h4 className="text-[14.5px] font-semibold mb-1">
                {item.title}
                {item.badges?.map((b) => (
                  <span
                    key={b}
                    className="ml-1.5 text-[10.5px] font-semibold rounded-full px-2 py-0.5 align-middle"
                    style={
                      b === "live"
                        ? { background: "var(--bordeaux-tint)", color: "var(--bordeaux)" }
                        : { background: "var(--cognac-tint)", color: "var(--cognac-deep)" }
                    }
                  >
                    {b === "live" ? "進行中" : "交通管制"}
                  </span>
                ))}
              </h4>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
