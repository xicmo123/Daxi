"use client";

import { useState } from "react";
import LiveCams from "@/components/LiveCams";
import RoadCctvLive from "@/components/RoadCctvLive";
import type { RoadCctvFeed } from "@/lib/tdxRoadCctv";

type LiveMode = "road" | "scenic";

export default function LiveModeSwitcher({ roadFeed, roadError }: { roadFeed: RoadCctvFeed | null; roadError?: string }) {
  const [mode, setMode] = useState<LiveMode>("road");

  return (
    <div className="fade-in">
      <div className="safe-page-x pt-1 pb-4">
        <div className="rounded-3xl border p-2" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "road" as const, label: "道路 CCTV", desc: "大溪路況" },
              { id: "scenic" as const, label: "景點直播", desc: "老街景點" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-pressed={mode === item.id}
                className="rounded-2xl px-3 py-3 text-left transition-transform active:scale-[0.98]"
                style={{
                  background: mode === item.id ? "var(--river-teal)" : "transparent",
                  color: mode === item.id ? "#fff" : "var(--ink)",
                }}
              >
                <span className="block text-[13px] font-bold">{item.label}</span>
                <span className="mt-0.5 block text-[11px]" style={{ color: mode === item.id ? "rgba(255,255,255,0.76)" : "var(--ink-soft)" }}>
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === "road" ? (
        <>
          <div className="px-6 pb-4">
            <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Road Live
            </div>
            <h2 className="font-serif text-[17px] font-semibold">大溪道路 CCTV</h2>
          </div>
          <RoadCctvLive feed={roadFeed} error={roadError} />
        </>
      ) : (
        <>
          <div className="px-6 pb-4">
            <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Scenic Live
            </div>
            <h2 className="font-serif text-[17px] font-semibold">景點直播</h2>
          </div>
          <LiveCams />
        </>
      )}
    </div>
  );
}
