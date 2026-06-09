import { createClient } from "@/lib/supabase/server";
import type { Appointment, Patient, Payment, Profile, SessionNote } from "./types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getPublicProfile(psychologistId?: string): Promise<Profile | null> {
  const supabase = await createClient();
  const id = psychologistId || process.env.NEXT_PUBLIC_PSYCHOLOGIST_ID;
  if (!id) {
    const { data } = await supabase.from("profiles").select("*").limit(1).single();
    return data;
  }
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return data;
}

export async function getAppointments(
  psychologistId: string,
  from?: string,
  to?: string
): Promise<Appointment[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, patients(*)")
    .eq("psychologist_id", psychologistId)
    .order("start_time", { ascending: true });

  if (from) query = query.gte("start_time", from);
  if (to) query = query.lte("start_time", to);

  const { data } = await query;
  return data || [];
}

export async function getPatients(psychologistId: string): Promise<Patient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .order("full_name");
  return data || [];
}

export async function getPatient(patientId: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();
  return data;
}

export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("start_time", { ascending: false });
  return data || [];
}

export async function getSessionNotes(patientId: string): Promise<SessionNote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("session_notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPayments(psychologistId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, patients(*), appointments(*)")
    .eq("psychologist_id", psychologistId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPatientPayments(patientId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, appointments(*)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBlockedSlots(psychologistId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_slots")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .order("start_time");
  return data || [];
}

export async function getMonthlyRevenue(psychologistId: string, year: number, month: number) {
  const supabase = await createClient();
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data } = await supabase
    .from("payments")
    .select("amount, status, paid_at")
    .eq("psychologist_id", psychologistId)
    .eq("status", "paid")
    .gte("paid_at", start)
    .lte("paid_at", end);

  const total = (data || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const count = (data || []).length;
  return { total, count, payments: data || [] };
}
