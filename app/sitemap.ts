import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";
import { daxiWalkHref } from "@/lib/daxiWalk";
import { placeHref } from "@/lib/placePages";
import { filterVisiblePlaces, getAllPlaces, readDetails } from "@/lib/placesStore";

// Read per request: places are added and hidden through /admin at runtime.
export const dynamic = "force-dynamic";

// Hand-maintained rather than derived from the route tree: only the pages
// worth ranking belong here, plus one page per visible spot and shop.
const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/spots", changeFrequency: "weekly", priority: 0.9 },
  { path: daxiWalkHref, changeFrequency: "monthly", priority: 0.8 },
  { path: "/businesses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/events", changeFrequency: "daily", priority: 0.9 },
  { path: "/parking", changeFrequency: "hourly", priority: 0.8 },
  { path: "/coupons", changeFrequency: "daily", priority: 0.7 },
  { path: "/bus", changeFrequency: "weekly", priority: 0.7 },
  { path: "/weather", changeFrequency: "hourly", priority: 0.6 },
  { path: "/announcements", changeFrequency: "daily", priority: 0.6 },
  { path: "/resident", changeFrequency: "daily", priority: 0.8 },
  { path: "/resident/announcements", changeFrequency: "daily", priority: 0.7 },
  { path: "/resident/outages", changeFrequency: "daily", priority: 0.7 },
  { path: "/resident/garbage", changeFrequency: "daily", priority: 0.8 },
  { path: "/resident/roadworks", changeFrequency: "daily", priority: 0.6 },
  { path: "/resident/clinics", changeFrequency: "daily", priority: 0.6 },
  { path: "/resident/aed", changeFrequency: "monthly", priority: 0.6 },
  { path: "/resident/bus", changeFrequency: "weekly", priority: 0.5 },
  { path: "/resident/events", changeFrequency: "weekly", priority: 0.5 },
  { path: "/resident/live", changeFrequency: "weekly", priority: 0.4 },
  { path: "/resident/services", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [all, details] = await Promise.all([getAllPlaces(), readDetails()]);
  const places = filterVisiblePlaces(all, details).map((place) => ({
    path: placeHref(place),
    changeFrequency: "weekly" as const,
    // Places with an editor-written story are the ones worth ranking first.
    priority: details[place.placeId]?.story ? 0.7 : 0.5,
  }));
  return [...routes, ...places].map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
