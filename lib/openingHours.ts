// Opening hours from Google Places (data/place-hours.json, refreshed by
// scripts/fetch-place-hours.mjs) turned into what shop apps show first:
// 「營業中 · 至 18:00」, 「即將打烊」, 「休息中 · 明天 09:00 開門」. Pure functions,
// safe in client components; all clock math is in Asia/Taipei.

export type HoursPoint = { day: number; hour: number; minute: number }; // day 0 = Sunday
export type PlaceHours = {
  periods: Array<{ open: HoursPoint | null; close: HoursPoint | null }>;
  weekdayDescriptions: string[]; // Google order: Monday first
  priceLevel: string | null;
  priceMin: number | null;
  priceMax: number | null;
  summary: string | null;
  website: string | null;
};

export type OpenStatus = { open: boolean; label: string; tone: "ok" | "warn" | "closed" };

const WEEK = 7 * 1440;
const DAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

function taipeiNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

const toWeek = (p: HoursPoint) => p.day * 1440 + p.hour * 60 + p.minute;
const clock = (weekMinutes: number) => {
  const m = ((weekMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export function openStatus(hours: PlaceHours | undefined, now = new Date()): OpenStatus | null {
  const periods = hours?.periods ?? [];
  if (periods.length === 0) return null;
  // Google's 24/7 shape: a single period that opens and never closes.
  if (periods.length === 1 && periods[0].open && !periods[0].close) return { open: true, label: "24 小時營業", tone: "ok" };

  const { day, minutes } = taipeiNow(now);
  const t = day * 1440 + minutes;
  const spans = periods
    .filter((p): p is { open: HoursPoint; close: HoursPoint } => Boolean(p.open && p.close))
    .map((p) => {
      const o = toWeek(p.open);
      let c = toWeek(p.close);
      if (c <= o) c += WEEK; // runs past Saturday midnight into Sunday
      return [o, c] as const;
    });

  for (const [o, c] of spans) {
    for (const shift of [0, -WEEK]) {
      if (t >= o + shift && t < c + shift) {
        const left = c + shift - t;
        return left <= 60
          ? { open: true, label: `即將打烊 · ${clock(c)} 休息`, tone: "warn" }
          : { open: true, label: `營業中 · 至 ${clock(c)}`, tone: "ok" };
      }
    }
  }

  // Closed: when does it next open?
  let next = Infinity;
  for (const [o] of spans) {
    const until = (o - t + WEEK) % WEEK;
    if (until > 0 && until < next) next = until;
  }
  if (!Number.isFinite(next)) return { open: false, label: "休息中", tone: "closed" };
  const at = t + next;
  const daysAhead = Math.floor(at / 1440) - Math.floor(t / 1440);
  const when = daysAhead === 0 ? "" : daysAhead === 1 ? "明天 " : `${DAY_NAMES[Math.floor(at / 1440) % 7]} `;
  return { open: false, label: `休息中 · ${when}${clock(at)} 開門`, tone: "closed" };
}

/** Today's hours as Google words them, without the weekday: 「09:00 – 18:00」. */
export function todayHours(hours: PlaceHours | undefined, now = new Date()): string | null {
  const list = hours?.weekdayDescriptions ?? [];
  if (list.length !== 7) return null;
  const { day } = taipeiNow(now);
  return stripDay(list[(day + 6) % 7]);
}

export function stripDay(line: string): string {
  return line.replace(/^[^:：]+[:：]\s*/, "").trim();
}

/** The week starting today, for the hours table: [{ label: "週二", hours, today }]. */
export function weekHours(hours: PlaceHours | undefined, now = new Date()): Array<{ label: string; hours: string; today: boolean }> {
  const list = hours?.weekdayDescriptions ?? [];
  if (list.length !== 7) return [];
  const { day } = taipeiNow(now);
  return Array.from({ length: 7 }, (_, i) => {
    const d = (day + i) % 7;
    return { label: DAY_NAMES[d], hours: stripDay(list[(d + 6) % 7]), today: i === 0 };
  });
}

const LEVEL: Record<string, string> = {
  PRICE_LEVEL_FREE: "免費",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

/** 「均消 $200–400」, or a $-level when Google has no range. */
export function priceLabel(hours: PlaceHours | undefined): string | null {
  if (!hours) return null;
  // Google's cheapest band comes back as 1–200 NT$: read it as "up to 200".
  if (hours.priceMin && hours.priceMax && hours.priceMin <= 1) return `均消 $${hours.priceMax} 以內`;
  if (hours.priceMin && hours.priceMax) return `均消 $${hours.priceMin}–${hours.priceMax}`;
  if (hours.priceMin) return `均消 $${hours.priceMin} 以上`;
  return hours.priceLevel ? LEVEL[hours.priceLevel] ?? null : null;
}
