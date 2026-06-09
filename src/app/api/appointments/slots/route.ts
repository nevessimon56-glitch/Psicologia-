import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTimeSlots } from "@/lib/utils";
import type { WorkingHours } from "@/lib/types";
import { endOfDay, parseISO, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const psychologistId = searchParams.get("psychologist_id");
    const dateStr = searchParams.get("date");

    if (!psychologistId || !dateStr) {
      return NextResponse.json({ error: "Parâmetros obrigatórios" }, { status: 400 });
    }

    const supabase = await createClient();
    const date = parseISO(dateStr);

    const { data: profile } = await supabase
      .from("profiles")
      .select("working_hours, session_duration_minutes")
      .eq("id", psychologistId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Psicóloga não encontrada" }, { status: 404 });
    }

    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    const [{ data: appointments }, { data: blockedSlots }] = await Promise.all([
      supabase
        .from("appointments")
        .select("start_time, end_time, status")
        .eq("psychologist_id", psychologistId)
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd)
        .neq("status", "cancelled"),
      supabase
        .from("blocked_slots")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd),
    ]);

    const slots = generateTimeSlots(
      date,
      profile.working_hours as WorkingHours,
      profile.session_duration_minutes,
      appointments || [],
      blockedSlots || []
    );

    return NextResponse.json({
      slots: slots.map((s) => s.toISOString()),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
