"use client";

// Inside the Capacitor shell the app is a WKWebView/Android WebView pointed at
// daxi.zequo.net (see capacitor.config.ts). A plain `target="_blank"` there
// does NOT open a browser — the bridge loads the destination in the *same*
// webview, which has no URL bar, no toolbar and (on iOS) no swipe-back. One
// tap on 「查看區公所公告」 and the user is stranded on tycg.gov.tw with no way
// home except force-quitting the app.
//
// There are 24 such links in components/, plus more built as raw HTML strings
// inside Leaflet popups (ParkingMap) and more still baked into data
// (`mapsUrl` on every place). Rather than edit each call site, the click is
// intercepted once, globally, by components/ExternalLinkHandler.tsx — this
// file holds the decision logic it uses.
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const MAPS_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"]);

/** Where a Google Maps directions/search URL is pointing. */
type MapsTarget = {
  /** Coordinates, or a place name — whatever the URL carried. */
  destination: string;
  /** Apple Maps `dirflg` value for the requested travel mode. */
  dirflg: string;
  /** True when `destination` is a `lat,lng` pair, which `geo:` requires. */
  isCoordinates: boolean;
};

const DIRFLG_BY_TRAVELMODE: Record<string, string> = {
  driving: "d",
  walking: "w",
  bicycling: "d", // Apple Maps has no cycling flag on this scheme.
  transit: "r",
};

function parseMapsTarget(url: URL): MapsTarget | null {
  if (!MAPS_HOSTS.has(url.hostname)) return null;

  // The shape lib/tycgParking.ts, lib/placesStore.ts and data/businesses use:
  // /maps/dir/?api=1&destination=24.88,121.28
  const destination = url.searchParams.get("destination") ?? url.searchParams.get("query") ?? url.searchParams.get("q");
  if (!destination) return null;

  const coords = destination.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  const travelmode = url.searchParams.get("travelmode") ?? "";

  return {
    destination: coords ? `${coords[1]},${coords[2]}` : destination.trim(),
    dirflg: DIRFLG_BY_TRAVELMODE[travelmode] ?? "d",
    isCoordinates: Boolean(coords),
  };
}

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/** Is this href a navigation link we can hand to a native maps app? */
export function isMapsLink(raw: string): boolean {
  const url = safeUrl(raw);
  return url ? parseMapsTarget(url) !== null : false;
}

/**
 * The platform's own maps URL for a destination, or null if this isn't a
 * recognisable maps link.
 *
 * Navigation is the one case where staying inside an in-app browser is the
 * wrong answer: the user wants turn-by-turn in the app they already trust,
 * with their saved home address and CarPlay. Both schemes below are handed
 * straight to the OS by the Capacitor webview delegate.
 */
export function nativeMapsUrl(raw: string, platform: string): string | null {
  const url = safeUrl(raw);
  if (!url) return null;

  const target = parseMapsTarget(url);
  if (!target) return null;

  // A `lat,lng` pair goes in raw — that is the form Apple documents, and the
  // comma survives percent-encoding inconsistently across iOS versions. Only
  // place names, which can contain anything, need escaping.
  const destination = target.isCoordinates ? target.destination : encodeURIComponent(target.destination);
  // Apple Maps. `daddr` alone starts directions from the current location.
  if (platform === "ios") return `maps://?daddr=${destination}&dirflg=${target.dirflg}`;
  // Android's geo: intent — the chooser lets the user pick Google Maps to
  // navigate, which is what they almost always have installed anyway. Only
  // coordinates go in the path; a bare name has to ride in `q`.
  if (platform === "android") {
    return target.isCoordinates
      ? `geo:${target.destination}?q=${destination}`
      : `geo:0,0?q=${destination}`;
  }
  return null;
}

/**
 * The same destination as an https Apple Maps link, for the plain website.
 *
 * `maps://` is the right scheme inside the app, where the Capacitor delegate
 * hands it to the OS, but a browser tab has no such delegate — a custom scheme
 * either does nothing or throws up an "address invalid" sheet. maps.apple.com
 * is the universal link: it opens the Apple Maps app on iOS/macOS and falls
 * back to Apple's web map everywhere else.
 */
export function webAppleMapsUrl(raw: string): string | null {
  const url = safeUrl(raw);
  if (!url) return null;

  const target = parseMapsTarget(url);
  if (!target) return null;

  const destination = target.isCoordinates ? target.destination : encodeURIComponent(target.destination);
  return `https://maps.apple.com/?daddr=${destination}&dirflg=${target.dirflg}`;
}

/**
 * Is this browser on a device where offering Apple Maps makes sense?
 *
 * Offering it on a Windows desktop or an Android phone would send the user to
 * a web map they never asked for, so the website only shows the chooser to
 * Apple hardware. iPadOS 13+ reports itself as "Macintosh", which is fine —
 * Apple Maps exists on macOS too, so both belong in the same bucket.
 */
export function prefersAppleMaps(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Macintosh/.test(userAgent);
}

/** Hand a maps URL (native scheme or https) to the OS / in-app browser. */
export async function openMapsChoice(url: string): Promise<void> {
  // Non-http scheme: the webview delegate passes it to the OS rather than
  // trying to load it, which is exactly what we want here.
  if (!url.startsWith("http")) {
    window.location.href = url;
    return;
  }
  await openExternal(url);
}

/**
 * Open a link that leaves the app.
 *
 * On the web this is an ordinary new tab. On native it is an in-app browser
 * (SFSafariViewController / Custom Tabs) which crucially has a Done button —
 * the user always gets back.
 *
 * Maps links are NOT handled here: App Review guideline 4 asks that the user
 * be *offered* Apple Maps rather than silently redirected into one map app or
 * another, so components/ExternalLinkHandler.tsx intercepts them first and
 * shows components/MapsAppSheet.tsx.
 */
export async function openExternal(href: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    await Browser.open({ url: href, presentationStyle: "popover" });
  } catch {
    // The plugin is missing or failed. This is not hypothetical: the web app
    // updates the instant the server does (server.url points at the remote
    // origin), but @capacitor/browser only exists in a binary built after it
    // was added — so every already-installed copy of 大溪通 runs this code
    // against a shell that has no Browser plugin, and the call rejects.
    //
    // The caller has already preventDefault()ed by this point, so without
    // this fallback the tap would do nothing at all — strictly worse than the
    // trapped-in-the-webview behaviour it was meant to fix. Same-webview
    // navigation is that old behaviour, which is the correct thing to
    // degrade to.
    window.location.href = href;
  }
}

/**
 * Should this href be taken over by `openExternal`?
 *
 * `false` for anything the webview or the OS already handles correctly:
 * in-app routes, and non-http schemes like tel:/mailto: which Capacitor
 * already forwards to the dialer and mail app.
 */
export function shouldOpenExternally(href: string): boolean {
  if (!Capacitor.isNativePlatform()) return false;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return url.origin !== window.location.origin;
}
