// Canonical public origin. Used for metadataBase, sitemap and robots, all of
// which must emit absolute URLs. Overridable so a staging host doesn't
// advertise production URLs to crawlers.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://daxi.zequo.net";
