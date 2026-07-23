// Minimal click-tracking store: append-only JSON log of what gets tapped
// on the home feed (spots/coupons/map card), so later iteration decisions
// (what to feature, which mode default) can be based on real usage instead
// of guessing. No dashboard yet — just the raw log, same JSON-on-disk
// pattern as lib/reservations.ts.
import { promises as fs } from "fs";
import path from "path";
import type { TrackedItemType } from "./trackClient";

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_PATH = path.join(DATA_DIR, "click-events.json");

// Keep the log from growing unbounded on a long-running dev/small deploy —
// oldest events roll off once this cap is hit.
const MAX_EVENTS = 5000;

export type ClickEvent = {
  type: TrackedItemType;
  id: string;
  label: string;
  mode?: string;
  at: string;
};

async function readEvents(): Promise<ClickEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ClickEvent[]) : [];
  } catch {
    return [];
  }
}

export async function appendClickEvent(input: { type: TrackedItemType; id: string; label: string; mode?: string }): Promise<void> {
  const events = await readEvents();
  events.push({ ...input, at: new Date().toISOString() });
  const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EVENTS_PATH, JSON.stringify(trimmed, null, 2) + "\n", "utf-8");
}

export async function topClickedIds(type: TrackedItemType, limit = 5): Promise<{ id: string; label: string; count: number }[]> {
  const events = await readEvents();
  const counts = new Map<string, { label: string; count: number }>();
  for (const e of events) {
    if (e.type !== type) continue;
    const entry = counts.get(e.id) ?? { label: e.label, count: 0 };
    entry.count += 1;
    entry.label = e.label;
    counts.set(e.id, entry);
  }
  return Array.from(counts.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
