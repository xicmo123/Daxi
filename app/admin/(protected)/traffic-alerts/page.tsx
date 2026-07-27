import { readTrafficAlerts } from "@/lib/trafficAlerts";
import TrafficAlertList from "@/components/admin/TrafficAlertList";

export const dynamic = "force-dynamic";

export default async function TrafficAlertsDashboard() {
  const alerts = await readTrafficAlerts();
  return <TrafficAlertList alerts={alerts} />;
}
