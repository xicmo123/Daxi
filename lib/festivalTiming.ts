import { festival } from "./data";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getFestivalTiming(now: Date = new Date()) {
  const start = dateOnly(new Date(festival.startDate));
  const end = dateOnly(new Date(festival.endDate));
  const today = dateOnly(now);

  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  const dayIndex = Math.round((today.getTime() - start.getTime()) / DAY_MS) + 1;
  const daysToProcession = Math.round((end.getTime() - today.getTime()) / DAY_MS);

  const phase: "before" | "during" | "after" = dayIndex < 1 ? "before" : dayIndex > totalDays ? "after" : "during";

  return { totalDays, dayIndex, daysToProcession, phase };
}
