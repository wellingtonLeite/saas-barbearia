import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

export default async function FinancePage() {
  const session = await auth();
  const role = session?.user?.role;
  const isOwner = role === 'OWNER' || role === 'SUPER_ADMIN';

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
