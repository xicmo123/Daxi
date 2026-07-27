import { readClinics } from "@/lib/clinicData";
import ClinicList from "@/components/admin/ClinicList";

export const dynamic = "force-dynamic";

export default async function ResidentClinicsDashboard() {
  const clinics = await readClinics();
  return <ClinicList clinics={clinics} />;
}
