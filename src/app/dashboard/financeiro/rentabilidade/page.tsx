import { ProfitabilityMatrixView } from "@/components/dashboard/ProfitabilityMatrixView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UpgradeCard } from "@/components/UpgradeCard";

export default async function RentabilidadePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: { units: { include: { unit: true } } },
  });

  const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
  if (!tenantId) redirect("/dashboard");

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } },
  });

  const plan = tenant?.subscription?.plan;
  const hasFinancial = plan?.has_financial_module ?? false;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-2 sm:p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/financeiro"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Rentabilidade & Yield Management
          </h1>
          <p className="text-xs text-text-secondary">
            Análise de Lucro por Hora e Classificação BCG de Serviços
          </p>
        </div>
      </div>

      {!hasFinancial ? (
        <UpgradeCard
          requiredPlan="Máquina de Corte ou Tesoura de Ouro"
          featureName="Matriz de Rentabilidade (Lucro/Hora)"
        />
      ) : (
        <ProfitabilityMatrixView />
      )}
    </div>
  );
}
