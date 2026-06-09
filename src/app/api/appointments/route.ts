import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { addMinutes } from "date-fns";
import { sendEmailConfirmation } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      psychologist_id,
      guest_name,
      guest_email,
      guest_phone,
      start_time,
      modality,
      patient_id,
    } = body;

    if (!psychologist_id || !start_time || !modality) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createServiceClient()
      : await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", psychologist_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Psicóloga não encontrada" }, { status: 404 });
    }

    const startDate = new Date(start_time);
    const endDate = addMinutes(startDate, profile.session_duration_minutes);

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        psychologist_id,
        patient_id: patient_id || null,
        guest_name,
        guest_email,
        guest_phone,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        modality,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (guest_email) {
      await sendEmailConfirmation(guest_email, { profile, appointment });
    }

    await supabase
      .from("appointments")
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq("id", appointment.id);

    return NextResponse.json({ appointment, whatsappSent: !!guest_phone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, cancellation_reason } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (status) {
      updates.status = status;
      if (status === "confirmed") updates.confirmed_at = new Date().toISOString();
      if (status === "cancelled") {
        updates.cancelled_at = new Date().toISOString();
        updates.cancellation_reason = cancellation_reason || "";
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .eq("psychologist_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (status === "completed" && data.patient_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("session_price")
        .eq("id", user.id)
        .single();

      await supabase.from("payments").insert({
        psychologist_id: user.id,
        patient_id: data.patient_id,
        appointment_id: data.id,
        amount: profile?.session_price || 0,
        status: "pending",
      });
    }

    return NextResponse.json({ appointment: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
