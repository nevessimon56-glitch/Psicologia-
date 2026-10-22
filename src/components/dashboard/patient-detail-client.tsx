"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type { Appointment, Patient, Payment, SessionNote } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface PatientDetailClientProps {
  patient: Patient;
  appointments: Appointment[];
  notes: SessionNote[];
  payments: Payment[];
}

export function PatientDetailClient({
  patient,
  appointments,
  notes,
  payments,
}: PatientDetailClientProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [goals, setGoals] = useState(patient.therapeutic_goals);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"prontuario" | "historico" | "financeiro">(
    "prontuario"
  );

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLoading(true);

    await fetch("/api/session-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patient.id, content: newNote }),
    });

    setNewNote("");
    setLoading(false);
    router.refresh();
  };

  const handleSaveGoals = async () => {
    await fetch("/api/patients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: patient.id, therapeutic_goals: goals }),
    });
    router.refresh();
  };

  const tabs = [
    { id: "prontuario" as const, label: "Prontuário" },
    { id: "historico" as const, label: "Atendimentos" },
    { id: "financeiro" as const, label: "Financeiro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/pacientes"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">{patient.full_name}</h1>
        <p className="text-stone-600">
          {[patient.email, patient.phone, patient.cpf && `CPF: ${patient.cpf}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ficha Cadastral</CardTitle>
        </CardHeader>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {patient.birth_date && (
            <div>
              <span className="text-stone-500">Nascimento:</span>{" "}
              {formatDate(patient.birth_date)}
            </div>
          )}
          {patient.address && (
            <div>
              <span className="text-stone-500">Endereço:</span> {patient.address}
            </div>
          )}
          {patient.emergency_contact && (
            <div>
              <span className="text-stone-500">Emergência:</span>{" "}
              {patient.emergency_contact} — {patient.emergency_phone}
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-1 rounded-lg border border-stone-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-teal-700 text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "prontuario" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos Terapêuticos</CardTitle>
            </CardHeader>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Descreva os objetivos terapêuticos do paciente..."
            />
            <Button className="mt-3" size="sm" onClick={handleSaveGoals}>
              Salvar Objetivos
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anotações de Sessão</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddNote} className="space-y-3">
              <Textarea
                id="newNote"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Registre anotações da sessão (acesso restrito)..."
              />
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Salvando..." : "Adicionar Anotação"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-stone-500">Nenhuma anotação registrada.</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-stone-100 bg-stone-50 p-4"
                  >
                    <p className="text-xs text-stone-500 mb-2">
                      {formatDateTime(note.created_at)}
                    </p>
                    <p className="text-sm text-stone-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "historico" && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Atendimentos</CardTitle>
          </CardHeader>
          {appointments.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum atendimento registrado.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {formatDateTime(apt.start_time)}
                    </p>
                    <p className="text-sm text-stone-500 capitalize">{apt.modality}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "financeiro" && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Financeiro</CardTitle>
          </CardHeader>
          {payments.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum registro financeiro.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-stone-500">
                      {payment.paid_at
                        ? `Pago em ${formatDate(payment.paid_at)}`
                        : `Criado em ${formatDate(payment.created_at)}`}
                      {payment.receipt_number && ` — ${payment.receipt_number}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {payment.status === "paid"
                      ? "Pago"
                      : payment.status === "pending"
                        ? "Pendente"
                        : "Cancelado"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
