// Self-hosted analytics + error reporting. No third party: everything lands
// in data/ on the same Mac that serves the app, which keeps civic-app usage
// data (what residents look up, where they are in the app when it breaks)
// from leaving the box, and costs nothing to run.
//
// Replaces lib/tracking.ts's "read the whole 5000-entry array, push, write it
// all back" on every single tap. Events are NDJSON now — an append is O(1)
// and atomic at the OS level for small writes — with the capped array from
// the old data/click-events.json still read as history so nothing is lost.
import { appendJsonLine, dataPath, readJsonFile, readJsonLines, trimJsonLines } from "./jsonStore";

const EVENTS_PATH = dataPath("events.ndjson");
const LEGACY_CLICKS_PATH = dataPath("click-events.json");
const ERRORS_PATH = dataPath("client-errors.ndjson");

const MAX_EVENTS = 20_000;
const MAX_ERRORS = 2_000;

/** Content taps, from lib/trackClient.ts. */
export type TrackedItemType = "spot" | "business" | "coupon" | "map_card";
/** Feature-level usage, so the admin dashboard can answer "does anyone use X?". */
export type TrackedViewType = "page_view";

export type AnalyticsEvent = {
  kind: "click" | "view";
  type: string;
  id: string;
  label: string;
  mode?: string;
  at: string;
};

export type ClientError = {
  message: string;
  source: "render" | "window" | "unhandledrejection";
  stack?: string;
  path?: string;
  /** App version, so a spike can be tied to a release. */
  version?: string;
  userAgent?: string;
  at: string;
};

let appendsSinceTrim = 0;

export async function recordEvent(input: Omit<AnalyticsEvent, "at">): Promise<void> {
  await appendJsonLine(EVENTS_PATH, { ...input, at: new Date().toISOString() });
  // Amortised cap: pay the O(n) rewrite once every few hundred events rather
  // than on every one, which is what the old implementation did.
  if (++appendsSinceTrim >= 500) {
    appendsSinceTrim = 0;
    await trimJsonLines<AnalyticsEvent>(EVENTS_PATH, MAX_EVENTS);
  }
}

export async function recordClientError(input: Omit<ClientError, "at">): Promise<void> {
  await appendJsonLine(ERRORS_PATH, { ...input, at: new Date().toISOString() });
  await trimJsonLines<ClientError>(ERRORS_PATH, MAX_ERRORS);
}

export async function readEvents(): Promise<AnalyticsEvent[]> {
  const [current, legacy] = await Promise.all([
    readJsonLines<AnalyticsEvent>(EVENTS_PATH),
    readLegacyClickEvents(),
  ]);
  return [...legacy, ...current];
}

export async function readClientErrors(): Promise<ClientError[]> {
  const errors = await readJsonLines<ClientError>(ERRORS_PATH);
  return [...errors].reverse();
}

// The pre-NDJSON log. Kept readable so the dashboard doesn't start from zero
// on the day this ships; nothing writes to it any more.
async function readLegacyClickEvents(): Promise<AnalyticsEvent[]> {
  const raw = await readJsonFile<unknown>(LEGACY_CLICKS_PATH, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e): e is { type: string; id: string; label: string; mode?: string; at: string } =>
      Boolean(e && typeof e === "object" && "type" in e && "id" in e),
    )
    .map((e) => ({ kind: "click" as const, type: e.type, id: e.id, label: e.label, mode: e.mode, at: e.at }));
}

export type Ranked = { id: string; label: string; count: number };

export function rankBy(events: AnalyticsEvent[], predicate: (e: AnalyticsEvent) => boolean, limit = 10): Ranked[] {
  const counts = new Map<string, Ranked>();
  for (const event of events) {
    if (!predicate(event)) continue;
    const entry = counts.get(event.id) ?? { id: event.id, label: event.label, count: 0 };
    entry.count += 1;
    // Labels can change (a spot gets renamed); the most recent one wins.
    entry.label = event.label || entry.label;
    counts.set(event.id, entry);
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function countByDay(events: AnalyticsEvent[], days = 14): Array<{ day: string; count: number }> {
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const event of events) {
    const day = event.at.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
}

export async function topClickedIds(type: TrackedItemType, limit = 5): Promise<Ranked[]> {
  const events = await readEvents();
  return rankBy(events, (e) => e.kind === "click" && e.type === type, limit);
}
