// Cache tier for the third-party feeds.
//
// The problem this solves: nearly every page in this app sets
// `export const dynamic = "force-dynamic"`, which it needs to, because content
// is edited through /admin and written to JSON files in data/ — an ISR window
// would mean a 里長 publishes an urgent notice and it appears a minute later.
//
// But force-dynamic is not scoped to those file reads. Per the Next docs it is
// equivalent to setting `{ cache: 'no-store', next: { revalidate: 0 } }` on
// *every* fetch in the segment, which silently overrode the deliberate TTLs
// already written into lib/cwa.ts (600s), lib/tycgParking.ts (60s) and
// lib/announcements.ts (1800s). The result: every single app launch hit 中央
// 氣象署, TDX and the 桃園市停車場 feed live. That is slow for the user, it
// burns third-party quota that has no business scaling with traffic, and it
// makes the app's availability depend on four external services being up.
//
// unstable_cache is not affected by the segment config, so wrapping the
// external fetchers here restores the intended TTLs while the JSON file reads
// stay uncached and instant.
//
// Migration note: Next 16 marks unstable_cache as superseded by the `use cache`
// directive, which requires opting the whole app into Cache Components — that
// also removes `dynamic`/`revalidate` everywhere and is a project-wide change,
// not a drop-in. Worth doing later; this file is the seam where it happens.
import { unstable_cache } from "next/cache";
import { fetchDaxiWeather } from "./cwa";
import { fetchDaxiParking } from "./tycgParking";
import { fetchNearbyBuses } from "./busPositions";
import { getMergedEvents } from "./eventsFeed";
import { fetchDaxiAnnouncements } from "./announcements";

// TTLs are set by how fast the underlying thing actually changes, not by how
// fresh it would be nice to be.
const TTL = {
  /** 中央氣象署 publishes on a ~1h cycle; 10min is already generous. */
  weather: 600,
  /** Genuinely live — a car park fills in minutes. Shortest tier. */
  parking: 60,
  /** Bus GPS. Short, but not per-request: the map has its own live polling. */
  buses: 30,
  /** Event dates move rarely, and admin edits go through data/ not this feed. */
  events: 900,
  /** 區公所 posts a few times a week. */
  announcements: 1800,
} as const;

export const getCachedWeather = unstable_cache(async () => fetchDaxiWeather(), ["daxi-weather"], {
  revalidate: TTL.weather,
  tags: ["weather"],
});

export const getCachedParking = unstable_cache(async () => fetchDaxiParking(), ["daxi-parking"], {
  revalidate: TTL.parking,
  tags: ["parking"],
});

export const getCachedBuses = unstable_cache(async () => fetchNearbyBuses(), ["daxi-buses"], {
  revalidate: TTL.buses,
  tags: ["buses"],
});

export const getCachedEvents = unstable_cache(async () => getMergedEvents(), ["daxi-events"], {
  revalidate: TTL.events,
  tags: ["events"],
});

export const getCachedAnnouncements = unstable_cache(
  async (limit: number) => fetchDaxiAnnouncements(limit),
  ["daxi-announcements"],
  { revalidate: TTL.announcements, tags: ["announcements"] },
);
