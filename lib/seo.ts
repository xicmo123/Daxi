import type { Metadata } from "next";
import { SITE_URL } from "./siteUrl";

export const SITE_NAME = "大溪通";

// Child segments replace the parent's openGraph object wholesale (metadata is
// merged shallowly), so every page that sets its own og:title must also carry
// siteName/locale/type or they silently drop. This builds the whole block.
// For the same reason the share image has to be listed here: a page's own
// openGraph block replaces the one the opengraph-image file contributes.
export function pageMetadata({
  path,
  title,
  description,
  noindex = false,
  image: ownImage,
}: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  /** A page-specific share image (e.g. the place photo) instead of the section default. */
  image?: { url: string; alt: string };
}): Metadata {
  const resident = path === "/resident" || path.startsWith("/resident/");
  const image = ownImage
    ? ownImage
    : resident
    ? { url: "/resident/opengraph-image.png", width: 1200, height: 630, alt: "我是大溪人：大溪居民每天要用的生活資訊" }
    : { url: "/opengraph-image.png", width: 1200, height: 630, alt: "大溪通：走進大溪老街，停車、景點、美食一次看" };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "zh_TW",
      url: path,
      title: `${title} ｜ ${SITE_NAME}`,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: `${title} ｜ ${SITE_NAME}`, description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** schema.org BreadcrumbList for a trail of [name, path] pairs. */
export function breadcrumbJsonLd(trail: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${SITE_URL}${crumb.path}` } : {}),
    })),
  };
}

/** Serialise JSON-LD safely for a <script> tag (no `</script>` breakout). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
