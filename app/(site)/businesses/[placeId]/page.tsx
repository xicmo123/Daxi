import PlacePage from "@/components/PlacePage";
import { placePageMetadata } from "@/lib/placePageData";

// Content is edited through /admin and the merchant dashboard at runtime.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/businesses/[placeId]">) {
  const { placeId } = await params;
  return placePageMetadata(placeId);
}

export default async function Page({ params }: PageProps<"/businesses/[placeId]">) {
  const { placeId } = await params;
  return <PlacePage section="/businesses" placeId={placeId} />;
}
