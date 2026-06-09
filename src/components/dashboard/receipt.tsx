import type { Payment, Profile } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptProps {
  payment: Payment;
  profile: Profile;
}

export function Receipt({ payment, profile }: ReceiptProps) {
  return (
    <div className="space-y-6" id="receipt">
      <div className="text-center border-b border-stone-200 pb-4">
        <h2 className="text-xl font-bold text-stone-900">Recibo de Pagamento</h2>
        <p className="text-sm text-stone-500 mt-1">
          {payment.receipt_number || "Sem número"}
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Profissional:</span>
          <span className="font-medium text-stone-900">{profile.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">CRP:</span>
          <span className="font-medium text-stone-900">{profile.crp}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Paciente:</span>
          <span className="font-medium text-stone-900">
            {payment.patients?.full_name || "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Data do pagamento:</span>
          <span className="font-medium text-stone-900">
            {payment.paid_at ? formatDate(payment.paid_at) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Forma de pagamento:</span>
          <span className="font-medium text-stone-900">
            {payment.payment_method || "—"}
          </span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-3">
          <span className="text-stone-500 font-medium">Valor:</span>
          <span className="text-lg font-bold text-teal-700">
            {formatCurrency(payment.amount)}
          </span>
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center pt-4 border-t border-stone-200">
        Recibo referente a sessão de psicoterapia. Documento gerado eletronicamente.
      </p>
    </div>
  );
}
