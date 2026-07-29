import HomeSpotOrderList from "@/components/admin/HomeSpotOrderList";
import { readHomeSpotOrder, sortByHomeSpotOrder } from "@/lib/homeSpotOrder";
import { filterVisiblePlaces, getAllPlaces, readDetails, readPhotos } from "@/lib/placesStore";

export const dynamic = "force-dynamic";

export default async function HomeSpotsPage() {
  const [rawPlaces, details, photos, savedOrder] = await Promise.all([getAllPlaces(), readDetails(), readPhotos(), readHomeSpotOrder()]);
  const spots = sortByHomeSpotOrder(
    filterVisiblePlaces(rawPlaces, details).filter((place) => place.tag === "景點"),
    savedOrder,
  );
  const rows = spots.map((place) => ({
    place,
    photo: photos[place.placeId],
    detail: details[place.placeId],
  }));

  return <HomeSpotOrderList key={spots.map((spot) => spot.placeId).join(",")} rows={rows} />;
}
