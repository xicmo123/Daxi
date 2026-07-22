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
