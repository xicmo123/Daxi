// Curated place metadata (category/story/tags) now lives in
// data/place-details.json, edited through the admin backend, and read at
// runtime via lib/placesStore.ts. This file only keeps the pure display
// helpers so client components can format a label without needing the
// server-only data layer.
// mode "inquiry" (Phase 1): outbound "ask to reserve" contact link.
// mode "slots" (Phase 2): in-app time-slot picker backed by lib/reservations.ts;
// contactType/contactValue become an optional backup contact.
export type ReservationDetail = {
  mode: "inquiry" | "slots";
  contactType?: "phone" | "line" | "form";
  contactValue?: string;
  note?: string;
};

export type PlaceDetail = {
  category?: string;
  story?: string;
  tags?: string[];
  reservation?: ReservationDetail;
  // Soft-hide: keeps the underlying place (lat/lng, Google Maps nav link)
  // intact for cross-links and the weekly refresh script, just excludes it
  // from the public-facing lists when Google's data for it is inaccurate.
  hidden?: boolean;
};

// Google's own place-type classification, translated — a safe, non-invented
// fallback category for shops/restaurants with no curated entry. Falls back
// to the business's tag (美食/景點/市集) when unmapped.
const GOOGLE_TYPE_LABELS: Record<string, string> = {
  restaurant: "餐廳",
  chinese_restaurant: "中式餐廳",
  taiwanese_restaurant: "台式料理",
  vegetarian_restaurant: "素食餐廳",
  vegan_restaurant: "蔬食餐廳",
  european_restaurant: "歐式餐廳",
  fast_food_restaurant: "速食",
  cafe: "咖啡廳",
  bakery: "烘焙坊",
  dessert_shop: "甜點店",
  pastry_shop: "糕餅舖",
  deli: "熟食店",
  bar: "酒吧",
  meal_takeaway: "外帶美食",
  market: "市場",
  supermarket: "超市",
  convenience_store: "便利商店",
  shopping_mall: "購物中心",
  clothing_store: "服飾店",
  gift_shop: "伴手禮店",
  store: "商店",
  pharmacy: "藥局",
  park: "公園",
  city_park: "公園",
  tourist_attraction: "觀光景點",
  historical_place: "歷史遺跡",
  museum: "博物館",
  bridge: "橋樑地標",
  place_of_worship: "宗教場所",
  church: "教堂",
};

export function categoryLabel(curatedCategory: string | undefined, googleType: string | null, fallback: string): string {
  if (curatedCategory) return curatedCategory;
  if (googleType && GOOGLE_TYPE_LABELS[googleType]) return GOOGLE_TYPE_LABELS[googleType];
  return fallback;
}
