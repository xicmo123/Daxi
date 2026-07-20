import type { Status } from "./data";

// Urgency reads through weight and contrast rather than hue: "ok" stays
// light and thin, "full" goes to full ink weight.
export const statusWeight: Record<Status, { fg: string; label: string }> = {
  ok: { fg: "var(--ink-soft)", label: "font-normal" },
  mid: { fg: "var(--ink)", label: "font-medium" },
  full: { fg: "var(--ink)", label: "font-semibold" },
};

// Progress-bar fill color for live parking availability.
export const statusBarColor: Record<Status, string> = {
  ok: "var(--status-ok)",
  mid: "var(--status-warn)",
  full: "var(--status-warn)",
};
