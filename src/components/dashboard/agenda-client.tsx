"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarView, AppointmentDetail } from "@/components/calendar/calendar-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment, BlockedSlot } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface AgendaClientProps {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
}

export function AgendaClient({
  appointments,
  blockedSlots,
}: AgendaClientProps) {
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockDate, setBlockDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [blockStart, setBlockStart] = useState("08:00");
  const [blockEnd, setBlockEnd] = useState("12:00");
  const [blockReason, setBlockReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    if (!selectedAppointment) return;
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedAppointment.id, status }),
    });
    setSelectedAppointment(null);
    router.refresh();
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    const reason = prompt("Motivo do cancelamento (opcional):");
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedAppointment.id,
        status: "cancelled",
        cancellation_reason: reason || "",
      }),
    });
    setSelectedAppointment(null);
    router.refresh();
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const start = new Date(`${blockDate}T${blockStart}:00`);
    const end = new Date(`${blockDate}T${blockEnd}:00`);

    await fetch("/api/blocked-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        reason: blockReason,
      }),
    });

    setShowBlockForm(false);
    setLoading(false);
    router.refresh();
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Remover este bloqueio?")) return;
    await fetch(`/api/blocked-slots?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Agenda</h1>
          <p className="text-stone-600">Gerencie consultas e bloqueios de horário</p>
        </div>
        <Button onClick={() => setShowBlockForm(!showBlockForm)}>
          {showBlockForm ? "Cancelar" : "Bloquear Horário"}
        </Button>
      </div>

      {showBlockForm && (
        <Card>
          <CardHeader>
            <CardTitle>Bloquear Horário</CardTitle>
          </CardHeader>
          <form onSubmit={handleBlockSlot} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              id="blockDate"
              label="Data"
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              required
            />
            <Input
              id="blockStart"
              label="Início"
              type="time"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
              required
            />
            <Input
              id="blockEnd"
              label="Fim"
              type="time"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
              required
            />
            <Input
              id="blockReason"
              label="Motivo"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Férias, compromisso..."
            />
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Bloqueio"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CalendarView
          appointments={appointments}
          blockedSlots={blockedSlots}
          onAppointmentClick={setSelectedAppointment}
        />
      </Card>

      {blockedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Horários Bloqueados</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {blockedSlots.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {formatDateTime(block.start_time)} — {formatDateTime(block.end_time)}
                  </p>
                  {block.reason && (
                    <p className="text-sm text-stone-500">{block.reason}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBlock(block.id)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={handleStatusChange}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
