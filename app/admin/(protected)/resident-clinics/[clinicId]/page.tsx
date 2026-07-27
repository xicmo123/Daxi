import { notFound } from "next/navigation";
import { getClinic } from "@/lib/clinicData";
import ClinicForm from "@/components/admin/ClinicForm";

export const dynamic = "force-dynamic";

export default async function EditClinicPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;
  const clinic = await getClinic(clinicId);
  if (!clinic) notFound();
  return <ClinicForm clinic={clinic} />;
}
