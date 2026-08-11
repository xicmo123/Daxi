import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Staff tools and the beacon endpoint. /admin and /merchant already
      // redirect unauthenticated visitors to a login page, but there's no
      // reason to spend crawl budget on them or surface them in results.
      disallow: ["/admin", "/merchant", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
