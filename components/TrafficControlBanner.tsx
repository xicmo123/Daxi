"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Roadwork } from "@/lib/taoyuanRoadworks";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TrafficControlBanner() {
  const [roadworks, setRoadworks] = useState<Roadwork[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/resident/roadworks", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load roadworks.");
        const data = (await response.json()) as { roadworks: Roadwork[]; syncedAt?: string; updatedAt?: string };
        if (cancelled) return;
        setRoadworks(data.roadworks);
        setSyncedAt(data.syncedAt ?? data.updatedAt ?? null);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="safe-page-x pt-3 fade-in">
        <div className="h-[52px] rounded-2xl skeleton" style={{ background: "var(--line)" }} />
      </div>
    );
  }

  if (state === "error") return null;

  const hasControl = roadworks.length > 0;

  return (
    <div className="safe-page-x pt-3 fade-in">
      <Link
        href="/resident/roadworks"
        className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-opacity active:opacity-70"
        style={{ background: "var(--card)", borderColor: "var(--line)", boxShadow: "var(--shadow-card)" }}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: hasControl ? "var(--daxi-red)" : "var(--block-moss)" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
            {hasControl ? `今日大溪有 ${roadworks.length} 處交通管制／道路施工` : "今日大溪暫無交通管制"}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {syncedAt ? `最後更新 ${formatTime(syncedAt)} · 每 10 分鐘自動更新` : "同步中"}
          </div>
        </div>
        <span className="text-[12px] shrink-0" style={{ color: "var(--river-teal)" }} aria-hidden>
          查看 ↗
        </span>
      </Link>
    </div>
  );
}
