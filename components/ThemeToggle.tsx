"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readThemePreference, writeThemePreference, type ThemePreference } from "@/lib/theme";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "跟隨系統" },
  { value: "light", label: "淺色" },
  { value: "dark", label: "深色" },
];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("daxi-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("daxi-theme-change", callback);
  };
}

export default function ThemeToggle() {
  // Same pattern as IdentityGate: getServerSnapshot pins SSR output to
  // "system" so the markup matches what the pre-paint script produced.
  const preference = useSyncExternalStore(subscribe, readThemePreference, () => "system" as ThemePreference);
  const select = useCallback((next: ThemePreference) => writeThemePreference(next), []);

  return (
    <div>
      <div className="text-[12.5px] font-semibold mb-2" style={{ color: "var(--ink)" }}>
        外觀
      </div>
      <div
        role="radiogroup"
        aria-label="外觀"
        className="grid gap-1 rounded-2xl p-1"
        style={{ background: "var(--cognac-tint)", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        {options.map((option) => {
          const active = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(option.value)}
              className="flex items-center justify-center rounded-xl text-[12.5px] font-bold transition-opacity active:opacity-75"
              style={{
                minHeight: 40,
                background: active ? "var(--card)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink-soft)",
                boxShadow: active ? "var(--shadow-card)" : "none",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
