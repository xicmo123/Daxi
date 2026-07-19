import type { Status } from "./data";

// "ok" reads through the cognac family (available); "mid"/"full" escalate
// through the bordeaux family so urgency intensifies within one hue.
export const statusStyle: Record<Status, { bg: string; fg: string }> = {
  ok: { bg: "var(--cognac-tint)", fg: "var(--cognac-deep)" },
  mid: { bg: "var(--bordeaux-tint)", fg: "var(--bordeaux)" },
  full: { bg: "var(--bordeaux)", fg: "var(--card)" },
};
