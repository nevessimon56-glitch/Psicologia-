import { getCurrentUser, getAppointments, getBlockedSlots } from "@/lib/data";
import { AgendaClient } from "@/components/dashboard/agenda-client";

export default async function AgendaPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [appointments, blockedSlots] = await Promise.all([
    getAppointments(user.id),
    getBlockedSlots(user.id),
  ]);

  return <AgendaClient appointments={appointments} blockedSlots={blockedSlots} />;
}
