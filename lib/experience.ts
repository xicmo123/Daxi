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

const RELIEF_KEYWORDS = ["公廁", "廁所", "洗手間", "哺乳室", "哺集乳室", "育嬰室", "遊客中心", "旅客服務中心", "服務中心", "冷氣", "空調", "候車室", "休息室"];

// "緊急生理需求雷達" — no dedicated restroom/nursing-room dataset exists yet,
// so this filters the existing spot list by name/category/tag keywords for
// facilities that are actually usable as a bathroom/AC break/nursing stop.
export function isReliefSpot(name: string, category?: string, tags?: string[]): boolean {
  const text = `${name} ${category ?? ""} ${(tags ?? []).join(" ")}`;
  return RELIEF_KEYWORDS.some((kw) => text.includes(kw));
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

export function parkingSummary(lots: LiveParkingLot[]) {
  const openLots = lots.filter((l) => l.status !== "full");
  const availableStalls = lots.reduce((sum, lot) => sum + (lot.surplus ?? 0), 0);
  const recommended =
    openLots.find((l) => !l.isOpenAccess && (l.pct ?? 0) >= 15) ?? openLots.find((l) => l.status !== "full") ?? null;
  const fullCount = lots.filter((l) => l.status === "full").length;

  return {
    openLots,
    availableStalls,
    recommended,
    fullCount,
    tone: openLots.length === 0 ? "tight" : fullCount >= Math.ceil(lots.length / 2) ? "busy" : "ok",
  };
}
