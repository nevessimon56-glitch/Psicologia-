"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentBadge } from "@/components/ui/badge";
import { Receipt } from "@/components/dashboard/receipt";
import type { Payment, Profile } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface FinanceClientProps {
  payments: Payment[];
  profile: Profile | null;
  monthlyTotal: number;
  monthlyPaidCount: number;
  pendingTotal: number;
}

export function FinanceClient({
  payments,
  profile,
  monthlyTotal,
  monthlyPaidCount,
  pendingTotal,
}: FinanceClientProps) {
  const router = useRouter();
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  const filtered = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const handleMarkPaid = async (payment: Payment) => {
    const res = await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: payment.id,
        status: "paid",
        payment_method: "PIX",
      }),
    });
    const data = await res.json();
    if (data.payment) {
      setReceiptPayment(data.payment);
    }
    router.refresh();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Financeiro</h1>
        <p className="text-stone-600">Controle de pagamentos e faturamento</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-stone-500">Faturamento do Mês</p>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(monthlyTotal)}</p>
          <p className="text-xs text-stone-400 mt-1">{monthlyPaidCount} sessões pagas</p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Pendente</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingTotal)}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Valor da Sessão</p>
          <p className="text-2xl font-bold text-stone-900">
            {formatCurrency(profile?.session_price || 0)}
          </p>
        </Card>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-teal-700 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : "Pagos"}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Pagamento</CardTitle>
        </CardHeader>
        {filtered.length === 0 ? (
          <p className="text-sm text-stone-500">Nenhum registro encontrado.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-3 rounded-lg border border-stone-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {payment.patients?.full_name || "Paciente"}
                  </p>
                  <p className="text-lg font-semibold text-stone-800">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-sm text-stone-500">
                    {payment.paid_at
                      ? `Pago em ${formatDate(payment.paid_at)}`
                      : `Criado em ${formatDate(payment.created_at)}`}
                    {payment.receipt_number && ` — ${payment.receipt_number}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={payment.status} />
                  {payment.status === "pending" && (
                    <Button size="sm" onClick={() => handleMarkPaid(payment)}>
                      <CheckCircle className="h-4 w-4" />
                      Marcar Pago
                    </Button>
                  )}
                  {payment.status === "paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReceiptPayment(payment)}
                    >
                      <Download className="h-4 w-4" />
                      Recibo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {receiptPayment && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl print:shadow-none">
            <Receipt payment={receiptPayment} profile={profile} />
            <div className="mt-6 flex gap-2 print:hidden">
              <Button onClick={handlePrintReceipt}>Imprimir / PDF</Button>
              <Button variant="outline" onClick={() => setReceiptPayment(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
