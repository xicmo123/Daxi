import { cache } from "react";
import type { Metadata } from "next";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "./placesStore";
import { placeDescription, placeHref, placeTitle, shortPlaceName } from "./placePages";
import { pageMetadata } from "./seo";

// One read per request, shared by generateMetadata and the page body.
export const loadPlacePage = cache(async (placeId: string) => {
  const [all, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  const places = filterVisiblePlaces(all, details);
  const place = places.find((p) => p.placeId === placeId) ?? null;
  return { place, places, photos, details };
});

export async function placePageMetadata(placeId: string): Promise<Metadata> {
  const { place, photos, details } = await loadPlacePage(placeId);
  if (!place) return { title: "找不到這個地點", robots: { index: false, follow: true } };
  const detail = details[place.placeId];
  const photo = photos[place.placeId];
  return pageMetadata({
    path: placeHref(place),
    title: placeTitle(place, detail),
    description: placeDescription(place, detail),
    image: photo ? { url: photo.src, alt: shortPlaceName(place.name) } : undefined,
  });
}
