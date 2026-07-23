import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";
import { getAllPlaces, readDetails } from "@/lib/placesStore";
import { getCouponsForPlace } from "@/lib/coupons";
import MerchantDashboard from "@/components/merchant/MerchantDashboard";

export const dynamic = "force-dynamic";

export default async function MerchantHomePage() {
  const cookieStore = await cookies();
  const session = await verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) redirect("/merchant/login");

  const [places, details, coupons] = await Promise.all([
    getAllPlaces(),
    readDetails(),
    getCouponsForPlace(session.placeId),
  ]);
  const place = places.find((p) => p.placeId === session.placeId);
  if (!place) redirect("/merchant/login");

  return (
    <MerchantDashboard
      businessName={place.name}
      hours={details[session.placeId]?.hours ?? ""}
      coupon={coupons[0] ?? null}
    />
  );
}
