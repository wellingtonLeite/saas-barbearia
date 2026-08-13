import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function SuperAdminDashboard() {
  // Buscar métricas reais
  const totalTenants = await db.tenant.count();
  
  // Buscar assinaturas ativas para calcular MRR
  const activeSubscriptions = await db.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true }
  });

  const mrr = activeSubscriptions.reduce((acc, sub) => {
    return acc + Number(sub.plan.base_price);
  }, 0);

  // Buscar últimas barbearias cadastradas
  const recentTenants = await db.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { subscription: { include: { plan: true } } }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Controle Global da Plataforma</h1>
        <p className="text-text-secondary mt-2">Métricas gerais de todas as barbearias assinantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-secondary hover:border-primary/50 transition-colors">
          <h3 className="text-text-secondary font-medium mb-2">MRR (Faturamento)</h3>
          <p className="text-4xl font-display font-bold text-success">{formatCurrency(mrr)}</p>
        </div>
        
        <div className="bg-surface p-6 rounded-xl border border-secondary hover:border-primary/50 transition-colors">
          <h3 className="text-text-secondary font-medium mb-2">Barbearias Cadastradas</h3>
          <p className="text-4xl font-display font-bold text-text-primary">{totalTenants}</p>
        </div>
        
        <div className="bg-surface p-6 rounded-xl border border-secondary hover:border-primary/50 transition-colors">
          <h3 className="text-text-secondary font-medium mb-2">Assinaturas Ativas</h3>
          <p className="text-4xl font-display font-bold text-primary">{activeSubscriptions.length}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-secondary hover:border-primary/50 transition-colors">
          <h3 className="text-text-secondary font-medium mb-2">Churn Rate</h3>
          <p className="text-4xl font-display font-bold text-danger">0.0%</p>
        </div>
      </div>

      {/* Lista de Barbearias Recentes */}
      <div className="bg-surface border border-secondary rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-secondary">
          <h2 className="text-xl font-bold">Últimas Barbearias Cadastradas</h2>
        </div>
        <div className="divide-y divide-secondary">
          {recentTenants.length === 0 && (
             <div className="p-6 text-text-secondary">Nenhuma barbearia cadastrada ainda.</div>
          )}
          {recentTenants.map(tenant => (
            <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors cursor-pointer">
              <div>
                <p className="font-bold text-primary">{tenant.name}</p>
                <p className="text-sm text-text-secondary">Cadastrado em {tenant.createdAt.toLocaleDateString('pt-BR')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                tenant.subscription?.status === 'ACTIVE' 
                  ? 'bg-success/20 text-success border-success/30' 
                  : 'bg-warning/20 text-warning border-warning/30'
              }`}>
                {tenant.subscription?.plan?.name || 'Trial'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
