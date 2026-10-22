export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type PaymentStatus = "pending" | "paid" | "cancelled";

export type Modality = "presencial" | "online";

export interface WorkingDay {
  start: string;
  end: string;
  enabled: boolean;
}

export interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export interface Profile {
  id: string;
  full_name: string;
  crp: string;
  email: string;
  phone: string;
  whatsapp: string;
  photo_url: string;
  bio: string;
  specialties: string[];
  service_types: string[];
  session_price: number;
  session_duration_minutes: number;
  cancellation_notice_hours: number;
  working_hours: WorkingHours;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  psychologist_id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string | null;
  cpf: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  therapeutic_goals: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  psychologist_id: string;
  patient_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  start_time: string;
  end_time: string;
  modality: Modality;
  status: AppointmentStatus;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  confirmation_sent_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  patients?: Patient | null;
}

export interface BlockedSlot {
  id: string;
  psychologist_id: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
}

export interface SessionNote {
  id: string;
  appointment_id: string | null;
  patient_id: string;
  psychologist_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  psychologist_id: string;
  patient_id: string;
  appointment_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: string;
  paid_at: string | null;
  receipt_number: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  patients?: Patient | null;
  appointments?: Appointment | null;
}

export const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  sunday: "Domingo",
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Realizado",
  no_show: "Falta",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado",
};
