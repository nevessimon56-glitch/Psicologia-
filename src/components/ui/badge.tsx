import { cn } from "@/lib/utils";
import type { AppointmentStatus, PaymentStatus } from "@/lib/types";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/types";

const appointmentColors: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-teal-100 text-teal-800",
  cancelled: "bg-stone-100 text-stone-600",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-red-100 text-red-800",
};

const paymentColors: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-stone-100 text-stone-600",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        appointmentColors[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        paymentColors[status]
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
