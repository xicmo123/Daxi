import { festival, eventMilestones, type Milestone } from "./data";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Only single-day milestones (opening ceremony, procession day) count as
// "live today" — the multi-week "ongoing" entry shouldn't read as breaking-news.
export function findTodaysMilestone(now: Date = new Date()): Milestone | null {
  const today = dateOnly(now).getTime();
  return (
    eventMilestones.find((m) => m.isoDate && dateOnly(new Date(m.isoDate)).getTime() === today) ?? null
  );
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
