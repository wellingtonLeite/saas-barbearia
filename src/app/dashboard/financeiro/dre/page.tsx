import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UpgradeCard } from "@/components/dashboard/UpgradeCard";
import { Calculator } from "lucide-react";

export default async function DREPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await searchParams;
  
  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: { units: { include: { unit: true } } }
  });
  
  const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
  if (!tenantId) redirect("/dashboard");

  const tenant = await db.tenant.findUnique({ 
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });
  
  const plan = tenant?.subscription?.plan;
  const isOuro = (plan?.max_barbers ?? 0) >= 50;

  if (!isOuro) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <UpgradeCard requiredPlan="Tesoura de Ouro" featureName="DRE — Demonstrativo de Resultados" />
      </div>
    );
  }

  const currentDate = new Date();
  const currentMonth = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth() + 1;
  const currentYear = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear();

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Sales (Receitas)
  const sales = await db.sale.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const salesRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
  const totalCommissions = sales.reduce((acc, sale) => acc + Number(sale.barber_commission), 0);

  // Transactions (Despesas)
  let transactionsExpense = 0;
  try {
    const transactions = await (db as any).transaction.findMany({
      where: {
        tenantId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate }
      }
    });
    transactionsExpense = transactions.reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  } catch (e) {
    console.log("Transaction model might not exist yet.");
  }

  // AccountEntries (Futuro)
  // TODO: incluir AccountEntry quando migration estiver pronta

  const totalRevenue = salesRevenue;
  const totalExpense = transactionsExpense + totalCommissions; // Comissões são despesas
  const result = totalRevenue - totalExpense;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <Calculator className="text-primary" size={32} />
          DRE - Demonstração de Resultados
        </h1>
        
        <form className="flex gap-2 bg-surface p-2 rounded-xl border border-secondary">
          <select name="month" defaultValue={currentMonth} className="bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</option>
            ))}
          </select>
          <select name="year" defaultValue={currentYear} className="bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button type="submit" className="bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Receitas</h3>
          <p className="text-3xl font-bold text-green-500">R$ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Despesas</h3>
          <p className="text-3xl font-bold text-red-500">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className={`bg-surface border border-secondary rounded-2xl p-6 shadow-lg shadow-black/10`}>
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Resultado Líquido</h3>
          <p className={`text-3xl font-bold ${result >= 0 ? 'text-primary' : 'text-red-500'}`}>
            R$ {result.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-xl shadow-black/10">
        <div className="p-6 border-b border-secondary bg-background/50">
          <h2 className="text-xl font-bold text-text-primary">Detalhamento</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-green-500 mb-4 border-b border-secondary pb-2">1. Receitas Brutas</h3>
            <div className="flex justify-between py-2 text-text-primary">
              <span>Vendas e Serviços (PDV)</span>
              <span className="font-medium">R$ {salesRevenue.toFixed(2)}</span>
            </div>
            {/* Outras receitas no futuro */}
          </div>

          <div>
            <h3 className="text-lg font-bold text-red-500 mb-4 border-b border-secondary pb-2">2. Despesas / Custos</h3>
            <div className="flex justify-between py-2 text-text-primary">
              <span>Comissões Pagas</span>
              <span className="font-medium">R$ {totalCommissions.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-text-primary">
              <span>Despesas Operacionais (Lançamentos)</span>
              <span className="font-medium">R$ {transactionsExpense.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-secondary">
            <div className="flex justify-between items-center text-xl font-bold text-text-primary">
              <span>(=) Resultado do Período</span>
              <span className={result >= 0 ? 'text-primary' : 'text-red-500'}>
                R$ {result.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
