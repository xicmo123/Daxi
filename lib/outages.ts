// Real data — two independent, undocumented-but-public endpoints found by
// inspecting network traffic on each utility's own query tool (neither
// exposes a documented API, same situation as lib/tycgParking.ts /
// lib/announcements.ts elsewhere in this app):
//
// - 台灣自來水公司 (Taiwan Water Corp): POST wateroffapi/f/case/search
//   returns all current nationwide cases; filtered here to 大溪區 by its
//   town code (68000030, from GetTown/68000).
// - 台灣電力公司 (Taipower): daily ZIP of per-office CSVs on data.gov.tw's
//   open data mirror; 103.csv is 桃園區處, filtered by rows whose 停電範圍
//   mentions 大溪.
//
// Both are best-effort: if a source is unreachable, that source just
// contributes nothing rather than failing the whole page — never falls
// back to fabricated data, since showing wrong utility-outage info is
// worse than showing none.
import JSZip from "jszip";

export type OutageType = "water" | "power";

export type Outage = {
  id: string;
  type: OutageType;
  areas: string[];
  date: string; // YYYY-MM-DD
  timeRange: string;
  reason: string;
  source: string;
};

const DAXI_TOWN_CODE = "68000030";
const WATER_API = "https://web.water.gov.tw/wateroffapi/f/case/search";
const POWER_ZIP_URL = "https://service.taipower.com.tw/data/opendata/apply/file/d077004/001.zip";
const POWER_TAOYUAN_FILE = "103.csv";

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

async function fetchWaterOutages(): Promise<Outage[]> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const oneMonthOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const res = await fetch(WATER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: 1,
      startDate: fmt(yesterday),
      endDate: fmt(oneMonthOut),
      keyword: undefined,
      address: undefined,
      admin: undefined,
      government: undefined,
    }),
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`water API ${res.status}`);
  const cases: Array<{
    id: number;
    affectedTowns?: string[];
    waterOffRegion?: string;
    waterOffReason?: string;
    startDate?: string;
    startTime?: string;
    endTime?: string;
    status?: number;
  }> = await res.json();

  return cases
    .filter((c) => Array.isArray(c.affectedTowns) && c.affectedTowns.includes(DAXI_TOWN_CODE))
    .filter((c) => c.status !== 4) // 4 = withdrawn/cancelled
    .map((c) => ({
      id: `water-${c.id}`,
      type: "water" as const,
      areas: [(c.waterOffRegion ?? "大溪區").split("/").slice(-1)[0].replace(/。$/, "").trim() || "大溪區"],
      date: c.startDate ? toDateKey(c.startDate) : "",
      timeRange: c.startTime && c.endTime ? `${c.startTime}–${c.endTime}` : "",
      reason: c.waterOffReason ?? "",
      source: "台灣自來水公司",
    }));
}

function parseCsvLine(line: string): string[] {
  // The Taipower CSV has no quoted/escaped commas in practice (checked a
  // live sample), but split defensively field-by-field just in case.
  return line.split(",").map((f) => f.trim());
}

async function fetchPowerOutages(): Promise<Outage[]> {
  const res = await fetch(POWER_ZIP_URL, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`power zip ${res.status}`);
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file(POWER_TAOYUAN_FILE);
  if (!file) return [];
  const text = await file.async("string");

  const lines = text.split(/\r?\n/).filter(Boolean);
  const [, ...rows] = lines; // drop header row
  const grouped = new Map<string, { areas: Set<string>; reason: string; timeRange: string; date: string }>();

  for (const row of rows) {
    const cols = parseCsvLine(row.replace(/^﻿/, ""));
    const [, requestNo, workDesc, firstOutage, , area] = cols;
    if (!area || !area.includes("大溪")) continue;

    // "2026/07/23 00:00~05:00" → date + time range
    const match = firstOutage?.match(/^(\d{4}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})~(\d{2}:\d{2})/);
    const date = match ? match[1].replace(/\//g, "-") : "";
    const timeRange = match ? `${match[2]}–${match[3]}` : "";

    const key = requestNo || `${workDesc}-${firstOutage}`;
    const entry = grouped.get(key) ?? { areas: new Set<string>(), reason: workDesc ?? "", timeRange, date };
    entry.areas.add(area.replace(/^桃園市大溪區/, "").replace(/^桃園市/, "") || "大溪區");
    grouped.set(key, entry);
  }

  return Array.from(grouped.entries()).map(([key, v]) => ({
    id: `power-${key}`,
    type: "power" as const,
    areas: Array.from(v.areas),
    date: v.date,
    timeRange: v.timeRange,
    reason: v.reason,
    source: "台灣電力公司桃園區處",
  }));
}

export async function listUpcomingOutages(): Promise<Outage[]> {
  const [water, power] = await Promise.all([
    fetchWaterOutages().catch(() => []),
    fetchPowerOutages().catch(() => []),
  ]);
  const todayKey = new Date().toISOString().slice(0, 10);
  return [...water, ...power]
    .filter((o) => !o.date || o.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));
}
