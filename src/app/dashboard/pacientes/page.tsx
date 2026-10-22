import { getCurrentUser, getPatients } from "@/lib/data";
import { PatientsClient } from "@/components/dashboard/patients-client";

export default async function PacientesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const patients = await getPatients(user.id);
  return <PatientsClient patients={patients} />;
}
