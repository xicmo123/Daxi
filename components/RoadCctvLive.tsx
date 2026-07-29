"use client";

import { useMemo, useState } from "react";
import type { RoadCctvFeed } from "@/lib/tdxRoadCctv";

const EMPTY_CAMERAS: RoadCctvFeed["cameras"] = [];

function formatDateTime(value?: string) {
  if (!value) return "更新時間未提供";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function CameraIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="6.5" width="12" height="10.5" rx="2.2" />
      <path d="M15.5 10 20.5 7.7v8.6L15.5 14Z" />
      <path d="M7.3 18.5 6.5 21" />
      <path d="M12.7 18.5l.8 2.5" />
    </svg>
  );
}

export default function RoadCctvLive({ feed, error }: { feed: RoadCctvFeed | null; error?: string }) {
  const cameras = feed?.cameras ?? EMPTY_CAMERAS;
  const groups = useMemo(() => ["全部", ...Array.from(new Set(cameras.map((camera) => camera.areaGroup)))], [cameras]);
  const [group, setGroup] = useState("全部");
  const filteredCameras = group === "全部" ? cameras : cameras.filter((camera) => camera.areaGroup === group);
  const [activeId, setActiveId] = useState(cameras[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const activeCamera = filteredCameras.find((camera) => camera.id === activeId) ?? filteredCameras[0] ?? cameras[0];

  const chooseGroup = (nextGroup: string) => {
    setGroup(nextGroup);
    const nextCamera = nextGroup === "全部" ? cameras[0] : cameras.find((camera) => camera.areaGroup === nextGroup);
    if (nextCamera) {
      setActiveId(nextCamera.id);
      setPlaying(false);
    }
  };

  const chooseCamera = (cameraId: string) => {
    setActiveId(cameraId);
    setPlaying(false);
  };

  if (error || cameras.length === 0) {
    return (
      <div className="safe-page-x">
        <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--ink)" }}>
            <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
              <CameraIcon />
            </span>
            道路 CCTV 暫時無法載入
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {error ?? "目前沒有可顯示的大溪道路鏡頭，請稍後再試。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="safe-page-x">
        <div className="rounded-3xl overflow-hidden card-shadow" style={{ background: "#0d1719" }}>
          <div className="relative" style={{ aspectRatio: "16 / 9", background: "#050708" }}>
            {playing && activeCamera ? (
              <iframe
                key={activeCamera.id}
                src={activeCamera.streamUrl}
                title={`${activeCamera.title} 道路 CCTV`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`播放 ${activeCamera?.title} 道路 CCTV`}
                className="absolute inset-0 h-full w-full text-left"
              >
                <div className="absolute inset-0 tv-static-skeleton" aria-hidden="true" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(6,12,15,0.18) 0%, rgba(6,12,15,0.72) 100%)" }}
                />
                <span
                  className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{ background: "rgba(255,255,255,0.92)", color: "var(--river-teal)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7Z" />
                  </svg>
                </span>
                <span className="absolute left-4 bottom-4 max-w-[78%]">
                  <span className="block text-[13px] font-bold text-white">{activeCamera?.title}</span>
                  <span className="mt-1 block text-[11px]" style={{ color: "rgba(255,255,255,0.72)" }}>
                    預設靜音，點擊後載入即時道路影像
                  </span>
                </span>
              </button>
            )}
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: "rgba(15,23,42,0.72)" }}>
                LIVE
              </span>
              {playing ? (
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: "rgba(15,23,42,0.45)" }}>
                  靜音播放
                </span>
              ) : null}
            </div>
            {playing ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-[11px] font-medium text-white"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 100%)" }}
              >
                若畫面未播放，可點右下方「開啟」查看原始影像。
              </div>
            ) : null}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.58)" }}>
                  Daxi Road CCTV
                </div>
                <h2 className="mt-1 text-[17px] font-bold leading-tight text-white">{activeCamera?.title}</h2>
                <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>
                  {activeCamera?.location}
                </p>
              </div>
              <a
                href={activeCamera?.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
              >
                開啟
              </a>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "rgba(255,255,255,0.62)" }}>
              <span className="rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                {activeCamera?.areaGroup}
              </span>
              <span>TDX 更新 {formatDateTime(feed?.updateTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-6 pt-4 pb-3 overflow-x-auto no-scrollbar">
        {groups.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => chooseGroup(item)}
            aria-pressed={item === group}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-transform active:scale-95"
            style={
              item === group
                ? { background: "var(--river-teal)", color: "#fff" }
                : { background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink-soft)" }
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="safe-page-x grid grid-cols-1 gap-2.5">
        {filteredCameras.map((camera) => (
          <button
            key={camera.id}
            type="button"
            onClick={() => chooseCamera(camera.id)}
            aria-pressed={camera.id === activeCamera?.id}
            className="flex items-center gap-3 rounded-2xl border p-3 text-left transition-transform active:scale-[0.99]"
            style={{
              background: camera.id === activeCamera?.id ? "var(--river-teal-soft)" : "var(--card)",
              borderColor: camera.id === activeCamera?.id ? "rgba(88, 139, 154, 0.35)" : "var(--line)",
            }}
          >
            <span
              className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center"
              style={{ background: camera.id === activeCamera?.id ? "var(--river-teal)" : "var(--line)", color: camera.id === activeCamera?.id ? "#fff" : "var(--ink-soft)" }}
            >
              <CameraIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                {camera.title}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                {camera.location}
              </span>
            </span>
            <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "rgba(88,139,154,0.13)", color: "var(--river-teal)" }}>
              LIVE
            </span>
          </button>
        ))}
      </div>

      <div className="safe-page-x pt-3 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：{feed?.sourceName}。目前以大溪區周邊座標與道路名稱自動篩選，影像為即時路況參考，實際交通狀況仍以現場與官方公告為準。
      </div>
    </div>
  );
}
