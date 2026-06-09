"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime, formatWhatsAppLink } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function AgendarPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modality, setModality] = useState<"presencial" | "online">("online");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const psychologistId =
    process.env.NEXT_PUBLIC_PSYCHOLOGIST_ID || profile?.id || "";

  useEffect(() => {
    fetch("/api/profile/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          if (data.profile.service_types?.[0]) {
            setModality(data.profile.service_types[0] as "presencial" | "online");
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = psychologistId || profile?.id;
    if (!id) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/appointments/slots?psychologist_id=${id}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, [selectedDate, psychologistId, profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Selecione um horário");
      return;
    }

    setLoading(true);
    setError("");

    const id = psychologistId || profile?.id;
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        psychologist_id: id,
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        start_time: selectedSlot,
        modality,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao agendar");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    const whatsappLink =
      profile?.whatsapp &&
      formatWhatsAppLink(
        profile.whatsapp,
        `Olá! Acabei de agendar uma consulta para ${formatDateTime(selectedSlot!)}. Meu nome é ${name}.`
      );

    return (
      <div className="min-h-screen bg-stone-50">
        <PublicHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-teal-600" />
          <h1 className="mt-6 text-2xl font-bold text-stone-900">Agendamento Confirmado!</h1>
          <p className="mt-4 text-stone-600">
            Sua consulta foi agendada para{" "}
            <strong>{formatDateTime(selectedSlot!)}</strong> ({modality}).
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Um e-mail de confirmação foi enviado para {email}.
          </p>
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
              <Button>Confirmar no WhatsApp</Button>
            </a>
          )}
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">Voltar ao site</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  return (
    <div className="min-h-screen bg-stone-50">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900">Agendar Consulta</h1>
        {profile && (
          <p className="mt-2 text-stone-600">
            com {profile.full_name} — {formatCurrency(profile.session_price)} por sessão
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Escolha a data</CardTitle>
            </CardHeader>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {availableDays.map((day) => (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedSlot(null);
                  }}
                  className={`flex-shrink-0 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                    format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                      ? "border-teal-500 bg-teal-50 text-teal-800"
                      : "border-stone-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <p className="text-xs text-stone-500">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p className="font-semibold">{format(day, "d")}</p>
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Escolha o horário</CardTitle>
            </CardHeader>
            {slots.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhum horário disponível nesta data.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedSlot === slot
                        ? "border-teal-500 bg-teal-700 text-white"
                        : "border-stone-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    {format(parseISO(slot), "HH:mm")}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Modalidade e dados</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Select
                id="modality"
                label="Modalidade"
                value={modality}
                onChange={(e) => setModality(e.target.value as "presencial" | "online")}
                options={[
                  { value: "online", label: "Online" },
                  { value: "presencial", label: "Presencial" },
                ]}
              />
              <Input
                id="name"
                label="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="phone"
                label="WhatsApp / Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </Card>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedSlot}>
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>

          {profile?.cancellation_notice_hours && (
            <p className="text-center text-xs text-stone-500">
              Cancelamentos devem ser feitos com pelo menos{" "}
              {profile.cancellation_notice_hours} horas de antecedência.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
