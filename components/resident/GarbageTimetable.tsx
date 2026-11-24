"use client";

import { useMemo, useState } from "react";
import type { GarbageScheduleRoute } from "@/lib/taoyuanGarbage";
import styles from "@/components/skin/Skin.module.css";

function timeRange(route: GarbageScheduleRoute): string | null {
  const times = route.stops.map((s) => s.time).filter((t): t is string => Boolean(t));
  if (times.length === 0) return null;
  return times.length === 1 ? times[0] : `${times[0]}–${times[times.length - 1]}`;
}

// Every route's stops are in the server HTML (collapsed in <details>), so a
// search engine reads all the addresses and times; the box just filters them.
export default function GarbageTimetable({ schedule }: { schedule: GarbageScheduleRoute[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().replace(/\s+/g, "");
  const matches = useMemo(() => {
    if (!q) return [];
    return schedule.flatMap((route) =>
      route.stops
        .filter((stop) => stop.name.replace(/\s+/g, "").includes(q))
        .map((stop) => ({ route, stop })),
    );
  }, [q, schedule]);

  return (
    <div>
      <label className={styles.panel} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 999 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden style={{ color: "var(--rj-main)", flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入路名或門牌，例如：中華路、員林路"
          aria-label="用路名找垃圾車停靠點"
          style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", color: "var(--rj-ink)", fontSize: 16 }}
        />
      </label>

      {q ? (
        <div className={styles.panel} style={{ marginTop: 12 }} aria-live="polite">
          {matches.length === 0 ? (
            <p className={styles.panelLead} style={{ margin: 0 }}>
              找不到「{query.trim()}」的停靠點，試試只輸入路名（例如「中正路」），或從下方路線列表找。
            </p>
          ) : (
            matches.map(({ route, stop }) => (
              <div key={`${route.id}-${stop.seq}`} className={styles.row}>
                <span className="min-w-0">
                  <strong>{stop.name}</strong>
                  <small>
                    {route.name}・{route.displayName}
                  </small>
                </span>
                <span className={styles.rowValue}>{stop.time ?? "—"}</span>
              </div>
            ))
          )}
        </div>
      ) : null}

      <div className={styles.cardGrid} style={{ marginTop: 16, alignItems: "start" }}>
        {schedule.map((route) => {
          const range = timeRange(route);
          return (
            <details key={route.id} className={styles.panel} id={`route-${route.name}`} style={{ padding: 0 }}>
              <summary className={styles.disclosure}>
                <span className="min-w-0" style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: 17, fontWeight: 900, color: "var(--rj-ink)" }}>
                    {route.name}・{route.displayName}
                  </strong>
                  <small style={{ display: "block", marginTop: 3, color: "var(--rj-ink-soft)", fontSize: 13 }}>
                    {route.areaLabel} · {route.stops.length} 個停靠點
                  </small>
                </span>
                {range ? <span className={styles.rowValue} style={{ fontSize: 15 }}>{range}</span> : null}
              </summary>
              <ol style={{ padding: "0 20px 12px", margin: 0, listStyle: "none" }}>
                {route.stops.map((stop) => (
                  <li key={stop.seq} className={styles.row} style={{ minHeight: 44 }}>
                    <span style={{ fontSize: 14.5 }}>{stop.name}</span>
                    <span style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums", fontWeight: 800, color: "var(--rj-main)" }}>{stop.time ?? "—"}</span>
                  </li>
                ))}
              </ol>
            </details>
          );
        })}
      </div>
    </div>
  );
}
