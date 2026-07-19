"use client";

import { useState } from "react";
import { liveCams } from "@/lib/data";

export default function LiveCams() {
  const [active, setActive] = useState(0);
  const cam = liveCams[active];

  return (
    <div>
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
        {liveCams.map((c, i) => (
          <button
            key={c.youtubeId}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className="shrink-0 text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 transition-transform active:scale-95"
            style={
              i === active
                ? { background: "var(--bordeaux)", color: "#fff" }
                : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="px-5">
        <div
          className="relative w-full overflow-hidden rounded-2xl card-shadow"
          style={{ aspectRatio: "16 / 9", background: "#000" }}
        >
          <iframe
            key={cam.youtubeId}
            src={`https://www.youtube.com/embed/${cam.youtubeId}?autoplay=1&mute=1`}
            title={`${cam.title} 即時影像`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
            {cam.location}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${cam.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] underline"
            style={{ color: "var(--ink-soft)" }}
          >
            在 YouTube 開啟
          </a>
        </div>
      </div>
    </div>
  );
}
