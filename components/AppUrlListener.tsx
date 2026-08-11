"use client";

// Handles a Universal Link / App Link that launched or foregrounded the app.
//
// The OS hands the full https://daxi.zequo.net/... URL to the native shell. If
// nothing claims it, Capacitor loads it as a fresh page load in the webview —
// which works, but throws away the client-side router state and shows a white
// flash. Routing it through next/router instead makes an incoming link feel
// like in-app navigation, which is the whole point of claiming the domain.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

const APP_HOST = "daxi.zequo.net";

export default function AppUrlListener() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let remove: (() => void) | undefined;

    void import("@capacitor/app").then(({ App }) => {
      void App.addListener("appUrlOpen", (event) => {
        let url: URL;
        try {
          url = new URL(event.url);
        } catch {
          return;
        }
        // Only our own host: anything else belongs in a browser, and following
        // it here would render a third-party page inside the app's own origin.
        if (url.hostname !== APP_HOST) return;
        // The staff backends are excluded from the association file too; this
        // is the belt-and-braces half of that rule.
        if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/merchant")) return;

        router.push(`${url.pathname}${url.search}`);
      }).then((handle) => {
        remove = () => void handle.remove();
      });
    }).catch(() => {
      // @capacitor/app is only present in a binary built after it was added.
      // Already-installed copies load this web code against an older shell, so
      // the plugin call rejects — deep links simply keep their pre-existing
      // behaviour there, which is a missing enhancement, not a broken app.
    });

    return () => remove?.();
  }, [router]);

  return null;
}
