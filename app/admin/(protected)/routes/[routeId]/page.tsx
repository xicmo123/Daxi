import { notFound } from "next/navigation";
import { getWalkingRoute } from "@/lib/routesData";
import RouteForm from "@/components/admin/RouteForm";

export const dynamic = "force-dynamic";

export default async function EditRoutePage({ params }: { params: Promise<{ routeId: string }> }) {
  const { routeId } = await params;
  const route = await getWalkingRoute(routeId);
  if (!route) notFound();
  return <RouteForm route={route} />;
}
