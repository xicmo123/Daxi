import type { Business } from "./businesses";
import type { PlaceDetail } from "./placeDetails";
import type { LiveParkingLot } from "./tycgParking";

export function walkTimeLabel(distanceMeters: number): string {
  return `${Math.max(1, Math.round(distanceMeters / 80))} 分鐘`;
}

export function experienceTags(business: Business, detail?: PlaceDetail): string[] {
  const tags = new Set<string>();
  const name = business.name;
  const category = detail?.category ?? "";
  const distance = business.distanceMeters;

  if (distance <= 450) tags.add("老街步行 5 分鐘");
  else if (distance <= 900) tags.add("老街步行 10 分鐘");

  if (business.tag === "美食") {
    if (name.includes("豆干") || category.includes("豆干")) tags.add("大溪豆干");
    if (business.reviewCount >= 3000) tags.add("人氣排隊");
    if ((business.rating ?? 0) >= 4.5) tags.add("高評分");
    if (business.googleType?.includes("vegetarian") || business.googleType?.includes("vegan")) tags.add("蔬食友善");
  }

  if (business.tag === "景點") {
    if (category.includes("木藝") || name.includes("木藝")) tags.add("木藝散步");
    if (category.includes("自然") || name.includes("公園") || name.includes("濕地")) tags.add("親子走走");
    if (category.includes("古蹟") || category.includes("歷史") || name.includes("老街")) tags.add("歷史地標");
    if (business.distanceMeters <= 700) tags.add("順路景點");
  }

  if (business.tag === "市集") tags.add("伴手禮");

  for (const raw of detail?.tags ?? []) {
    const clean = raw.replace(/^#/, "").trim();
    if (clean) tags.add(clean);
  }

  return Array.from(tags).slice(0, 3);
}

export type SuggestedRoute = {
  id: string;
  title: string;
  desc: string;
  stops: Array<{ placeId: string; name: string; walkTime: string }>;
};

// Auto-built from existing tagged spot/business data (no hand-authored
// itinerary content to keep in sync) — grouped by the same experienceTags
// used elsewhere, ordered by distance from the old street.
export function buildSuggestedRoutes(allBusinesses: Business[], details: Record<string, PlaceDetail>): SuggestedRoute[] {
  const tagged = allBusinesses.map((b) => ({ b, tags: experienceTags(b, details[b.placeId]) }));
  const toStop = (b: Business) => ({ placeId: b.placeId, name: b.name, walkTime: walkTimeLabel(b.distanceMeters) });

  const heritageSpots = tagged
    .filter(({ b, tags }) => b.tag === "景點" && (tags.includes("歷史地標") || tags.includes("木藝散步")))
    .map(({ b }) => b)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);
  const nearbyFood = allBusinesses
    .filter((b) => b.tag === "美食")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 2);
  const heritageRoute: SuggestedRoute = {
    id: "heritage",
    title: "老街人文半日遊",
    desc: "古蹟＋木藝散步，中途順路吃點在地小吃",
    stops: [...heritageSpots, ...nearbyFood].sort((a, b) => a.distanceMeters - b.distanceMeters).map(toStop),
  };

  const natureSpots = tagged
    .filter(({ b, tags }) => b.tag === "景點" && tags.includes("親子走走"))
    .map(({ b }) => b)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 4);
  const natureRoute: SuggestedRoute = {
    id: "nature",
    title: "親子自然路線",
    desc: "公園、河濱綠地，適合帶小孩慢慢走",
    stops: natureSpots.map(toStop),
  };

  return [heritageRoute, natureRoute].filter((r) => r.stops.length >= 2);
}

const INDOOR_KEYWORDS = ["博物館", "美術館", "展館", "紀念館", "文化館", "生態博物館", "室內", "圖書館", "古宅"];

// No structured "indoor" field on curated places yet, so infer it from
// name/category text — good enough to bias the weather-driven spot order
// without a data-migration.
export function isIndoorSpot(name: string, category?: string): boolean {
  const text = `${name} ${category ?? ""}`;
  return INDOOR_KEYWORDS.some((kw) => text.includes(kw));
}

const OLD_STREET_RADIUS_METERS = 900;

export type ParkingCongestion = {
  isCongested: boolean;
  occupancyPct: number;
  nearLots: LiveParkingLot[];
  alternatives: LiveParkingLot[];
  lateBirdExtraMinutes: number;
};

// "Near the old street" lots at >80% occupancy is the trigger for the
//防塞預警 banner — surfaces outer, still-open lots as the alternative.
export function parkingCongestion(lots: LiveParkingLot[]): ParkingCongestion {
  const nearLots = lots.filter((l) => l.distanceMeters <= OLD_STREET_RADIUS_METERS && !l.isOpenAccess && l.total > 0);
  const totalCapacity = nearLots.reduce((sum, l) => sum + l.total, 0);
  const totalSurplus = nearLots.reduce((sum, l) => sum + (l.surplus ?? 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round(((totalCapacity - totalSurplus) / totalCapacity) * 100) : 0;
  const isCongested = nearLots.length > 0 && occupancyPct > 80;

  const alternatives = lots
    .filter((l) => l.distanceMeters > OLD_STREET_RADIUS_METERS && l.status !== "full")
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);

  // No live traffic-delay feed for Daxi, so this is a heuristic band off
  // occupancy + weekend/holiday afternoon, purely indicative ("晚鳥逃脫").
  const now = new Date();
  const isWeekendAfternoon = [0, 6].includes(now.getDay()) && now.getHours() >= 13 && now.getHours() <= 18;
  const lateBirdExtraMinutes = isCongested ? (isWeekendAfternoon ? 25 : 12) : 0;

  return { isCongested, occupancyPct, nearLots, alternatives, lateBirdExtraMinutes };
}

// Heuristic "how busy will the old street be" score — no live footfall feed
// exists, so this blends known signals (roadwork count, weekend/afternoon,
// festival) into a 0-100 band for the resident "週末出門指數" card.
export function congestionScore({
  roadworkCount,
  isFestivalToday,
  now = new Date(),
}: {
  roadworkCount: number;
  isFestivalToday: boolean;
  now?: Date;
}): number {
  const day = now.getDay();
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;
  const isAfternoon = hour >= 12 && hour <= 18;

  let score = 20;
  score += Math.min(roadworkCount, 5) * 8;
  if (isWeekend) score += 25;
  if (isWeekend && isAfternoon) score += 15;
  if (isFestivalToday) score += 30;

  return Math.max(0, Math.min(100, score));
}
