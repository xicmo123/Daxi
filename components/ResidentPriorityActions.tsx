"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusModal from "@/components/BusModal";
import GarbageTruckMap from "@/components/GarbageTruckMap";

function BusIllustration() {
  return (
    <svg viewBox="0 0 180 132" aria-hidden="true" className="absolute bottom-0 right-0 h-[66px] w-[84px] opacity-90">
      <path d="M16 104c21-34 39-52 64-54 31-3 55 19 84-18" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="8" strokeLinecap="round" />
      <path d="M24 110h124" stroke="rgba(43,36,32,0.18)" strokeWidth="5" strokeLinecap="round" />
      <rect x="50" y="38" width="90" height="52" rx="17" fill="rgba(255,255,255,0.9)" />
      <path d="M63 54h26M101 54h25" stroke="#4a7594" strokeWidth="10" strokeLinecap="round" />
      <path d="M66 74h58" stroke="#2b2420" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="91" r="10" fill="#2b2420" />
      <circle cx="119" cy="91" r="10" fill="#2b2420" />
      <circle cx="72" cy="91" r="4" fill="#d7a06b" />
      <circle cx="119" cy="91" r="4" fill="#d7a06b" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function GarbageIllustration() {
  return (
    <svg viewBox="0 0 88 88" aria-hidden="true" className="absolute bottom-0 right-0 h-[56px] w-[56px] opacity-95">
      <rect x="14" y="35" width="51" height="30" rx="10" fill="rgba(255,255,255,0.86)" />
      <path d="M21 35 30 24h28l9 11" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 44h26M30 53h18" stroke="#4f8478" strokeWidth="5" strokeLinecap="round" />
      <circle cx="27" cy="67" r="6" fill="#2b2420" />
      <circle cx="58" cy="67" r="6" fill="#2b2420" />
      <path d="M65 30h9v23" fill="none" stroke="#2b2420" strokeOpacity="0.28" strokeWidth="5" strokeLinecap="round" />
      <path d="m73 54-8-4v8l8-4Z" fill="#2b2420" fillOpacity="0.28" />
    </svg>
  );
}

function CameraIllustration() {
  return (
    <svg viewBox="0 0 120 78" aria-hidden="true" className="absolute bottom-0 right-0 h-[58px] w-[88px] opacity-95">
      <path d="M10 58c22-18 40-24 58-18 18 7 28 2 42-14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="7" strokeLinecap="round" />
      <rect x="34" y="22" width="47" height="31" rx="9" fill="rgba(255,255,255,0.88)" />
      <path d="m81 32 23-10v31L81 43Z" fill="rgba(255,255,255,0.7)" />
      <circle cx="55" cy="38" r="9" fill="#2b2420" fillOpacity="0.18" />
      <circle cx="55" cy="38" r="4" fill="#4a7594" />
      <path d="M44 58h31" stroke="rgba(43,36,32,0.2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function ResidentPriorityActions() {
  const [showBusMap, setShowBusMap] = useState(false);
  const [showGarbageMap, setShowGarbageMap] = useState(false);

  useEffect(() => {
    if (!showGarbageMap) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowGarbageMap(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showGarbageMap]);

  return (
    <section className="safe-page-x pt-3 fade-in-delay-1" aria-labelledby="resident-priority-title">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
            生活動線
          </div>
          <h2 id="resident-priority-title" className="text-[15px] font-black leading-tight" style={{ color: "var(--ink)" }}>
            出門前先看
          </h2>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>
          即時資訊
        </span>
      </div>

      <div className="mr-5 grid min-w-0 grid-cols-3 gap-1.5 sm:mr-0">
        <button
          type="button"
          onClick={() => setShowBusMap(true)}
          className="group relative block h-[120px] min-w-0 overflow-hidden rounded-[20px] px-2.5 py-3 transition-transform active:scale-[0.98] md:h-[138px]"
          style={{
            background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-moss) 100%)",
            boxShadow: "var(--shadow-float)",
            color: "var(--block-fg)",
          }}
        >
          <BusIllustration />
          <div className="relative z-10 flex h-full flex-col justify-between gap-2">
            <div>
              <div className="mb-1.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.48)" }}>
                客運資訊
              </div>
              <div className="text-[15px] font-black leading-tight">客運在哪</div>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-bold">
              <span className="min-w-0 truncate leading-tight">位置 / 時刻</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "rgba(255,255,255,0.42)" }}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowGarbageMap(true)}
          className="group relative block h-[120px] min-w-0 overflow-hidden rounded-[20px] px-2.5 py-3 text-left transition-transform active:scale-[0.98] md:h-[138px]"
          style={{
            background: "linear-gradient(145deg, var(--block-moss) 0%, var(--block-wood) 100%)",
            boxShadow: "var(--shadow-card)",
            color: "var(--block-fg)",
          }}
        >
          <GarbageIllustration />
          <div className="relative z-10 flex h-full flex-col justify-between gap-2">
            <div className="min-w-0">
              <div className="mb-1.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.5)" }}>
                垃圾清運
              </div>
              <div className="text-[15px] font-black leading-tight">即時清運</div>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-bold">
              <span className="min-w-0 truncate leading-tight">即時位置</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "rgba(255,255,255,0.38)" }}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>

        <Link
          href="/resident/live"
          className="group relative block h-[120px] min-w-0 overflow-hidden rounded-[20px] px-2.5 py-3 transition-transform active:scale-[0.98] md:h-[138px]"
          style={{
            background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-wood) 100%)",
            boxShadow: "var(--shadow-card)",
            color: "var(--block-fg)",
          }}
        >
          <CameraIllustration />
          <div className="relative z-10 flex h-full flex-col justify-between gap-2">
            <div className="min-w-0">
              <div className="mb-1.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.5)" }}>
                即時影像
              </div>
              <div className="text-[15px] font-black leading-tight">先看路況</div>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-bold">
              <span className="min-w-0 truncate leading-tight">CCTV / 景點</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "rgba(255,255,255,0.38)" }}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {showGarbageMap ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0 pt-10 sm:items-center sm:px-4" role="dialog" aria-modal="true" aria-labelledby="garbage-map-title">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="關閉垃圾清運地圖" onClick={() => setShowGarbageMap(false)} />
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl" style={{ background: "var(--paper)" }}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
              <div className="min-w-0">
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
                  垃圾清運
                </div>
                <h2 id="garbage-map-title" className="text-[15px] font-black leading-tight" style={{ color: "var(--ink)" }}>
                  即時清運車
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGarbageMap(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
                aria-label="關閉"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <GarbageTruckMap />
            </div>
          </div>
        </div>
      ) : null}

      {showBusMap ? <BusModal onClose={() => setShowBusMap(false)} /> : null}
    </section>
  );
}
