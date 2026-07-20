"use client";

import { useState } from "react";
import { liveCams } from "@/lib/data";

export default function LiveCams() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cam = liveCams[active];

  return (
    <div>
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
        {liveCams.map((c, i) => (
          <button
            key={c.youtubeId}
            onClick={() => {
              setActive(i);
              setPlaying(false);
            }}
            aria-pressed={i === active}
            className="shrink-0 text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 transition-transform active:scale-95"
            style={
              i === active
                ? { background: "var(--accent)", color: "var(--accent-fg)" }
                : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="px-6">
        <div
          className="relative w-full overflow-hidden rounded-2xl card-shadow"
          style={{ aspectRatio: "16 / 9", background: "#000" }}
        >
          {playing ? (
            <iframe
              key={cam.youtubeId}
              src={`https://www.youtube.com/embed/${cam.youtubeId}?autoplay=1&mute=1`}
              title={`${cam.title} 即時影像`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              aria-label={`播放 ${cam.title} 即時影像`}
              className="absolute inset-0 w-full h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${cam.youtubeId}/hqdefault.jpg`}
                alt={`${cam.title} 即時影像縮圖`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "sepia(0.05) saturate(0.85) contrast(0.97)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(15,17,22,0.15) 0%, rgba(15,17,22,0.45) 100%)" }}
              />
              <span
                className="absolute inset-0 m-auto flex items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-95"
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
                  <path d="M8 5v14l11-7Z" />
                </svg>
              </span>
              <span
                className="absolute left-3 bottom-3 text-[12px] font-medium text-white rounded-full px-3 py-1"
                style={{
                  background: "rgba(15,17,22,0.35)",
                  backdropFilter: "blur(8px)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {cam.location}
              </span>
            </button>
          )}
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
