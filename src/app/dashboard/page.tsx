import Link from "next/link";
import { Calendar, Users, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  getProfile,
  getAppointments,
  getPatients,
  getPayments,
  getMonthlyRevenue,
} from "@/lib/data";
import { formatCurrency, formatDateTime, getPatientName } from "@/lib/utils";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [todayAppointments, allAppointments, patients, payments, monthlyRevenue] =
    await Promise.all([
      getAppointments(user.id, todayStart, todayEnd),
      getAppointments(user.id),
      getPatients(user.id),
      getPayments(user.id),
      getMonthlyRevenue(user.id, now.getFullYear(), now.getMonth() + 1),
    ]);

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const upcomingAppointments = allAppointments
    .filter((a) => a.status !== "cancelled" && parseISO(a.start_time) > now)
    .slice(0, 5);

  const stats = [
    {
      label: "Consultas Hoje",
      value: todayAppointments.filter((a) => a.status !== "cancelled").length,
      icon: Calendar,
      href: "/dashboard/agenda",
    },
    {
      label: "Pacientes",
      value: patients.length,
      icon: Users,
      href: "/dashboard/pacientes",
    },
    {
      label: "Pagamentos Pendentes",
      value: pendingPayments.length,
      icon: AlertCircle,
      href: "/dashboard/financeiro",
    },
    {
      label: "Faturamento do Mês",
      value: formatCurrency(monthlyRevenue.total),
      icon: DollarSign,
      href: "/dashboard/financeiro",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Olá, {profile?.full_name?.split(" ")[0] || "Psicóloga"}
        </h1>
        <p className="text-stone-600">Visão geral do seu consultório</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-teal-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <Icon className="h-6 w-6 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">{stat.label}</p>
                    <p className="text-xl font-bold text-stone-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consultas de Hoje</CardTitle>
            <Link href="/dashboard/agenda">
              <Button variant="ghost" size="sm">
                Ver agenda
              </Button>
            </Link>
          </CardHeader>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma consulta hoje.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">{getPatientName(apt)}</p>
                    <p className="text-sm text-stone-500">
                      {formatDateTime(apt.start_time)} — {apt.modality}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">{getPatientName(apt)}</p>
                    <p className="text-sm text-stone-500">{formatDateTime(apt.start_time)}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
