"use client";

// One delegated click listener that fixes every outbound link in the app at
// once — see lib/externalLink.ts for why this is necessary inside the
// Capacitor shell, and why it is done here rather than at each call site.
//
// Delegation is what makes this worth doing: it covers the 24 `target="_blank"`
// anchors in components/, the anchors Leaflet builds from HTML strings in its
// popups (components/ParkingMap.tsx), and every `mapsUrl` baked into data/ —
// including any added later, which is the part a per-call-site fix would keep
// losing.
import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  isMapsLink,
  nativeMapsUrl,
  openExternal,
  openMapsChoice,
  prefersAppleMaps,
  shouldOpenExternally,
  webAppleMapsUrl,
} from "@/lib/externalLink";
import MapsAppSheet, { type MapsChoices } from "./MapsAppSheet";

export default function ExternalLinkHandler() {
  const [choices, setChoices] = useState<MapsChoices | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Let modified clicks and anything already handled fall through.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Resolved against the document so relative hrefs still work.
      const url = (() => {
        try {
          return new URL(href, window.location.href).toString();
        } catch {
          return null;
        }
      })();
      if (!url) return;

      // Maps links are handled on the website too, not just in the shell: the
      // chooser is the whole point, and a browser tab is just as capable of
      // launching Apple Maps through its universal link.
      if (isMapsLink(url)) {
        if (!Capacitor.isNativePlatform()) {
          const apple = prefersAppleMaps(navigator.userAgent) ? webAppleMapsUrl(url) : null;
          // Non-Apple hardware gets no chooser — an "Apple 地圖" button there
          // leads to a web map nobody asked for. The anchor keeps its normal
          // one-tap behaviour.
          if (!apple) return;
          event.preventDefault();
          setChoices({ apple, google: url });
          return;
        }

        const platform = Capacitor.getPlatform();
        const native = nativeMapsUrl(url, platform);

        // iOS is where the guideline-4 rejection came from, and where the
        // choice is real: Apple Maps is always installed. On Android the
        // `geo:` intent already raises the system's own app chooser, so a
        // second sheet on top of it would just be one more tap.
        if (platform === "ios" && native) {
          event.preventDefault();
          setChoices({ apple: native, google: url });
          return;
        }
        if (native) {
          event.preventDefault();
          void openMapsChoice(native);
          return;
        }
      }

      if (!shouldOpenExternally(href)) return;
      event.preventDefault();
      void openExternal(url);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const pick = useCallback((url: string) => {
    setChoices(null);
    void openMapsChoice(url);
  }, []);

  if (!choices) return null;
  return <MapsAppSheet choices={choices} onPick={pick} onClose={() => setChoices(null)} />;
}
