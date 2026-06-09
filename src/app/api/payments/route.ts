import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateReceiptNumber() {
  const now = new Date();
  const prefix = `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${prefix}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("payments")
      .insert({ ...body, psychologist_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
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

    const { id, status, payment_method, notes } = await request.json();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
        updates.receipt_number = generateReceiptNumber();
      }
    }
    if (payment_method) updates.payment_method = payment_method;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .eq("psychologist_id", user.id)
      .select("*, patients(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
