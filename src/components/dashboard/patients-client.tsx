"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PatientsClientProps {
  patients: Patient[];
}

export function PatientsClient({ patients }: PatientsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    cpf: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    therapeutic_goals: "",
    notes: "",
  });

  const filtered = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setShowForm(false);
    setForm({
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      cpf: "",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      therapeutic_goals: "",
      notes: "",
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Pacientes</h1>
          <p className="text-stone-600">Fichas cadastrais e prontuários</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo Paciente"}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-stone-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Paciente</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input
              id="full_name"
              label="Nome completo *"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
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
              id="birth_date"
              label="Data de nascimento"
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
            <Input
              id="cpf"
              label="CPF"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
            <Input
              id="address"
              label="Endereço"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              id="emergency_contact"
              label="Contato de emergência"
              value={form.emergency_contact}
              onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
            />
            <Input
              id="emergency_phone"
              label="Telefone de emergência"
              value={form.emergency_phone}
              onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Textarea
                id="therapeutic_goals"
                label="Objetivos terapêuticos"
                value={form.therapeutic_goals}
                onChange={(e) => setForm({ ...form, therapeutic_goals: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar Paciente"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-center text-stone-500 py-8">
            {search ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((patient) => (
            <Link key={patient.id} href={`/dashboard/pacientes/${patient.id}`}>
              <Card className="hover:border-teal-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">{patient.full_name}</p>
                    <p className="text-sm text-stone-500">
                      {[patient.email, patient.phone].filter(Boolean).join(" · ")}
                    </p>
                    {patient.birth_date && (
                      <p className="text-xs text-stone-400 mt-1">
                        Nasc.: {formatDate(patient.birth_date)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-teal-700 font-medium">Ver prontuário →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
