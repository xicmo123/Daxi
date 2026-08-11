import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

// Hand-maintained rather than derived from the route tree: only the pages
// worth ranking belong here. Detail views are modals over these lists, not
// separate URLs, so there is nothing deeper to enumerate.
const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/spots", changeFrequency: "weekly", priority: 0.9 },
  { path: "/businesses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/events", changeFrequency: "daily", priority: 0.9 },
  { path: "/parking", changeFrequency: "hourly", priority: 0.8 },
  { path: "/coupons", changeFrequency: "daily", priority: 0.7 },
  { path: "/bus", changeFrequency: "weekly", priority: 0.7 },
  { path: "/weather", changeFrequency: "hourly", priority: 0.6 },
  { path: "/announcements", changeFrequency: "daily", priority: 0.6 },
  { path: "/search", changeFrequency: "monthly", priority: 0.3 },
  { path: "/features", changeFrequency: "monthly", priority: 0.3 },
  { path: "/resident", changeFrequency: "daily", priority: 0.8 },
  { path: "/resident/announcements", changeFrequency: "daily", priority: 0.7 },
  { path: "/resident/outages", changeFrequency: "daily", priority: 0.7 },
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
