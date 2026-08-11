// Shared style recipes for the UI primitives. Kept as plain functions
// returning { className, style } rather than components so that anchors,
// next/link and <button> can all wear the same clothes without a
// polymorphic-component type puzzle — see Button.tsx / Card.tsx for the
// component wrappers most call sites should prefer.
//
// Every colour here resolves to a token defined in app/globals.css, so the
// primitives follow light/dark and the manual [data-theme] override for free.
import type { CSSProperties } from "react";

export type Tone = "primary" | "secondary" | "ghost" | "danger" | "wood" | "moss" | "river";
export type Size = "sm" | "md" | "lg";

export type Recipe = { className: string; style: CSSProperties };

// Touch targets: md/lg clear Apple's 44pt minimum. `sm` (36px) is only for
// dense admin tables where a stray tap is cheap to undo.
// Sizes now name a step on the type scale in app/globals.css rather than
// carrying their own px values, so a button label and a list row set at the
// same level actually match — and both scale with the OS text-size setting,
// which a hardcoded px value silently ignores.
const SIZES: Record<Size, { className: string; style: CSSProperties }> = {
  sm: { className: "rounded-xl px-3 text-app-caption", style: { minHeight: 36 } },
  md: { className: "rounded-xl px-4 text-app-label", style: { minHeight: 44 } },
  lg: { className: "rounded-2xl px-6 text-app-heading", style: { minHeight: 56 } },
};

const TONES: Record<Tone, CSSProperties> = {
  primary: { background: "var(--accent)", color: "var(--accent-fg)" },
  secondary: { background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" },
  ghost: { background: "transparent", color: "var(--ink)" },
  // Fixed red rather than a token: this is the emergency/destructive colour
  // and must not drift with the palette. Matches components/EmergencyPanel.
  danger: { background: "#b3261e", color: "#ffffff" },
  wood: { background: "linear-gradient(135deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)", color: "var(--block-fg)" },
  moss: { background: "linear-gradient(135deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)", color: "var(--block-fg)" },
  river: { background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)", color: "var(--block-fg)" },
};

export function buttonRecipe(tone: Tone = "primary", size: Size = "md", fullWidth = false): Recipe {
  const sizing = SIZES[size];
  return {
    className: [
      "inline-flex items-center justify-center gap-2 font-bold leading-none",
      "transition-opacity active:opacity-75 disabled:opacity-50 disabled:pointer-events-none",
      sizing.className,
      fullWidth ? "w-full" : "",
    ]
      .filter(Boolean)
      .join(" "),
    style: { ...sizing.style, ...TONES[tone] },
  };
}

export type CardTone = "plain" | "raised" | "outlined";

export function cardRecipe(tone: CardTone = "raised"): Recipe {
  return {
    className: tone === "raised" ? "rounded-2xl card-shadow" : "rounded-2xl",
    style: {
      background: "var(--card)",
      color: "var(--ink)",
      ...(tone === "outlined" ? { border: "1px solid var(--line)" } : null),
    },
  };
}

export type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "danger";

const BADGE_TONES: Record<BadgeTone, CSSProperties> = {
  neutral: { background: "var(--cognac-tint)", color: "var(--ink-soft)" },
  accent: { background: "var(--daxi-red-soft)", color: "var(--accent)" },
  ok: { background: "color-mix(in srgb, var(--status-ok) 16%, transparent)", color: "var(--status-ok)" },
  warn: { background: "color-mix(in srgb, var(--status-warn) 18%, transparent)", color: "var(--status-warn)" },
  danger: { background: "rgba(179,38,30,0.14)", color: "#b3261e" },
};

export function badgeRecipe(tone: BadgeTone = "neutral"): Recipe {
  return {
    className: "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-app-micro font-bold leading-none",
    style: BADGE_TONES[tone],
  };
}

// Convenience for call sites that only need the class string (e.g. a
// next/link that already carries its own inline style).
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
