import { notFound } from "next/navigation";
import { getTrafficAlert } from "@/lib/trafficAlerts";
import TrafficAlertForm from "@/components/admin/TrafficAlertForm";

export const dynamic = "force-dynamic";

export default async function EditTrafficAlertPage({ params }: { params: Promise<{ alertId: string }> }) {
  const { alertId } = await params;
  const alert = await getTrafficAlert(alertId);
  if (!alert) notFound();
  return <TrafficAlertForm alert={alert} />;
}
