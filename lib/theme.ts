// Manual light/dark override. app/globals.css already defines the full token
// set three times — :root, a prefers-color-scheme block, and
// :root[data-theme="light"|"dark"] — but until now nothing ever wrote the
// data-theme attribute, so the override branch was dead CSS and users were
// stuck with whatever iOS was set to.
export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "daxi-theme";

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", preference);
}

export function writeThemePreference(preference: ThemePreference): void {
  if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
  else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
  // Same-tab listeners: the native `storage` event only fires in *other*
  // tabs, so the toggle's own UI would not re-render without this.
  window.dispatchEvent(new Event("daxi-theme-change"));
}

// Runs before first paint via a blocking inline script in the root layout.
// Inlined as a string because it must execute before React hydrates —
// otherwise a dark-mode user gets a full-brightness flash on every load.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
