import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "daxi.zequo.net",
  appName: "大溪通",
  // Not `public/`: with server.url set, the webview loads everything from the
  // remote origin and the bundled copy of public/ was 12MB of photos that
  // could never be reached. capacitor-shell/ holds only what the binary needs
  // — the offline fallback page. Built by scripts/build-capacitor-shell.mjs,
  // which `npm run cap:sync` runs first.
  webDir: "capacitor-shell",
  server: {
    url: "https://daxi.zequo.net",
    cleartext: false,
    // Shown when the webview cannot reach server.url. Without this the user
    // gets WKWebView's own English error page with no retry and no way to
    // reach 110/119 — the worst possible failure mode for a civic app.
    errorPath: "offline.html",
  },
};

export default config;
