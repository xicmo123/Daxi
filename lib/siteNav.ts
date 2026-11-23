// Shared shape for the two feature maps (lib/touristNav.ts and
// lib/residentNav.ts). The skin's header menu, finder, page-header trail and
// footer all take one of these, so both halves of the app are driven the
// same way.

export type SiteIconKey =
  | "outage"
  | "garbage"
  | "roadworks"
  | "announcement"
  | "bus"
  | "camera"
  | "clinic"
  | "aed"
  | "phone"
  | "bulletin"
  | "event"
  | "report"
  | "link"
  | "profile"
  | "spot"
  | "food"
  | "walk"
  | "coupon"
  | "parking"
  | "weather"
  | "search"
  | "info"
  | "heart"
  | "doc";

export type SiteNavItem = {
  key: string;
  label: string;
  desc: string;
  href: string;
  icon: SiteIconKey;
  /** Extra words the finder should match on. */
  keywords: string[];
  /** Opens an in-page sheet instead of a separate route. */
  sheet?: "garbage";
};

export type SitePhoto = { src: string; author: string; sourceUrl: string };

export type SiteNavGroup = {
  key: string;
  label: string;
  intro: string;
  photo: SitePhoto;
  items: SiteNavItem[];
};

/** Every distinct destination across the groups (first occurrence wins). */
export function allNavItems(groups: SiteNavGroup[], extra: SiteNavItem[] = []): SiteNavItem[] {
  const seen = new Set<string>();
  const out: SiteNavItem[] = [];
  for (const item of [...groups.flatMap((g) => g.items), ...extra]) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }
  return out;
}

export function findNavItems(items: SiteNavItem[], query: string): SiteNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())),
  );
}

/** The menu group a page belongs to, for breadcrumbs and sibling tabs. */
export function navTrail(groups: SiteNavGroup[], href: string): { group?: SiteNavGroup; item?: SiteNavItem } {
  for (const group of groups) {
    const item = group.items.find((i) => i.href === href);
    if (item) return { group, item };
  }
  return {};
}
