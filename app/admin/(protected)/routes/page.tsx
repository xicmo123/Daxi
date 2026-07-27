import { readWalkingRoutes } from "@/lib/routesData";
import RouteList from "@/components/admin/RouteList";

export const dynamic = "force-dynamic";

export default async function RoutesDashboard() {
  const routes = await readWalkingRoutes();
  return <RouteList routes={routes} />;
}
