import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { getPlanFeatures } from "@/lib/plan-features";
import { UpgradeCard } from "@/components/UpgradeCard";

async function getTenantId(userId: string) {
  const barberUnit = await db.barberUnit.findFirst({
    where: { barberId: userId },
    include: { unit: true }
  });
  if (barberUnit) return barberUnit.unit.tenantId;
  const tenant = await db.tenant.findFirst();
  return tenant?.id;
}

export default async function FinancePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isOwner = role === 'OWNER' || role === 'SUPER_ADMIN';

  const tenantId = userId ? await getTenantId(userId) : undefined;
  
  const tenant = tenantId ? await db.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  }) : null;

  const planFeatures = getPlanFeatures(tenant?.subscription?.plan);

  // Buscar as vendas (Sales) do PDV
  const sales = await db.sale.findMany({
    where: {
      tenantId: isOwner ? undefined : undefined,
      ...(isOwner ? {} : { barberId: session?.user?.id })
    },
    include: {
      barber: true,
      client: true
    },
    orderBy: { createdAt: 'desc' }
  });

  let totalRevenue = 0;
  let totalCommissions = 0;

  sales.forEach(sale => {
    totalRevenue += Number(sale.total_amount);
    totalCommissions += Number(sale.barber_commission);
  });

  const netProfit = totalRevenue - totalCommissions;

  let totalPagar = 0;
  let totalReceber = 0;

  if (tenant?.subscription?.plan?.has_financial_module && tenantId) {
    const contas = await db.accountEntry.findMany({
      where: { tenantId, status: { not: 'PAID' } }
    });
    contas.forEach(c => {
      if (c.type === 'PAYABLE') totalPagar += Number(c.amount);
      if (c.type === 'RECEIVABLE') totalReceber += Number(c.amount);
    });
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Financeiro</h1>
          <p className="text-text-secondary mt-2">
            {isOwner ? "Acompanhe o faturamento e comissões da sua barbearia." : "Acompanhe seus ganhos e comissões."}
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isOwner && (
          <div className="bg-surface p-6 rounded-xl border border-secondary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={48} className="text-success" />
            </div>
            <h3 className="text-text-secondary font-medium mb-2">Faturamento Bruto</h3>
            <p className="text-4xl font-display font-bold text-text-primary">{formatCurrency(totalRevenue)}</p>
          </div>
        )}

        <div className="bg-surface p-6 rounded-xl border border-secondary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={48} className={isOwner ? "text-warning" : "text-success"} />
          </div>
          <h3 className="text-text-secondary font-medium mb-2">
            {isOwner ? "Comissões (A Pagar)" : "Seus Ganhos (Comissões)"}
          </h3>
          <p className={`text-4xl font-display font-bold ${isOwner ? 'text-warning' : 'text-success'}`}>
            {formatCurrency(totalCommissions)}
          </p>
        </div>

        {isOwner && (
          <div className="bg-surface p-6 rounded-xl border border-secondary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 size={48} className="text-success" />
            </div>
            <h3 className="text-text-secondary font-medium mb-2">Lucro Líquido (Barbearia)</h3>
            <p className="text-4xl font-display font-bold text-success">{formatCurrency(netProfit)}</p>
          </div>
        )}
      </div>

      {/* Seção de Contas a Pagar e Receber */}
      {isOwner && (
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wallet className="text-primary" /> Contas a Pagar e Receber
          </h2>
          
          {tenant?.subscription?.plan?.has_financial_module ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-secondary rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent pointer-events-none" />
                <h3 className="text-text-secondary font-medium mb-2">Total a Pagar (Pendente)</h3>
                <p className="text-3xl font-display font-bold text-error mb-4">{formatCurrency(totalPagar)}</p>
                <Link href="/dashboard/financeiro/contas?aba=pagar" className="text-primary hover:underline flex items-center gap-1 font-medium text-sm">
                  Ver contas a pagar <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="bg-surface border border-secondary rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
                <h3 className="text-text-secondary font-medium mb-2">Total a Receber (Pendente)</h3>
                <p className="text-3xl font-display font-bold text-success mb-4">{formatCurrency(totalReceber)}</p>
                <Link href="/dashboard/financeiro/contas?aba=receber" className="text-primary hover:underline flex items-center gap-1 font-medium text-sm">
                  Ver contas a receber <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <UpgradeCard requiredPlan="Plano VIP" featureName="Contas a Pagar e Receber" />
          )}
        </div>
      )}

      {/* Extrato Recente */}
      <div className="bg-surface border border-secondary rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-secondary">
          <h2 className="text-xl font-bold">Extrato Recente</h2>
        </div>
        <div className="divide-y divide-secondary">
          {sales.length === 0 && (
            <div className="p-8 text-center text-text-secondary">Nenhum serviço finalizado ainda.</div>
          )}
          {sales.map(sale => (
            <div key={sale.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors">
              <div>
                <p className="font-bold text-text-primary">{sale.description || "Venda (PDV)"}</p>
                <p className="text-sm text-text-secondary">
                  {sale.createdAt.toLocaleDateString('pt-BR')} às {sale.createdAt.getHours().toString().padStart(2, '0')}:{sale.createdAt.getMinutes().toString().padStart(2, '0')}
                  {isOwner && sale.barber && ` • Barbeiro: ${sale.barber.name}`}
                </p>
              </div>
              <div className="text-right">
                {isOwner && (
                  <p className="font-bold text-text-primary">
                    +{formatCurrency(Number(sale.total_amount))}
                  </p>
                )}
                <p className={`font-bold ${isOwner ? 'text-warning text-sm' : 'text-success text-lg'}`}>
                  {isOwner ? 'Custo Com.: ' : '+'}{formatCurrency(Number(sale.barber_commission))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
