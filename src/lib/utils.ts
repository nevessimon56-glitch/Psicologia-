import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addMinutes,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BlockedSlot, WorkingHours } from "./types";
import { DAY_KEYS } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getDayKey(date: Date): keyof WorkingHours {
  return DAY_KEYS[date.getDay()] as keyof WorkingHours;
}

export function parseTimeToDate(baseDate: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return setMinutes(setHours(baseDate, hours), minutes);
}

export function generateTimeSlots(
  date: Date,
  workingHours: WorkingHours,
  durationMinutes: number,
  existingAppointments: { start_time: string; end_time: string }[],
  blockedSlots: BlockedSlot[]
): Date[] {
  const dayKey = getDayKey(date);
  const dayConfig = workingHours[dayKey];

  if (!dayConfig?.enabled) return [];

  const slots: Date[] = [];
  const start = parseTimeToDate(date, dayConfig.start);
  const end = parseTimeToDate(date, dayConfig.end);

  let current = start;
  while (addMinutes(current, durationMinutes) <= end) {
    const slotEnd = addMinutes(current, durationMinutes);
    const isBlocked = blockedSlots.some((block) => {
      const blockStart = parseISO(block.start_time);
      const blockEnd = parseISO(block.end_time);
      return (
        isWithinInterval(current, { start: blockStart, end: blockEnd }) ||
        isWithinInterval(slotEnd, { start: blockStart, end: blockEnd }) ||
        (current <= blockStart && slotEnd >= blockEnd)
      );
    });

    const isBooked = existingAppointments.some((apt) => {
      const aptStart = parseISO(apt.start_time);
      const aptEnd = parseISO(apt.end_time);
      return (
        isSameDay(aptStart, date) &&
        (isWithinInterval(current, { start: aptStart, end: aptEnd }) ||
          isWithinInterval(slotEnd, { start: aptStart, end: aptEnd }) ||
          (current <= aptStart && slotEnd >= aptEnd))
      );
    });

    if (!isBlocked && !isBooked && current > new Date()) {
      slots.push(new Date(current));
    }

    current = addMinutes(current, durationMinutes);
  }

  return slots;
}

export function canCancelAppointment(
  startTime: string,
  cancellationNoticeHours: number
): boolean {
  const start = parseISO(startTime);
  const deadline = addMinutes(new Date(), cancellationNoticeHours * 60);
  return start > deadline;
}

export function formatWhatsAppLink(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function getPatientName(appointment: {
  guest_name?: string | null;
  patients?: { full_name: string } | null;
}) {
  return appointment.patients?.full_name || appointment.guest_name || "Paciente";
}
