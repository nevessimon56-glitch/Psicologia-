"use client";

import { useState } from "react";
import {
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { cn, formatDateTime, getPatientName } from "@/lib/utils";
import type { Appointment, BlockedSlot } from "@/lib/types";

interface CalendarViewProps {
  appointments: Appointment[];
  blockedSlots?: BlockedSlot[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
}

export function CalendarView({
  appointments,
  blockedSlots = [],
  onAppointmentClick,
  onDateClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const navigate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((apt) => isSameDay(parseISO(apt.start_time), day));

  const getBlocksForDay = (day: Date) =>
    blockedSlots.filter((block) => isSameDay(parseISO(block.start_time), day));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold capitalize text-stone-900">
            {format(currentDate, view === "month" ? "MMMM yyyy" : "'Semana de' dd MMM", {
              locale: ptBR,
            })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hoje
          </Button>
        </div>
        <div className="flex rounded-lg border border-stone-200 p-1">
          <button
            onClick={() => setView("week")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "week" ? "bg-teal-700 text-white" : "text-stone-600 hover:bg-stone-50"
            )}
          >
            Semanal
          </button>
          <button
            onClick={() => setView("month")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "month" ? "bg-teal-700 text-white" : "text-stone-600 hover:bg-stone-50"
            )}
          >
            Mensal
          </button>
        </div>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const dayBlocks = getBlocksForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[200px] rounded-xl border p-3",
                  isToday ? "border-teal-300 bg-teal-50/50" : "border-stone-200 bg-white"
                )}
              >
                <button
                  onClick={() => onDateClick?.(day)}
                  className="mb-2 w-full text-left"
                >
                  <p className="text-xs font-medium uppercase text-stone-500">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      isToday ? "text-teal-700" : "text-stone-900"
                    )}
                  >
                    {format(day, "d")}
                  </p>
                </button>
                <div className="space-y-1.5">
                  {dayBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-md bg-stone-200 px-2 py-1 text-xs text-stone-600"
                    >
                      Bloqueado
                    </div>
                  ))}
                  {dayAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className="w-full rounded-md bg-teal-100 px-2 py-1.5 text-left text-xs hover:bg-teal-200 transition-colors"
                    >
                      <p className="font-medium text-teal-900 truncate">
                        {format(parseISO(apt.start_time), "HH:mm")} — {getPatientName(apt)}
                      </p>
                      <StatusBadge status={apt.status} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-stone-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px]" />
            ))}
            {monthDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isToday = isSameDay(day, new Date());
              const inMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateClick?.(day)}
                  className={cn(
                    "min-h-[80px] rounded-lg border p-1.5 text-left transition-colors hover:border-teal-300",
                    isToday ? "border-teal-400 bg-teal-50" : "border-stone-100 bg-white",
                    !inMonth && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      isToday && "bg-teal-700 text-white font-semibold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className="truncate rounded bg-teal-100 px-1 text-[10px] text-teal-800"
                        >
                          {format(parseISO(apt.start_time), "HH:mm")} {getPatientName(apt)}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <p className="text-[10px] text-stone-500">
                          +{dayAppointments.length - 2} mais
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AppointmentDetail({
  appointment,
  onClose,
  onStatusChange,
  onCancel,
}: {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
  onCancel?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Detalhes do Agendamento</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-stone-500">Paciente:</span>{" "}
            <span className="font-medium">{getPatientName(appointment)}</span>
          </div>
          <div>
            <span className="text-stone-500">Data/hora:</span>{" "}
            <span className="font-medium">{formatDateTime(appointment.start_time)}</span>
          </div>
          <div>
            <span className="text-stone-500">Modalidade:</span>{" "}
            <span className="font-medium capitalize">{appointment.modality}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Status:</span>
            <StatusBadge status={appointment.status} />
          </div>
          {appointment.guest_phone && (
            <div>
              <span className="text-stone-500">Telefone:</span>{" "}
              <span className="font-medium">{appointment.guest_phone}</span>
            </div>
          )}
          {appointment.guest_email && (
            <div>
              <span className="text-stone-500">E-mail:</span>{" "}
              <span className="font-medium">{appointment.guest_email}</span>
            </div>
          )}
        </div>

        {onStatusChange && appointment.status !== "cancelled" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(["confirmed", "completed", "no_show"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={appointment.status === status ? "primary" : "outline"}
                onClick={() => onStatusChange(status)}
              >
                {status === "confirmed" ? "Confirmar" : status === "completed" ? "Realizado" : "Falta"}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {onCancel && appointment.status !== "cancelled" && (
            <Button variant="danger" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
