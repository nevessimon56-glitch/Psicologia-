"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile, WorkingHours } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
interface SettingsClientProps {
  profile: Profile;
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name,
    crp: profile.crp,
    email: profile.email,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    photo_url: profile.photo_url,
    bio: profile.bio,
    specialties: profile.specialties?.join(", ") || "",
    address: profile.address,
    session_price: profile.session_price,
    session_duration_minutes: profile.session_duration_minutes,
    cancellation_notice_hours: profile.cancellation_notice_hours,
    working_hours: profile.working_hours as WorkingHours,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  };

  const updateWorkingDay = (
    day: keyof WorkingHours,
    field: "start" | "end" | "enabled",
    value: string | boolean
  ) => {
    setForm({
      ...form,
      working_hours: {
        ...form.working_hours,
        [day]: { ...form.working_hours[day], [field]: value },
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Configurações</h1>
        <p className="text-stone-600">Perfil profissional e preferências do consultório</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil Público</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="full_name"
              label="Nome completo"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <Input
              id="crp"
              label="CRP"
              value={form.crp}
              onChange={(e) => setForm({ ...form, crp: e.target.value })}
            />
            <Input
              id="email"
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              id="phone"
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              id="whatsapp"
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
            <Input
              id="photo_url"
              label="URL da foto"
              value={form.photo_url}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              placeholder="https://..."
            />
            <div className="sm:col-span-2">
              <Textarea
                id="bio"
                label="Biografia"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <Input
              id="specialties"
              label="Especialidades (separadas por vírgula)"
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
            />
            <Input
              id="address"
              label="Endereço do consultório"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atendimento</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              id="session_price"
              label="Valor da sessão (R$)"
              type="number"
              step="0.01"
              value={form.session_price}
              onChange={(e) =>
                setForm({ ...form, session_price: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              id="session_duration"
              label="Duração (minutos)"
              type="number"
              value={form.session_duration_minutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  session_duration_minutes: parseInt(e.target.value) || 50,
                })
              }
            />
            <Input
              id="cancellation_notice"
              label="Antecedência mín. cancelamento (horas)"
              type="number"
              value={form.cancellation_notice_hours}
              onChange={(e) =>
                setForm({
                  ...form,
                  cancellation_notice_hours: parseInt(e.target.value) || 24,
                })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {(Object.keys(form.working_hours) as (keyof WorkingHours)[]).map((day) => (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-100 p-3"
              >
                <label className="flex items-center gap-2 w-28">
                  <input
                    type="checkbox"
                    checked={form.working_hours[day].enabled}
                    onChange={(e) => updateWorkingDay(day, "enabled", e.target.checked)}
                    className="rounded border-stone-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                </label>
                {form.working_hours[day].enabled && (
                  <>
                    <input
                      type="time"
                      value={form.working_hours[day].start}
                      onChange={(e) => updateWorkingDay(day, "start", e.target.value)}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-sm"
                    />
                    <span className="text-stone-400">até</span>
                    <input
                      type="time"
                      value={form.working_hours[day].end}
                      onChange={(e) => updateWorkingDay(day, "end", e.target.value)}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {saved && (
          <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
            Configurações salvas com sucesso!
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </form>
    </div>
  );
}
