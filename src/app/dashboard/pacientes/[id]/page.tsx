import { notFound } from "next/navigation";
import {
  getCurrentUser,
  getPatient,
  getPatientAppointments,
  getSessionNotes,
  getPatientPayments,
} from "@/lib/data";
import { PatientDetailClient } from "@/components/dashboard/patient-detail-client";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const patient = await getPatient(id);
  if (!patient || patient.psychologist_id !== user.id) notFound();

  const [appointments, notes, payments] = await Promise.all([
    getPatientAppointments(id),
    getSessionNotes(id),
    getPatientPayments(id),
  ]);

  return (
    <PatientDetailClient
      patient={patient}
      appointments={appointments}
      notes={notes}
      payments={payments}
    />
  );
}
