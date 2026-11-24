// URL and copy helpers for the per-place pages (/spots/[placeId] and
// /businesses/[placeId]). Pure functions only, so client list components can
// import placeHref without dragging in the fs-backed places store.
import type { Business } from "./businesses";
import { categoryLabel, type PlaceDetail } from "./placeDetails";

/** 景點 live under /spots, everything else (美食/市集) under /businesses. */
export function placeSection(tag: Business["tag"]): "/spots" | "/businesses" {
  return tag === "景點" ? "/spots" : "/businesses";
}

export function placeHref(place: Pick<Business, "placeId" | "tag">): string {
  return `${placeSection(place.tag)}/${encodeURIComponent(place.placeId)}`;
}

// Google listing names often carry marketing tails — "老地方客家菜｜大溪超人氣美食｜團體合菜"
// or "…豆花《響應去塑化…》". The first segment is the actual shop name and the
// only part worth putting in a <title> or heading.
export function shortPlaceName(name: string): string {
  const head = name.split(/[｜|《【]/)[0]?.trim();
  return head && head.length >= 2 ? head : name.trim();
}

// "大溪" isn't in every shop name, but it is what people search with, so the
// category carries it: 「老阿伯現滷豆干：大溪豆干老店・營業時間、地址、停車」.
// 營業時間 leads when we have hours — 「店名 營業時間」 is the most common search.
export function placeTitle(place: Business, detail: PlaceDetail | undefined, hasHours = false): string {
  const name = shortPlaceName(place.name);
  const category = categoryLabel(detail?.category, place.googleType, place.tag);
  return `${name}：大溪${category}・${hasHours ? "營業時間、地址、停車" : "地址、停車資訊"}`;
}

export function placeDescription(place: Business, detail: PlaceDetail | undefined, hasHours = false): string {
  const name = shortPlaceName(place.name);
  const category = categoryLabel(detail?.category, place.googleType, place.tag);
  const facts = [
    `${name}，桃園大溪${category}`,
    place.address ? `地址：${place.address.replace(/^\d{3,6}\s*台灣/, "")}` : null,
    `距大溪老街 ${place.distanceLabel}`,
    place.rating !== null && place.reviewCount > 0 ? `Google 評分 ${place.rating.toFixed(1)}（${place.reviewCount.toLocaleString()} 則評論）` : null,
  ].filter(Boolean);
  const story = detail?.story?.trim();
  const text = story ? `${story} ${facts.join("，")}。` : `${facts.join("，")}。附${hasHours ? "每週營業時間、" : ""}最近停車場、周邊景點美食與導航。`;
  return text.length > 150 ? `${text.slice(0, 148)}…` : text;
}

const SCHEMA_TYPE_BY_GOOGLE: Record<string, string> = {
  restaurant: "Restaurant",
  chinese_restaurant: "Restaurant",
  taiwanese_restaurant: "Restaurant",
  vegetarian_restaurant: "Restaurant",
  vegan_restaurant: "Restaurant",
  european_restaurant: "Restaurant",
  fast_food_restaurant: "FastFoodRestaurant",
  cafe: "CafeOrCoffeeShop",
  coffee_shop: "CafeOrCoffeeShop",
  bakery: "Bakery",
  dessert_shop: "FoodEstablishment",
  pastry_shop: "Bakery",
  bar: "BarOrPub",
  meal_takeaway: "FoodEstablishment",
  market: "Store",
  supermarket: "GroceryStore",
};

function schemaType(place: Business): string {
  if (place.tag === "景點") return "TouristAttraction";
  if (place.googleType && SCHEMA_TYPE_BY_GOOGLE[place.googleType]) return SCHEMA_TYPE_BY_GOOGLE[place.googleType];
  return place.tag === "美食" ? "FoodEstablishment" : "Store";
}

/** schema.org description of the place for rich results (address, geo, rating). */
export function placeJsonLd(
  place: Business,
  detail: PlaceDetail | undefined,
  { url, image }: { url: string; image?: string },
) {
  const phone = detail?.contact?.phone?.trim() || place.phone || undefined;
  const sameAs = [detail?.contact?.website, detail?.contact?.facebook, detail?.contact?.instagram]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v && /^https?:\/\//i.test(v)));
  return {
    "@context": "https://schema.org",
    "@type": schemaType(place),
    "@id": `${url}#place`,
    name: shortPlaceName(place.name),
    url,
    description: detail?.story?.trim() || undefined,
    image,
    telephone: phone,
    address: place.address
      ? {
          "@type": "PostalAddress",
          streetAddress: place.address,
          addressLocality: "大溪區",
          addressRegion: "桃園市",
          addressCountry: "TW",
        }
      : undefined,
    geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
    hasMap: place.mapsUrl,
    containedInPlace: { "@type": "Place", name: "桃園市大溪區" },
    sameAs: sameAs.length ? sameAs : undefined,
    // Google only accepts review markup the site itself collected for some
    // types, so the Google rating stays on the page as text, not as
    // aggregateRating — claiming it would be self-serving review markup.
  };
}

/**
 * Click handler for a list card that is a real link to the place page (so
 * crawlers follow it) but opens the quick-look modal on a plain tap. New-tab
 * and modified clicks fall through to the link.
 */
export function quickLookClick(open: () => void) {
  return (e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number; preventDefault: () => void }) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open();
  };
}
