import { describe, expect, it } from "vitest";
import { isMapsLink, nativeMapsUrl, prefersAppleMaps, webAppleMapsUrl } from "./externalLink";

// Navigation links are baked into data/ as Google Maps directions URLs. Inside
// the Capacitor webview they must become a native maps scheme, or the user is
// stranded on a web map with no toolbar and no way back to the app — and on
// iOS, App Review rejects the build for never offering Apple Maps at all.
describe("nativeMapsUrl", () => {
  // The exact shape lib/tycgParking.ts and lib/placesStore.ts generate.
  const directions = "https://www.google.com/maps/dir/?api=1&destination=24.8829454,121.2862657";

  it("produces an Apple Maps URL on iOS", () => {
    expect(nativeMapsUrl(directions, "ios")).toBe("maps://?daddr=24.8829454,121.2862657&dirflg=d");
  });

  it("produces a geo: intent on Android", () => {
    expect(nativeMapsUrl(directions, "android")).toBe("geo:24.8829454,121.2862657?q=24.8829454,121.2862657");
  });

  it("leaves the web alone", () => {
    expect(nativeMapsUrl(directions, "web")).toBeNull();
  });

  it("handles the place_id variant lib/googlePlacesParking.ts emits", () => {
    const withPlaceId = `${directions}&destination_place_id=ChIJuwRV3SEYaDQRiEQnq6NCVw4`;
    expect(nativeMapsUrl(withPlaceId, "ios")).toBe("maps://?daddr=24.8829454,121.2862657&dirflg=d");
  });

  // components/EmergencyPanel.tsx asks for walking directions to the nearest
  // AED; arriving in Apple Maps set to "drive" would be the wrong route.
  it("carries the travel mode across to Apple's dirflg", () => {
    expect(nativeMapsUrl(`${directions}&travelmode=walking`, "ios")).toBe(
      "maps://?daddr=24.8829454,121.2862657&dirflg=w",
    );
    expect(nativeMapsUrl(`${directions}&travelmode=transit`, "ios")).toBe(
      "maps://?daddr=24.8829454,121.2862657&dirflg=r",
    );
  });

  it("ignores non-maps links so 區公所 pages still open in the in-app browser", () => {
    expect(nativeMapsUrl("https://www.daxi.tycg.gov.tw/cp.aspx?n=7509", "ios")).toBeNull();
  });

  it("hands a place name to Apple Maps as a search destination", () => {
    const byName = "https://www.google.com/maps/dir/?api=1&destination=大溪老街";
    expect(nativeMapsUrl(byName, "ios")).toBe(`maps://?daddr=${encodeURIComponent("大溪老街")}&dirflg=d`);
    // geo: puts a name in `q` with a null coordinate, not in the path.
    expect(nativeMapsUrl(byName, "android")).toBe(`geo:0,0?q=${encodeURIComponent("大溪老街")}`);
  });

  it("does not throw on a malformed href", () => {
    expect(nativeMapsUrl("not a url", "ios")).toBeNull();
  });
});

// The plain website shows the same chooser, but a browser tab has no Capacitor
// delegate to hand `maps://` to — it needs Apple's universal link instead.
describe("webAppleMapsUrl", () => {
  it("uses the maps.apple.com universal link, travel mode and all", () => {
    expect(webAppleMapsUrl("https://www.google.com/maps/dir/?api=1&destination=24.88,121.28&travelmode=walking")).toBe(
      "https://maps.apple.com/?daddr=24.88,121.28&dirflg=w",
    );
  });

  it("stays null for anything that is not a maps link", () => {
    expect(webAppleMapsUrl("https://www.daxi.tycg.gov.tw/cp.aspx?n=7509")).toBeNull();
  });
});

describe("prefersAppleMaps", () => {
  it("offers Apple Maps on Apple hardware — iPadOS reports itself as Macintosh", () => {
    expect(prefersAppleMaps("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(true);
    expect(prefersAppleMaps("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(true);
  });

  it("leaves everyone else with the one-tap Google link", () => {
    expect(prefersAppleMaps("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(false);
    expect(prefersAppleMaps("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
  });
});

describe("isMapsLink", () => {
  it("recognises the directions URLs data/ carries", () => {
    expect(isMapsLink("https://www.google.com/maps/dir/?api=1&destination=24.88,121.28")).toBe(true);
  });

  it("rejects other outbound links and malformed hrefs", () => {
    expect(isMapsLink("https://www.daxi.tycg.gov.tw/cp.aspx?n=7509")).toBe(false);
    expect(isMapsLink("not a url")).toBe(false);
  });
});
