import {
  getCurrentUser,
  getProfile,
  getPayments,
  getMonthlyRevenue,
} from "@/lib/data";
import { FinanceClient } from "@/components/dashboard/finance-client";

export default async function FinanceiroPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const [profile, payments, monthlyRevenue] = await Promise.all([
    getProfile(user.id),
    getPayments(user.id),
    getMonthlyRevenue(user.id, now.getFullYear(), now.getMonth() + 1),
  ]);

  const pendingTotal = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <FinanceClient
      payments={payments}
      profile={profile}
      monthlyTotal={monthlyRevenue.total}
      monthlyPaidCount={monthlyRevenue.count}
      pendingTotal={pendingTotal}
    />
  );
}
