import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const psychologistId = process.env.NEXT_PUBLIC_PSYCHOLOGIST_ID;

    let query = supabase.from("profiles").select("*");
    if (psychologistId) {
      query = query.eq("id", psychologistId);
    } else {
      query = query.limit(1);
    }

    const { data: profile } = await query.single();
    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ profile: null });
  }
}
