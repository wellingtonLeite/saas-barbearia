import { db } from "@/lib/db";
import { Building2, DollarSign, Users, Activity, CalendarCheck } from "lucide-react";
import { StatusPieChart, PlanBarChart } from "./DashboardCharts";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const tenants = await db.tenant.findMany({
    include: {
      subscription: {
        include: { plan: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const plans = await db.plan.findMany({ orderBy: { base_price: 'asc' } });

  const appointmentsCount = await db.appointment.count();

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.active).length;
  
  // Calcular MRR e status
  let mrr = 0;
  let statusCount = { ACTIVE: 0, TRIAL: 0, PAST_DUE: 0, CANCELED: 0 };
  let planCount: Record<string, number> = {};

  tenants.forEach(t => {
    const sub = t.subscription;
    if (sub) {
      // MRR
      if (t.active && (sub.status === 'ACTIVE' || sub.status === 'TRIAL')) {
        mrr += Number(sub.plan.base_price);
      }
      // Status
      statusCount[sub.status] = (statusCount[sub.status] || 0) + 1;
      
      // Plan Distribution
      planCount[sub.plan.name] = (planCount[sub.plan.name] || 0) + 1;
    }
  });

  const pieData = [
    { name: 'Ativos', value: statusCount.ACTIVE || 0 },
    { name: 'Trial', value: statusCount.TRIAL || 0 },
    { name: 'Atrasados', value: statusCount.PAST_DUE || 0 },
    { name: 'Cancelados', value: statusCount.CANCELED || 0 },
  ].filter(d => d.value > 0);

  const barData = Object.keys(planCount).map(planName => ({
    name: planName,
    assinaturas: planCount[planName]
  }));

  const recentTenants = tenants.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Visão Estratégica (BI)</h1>
        <p className="text-text-secondary mt-2">Métricas em tempo real da saúde do seu SaaS.</p>
      </div>

      {/* TOP KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary font-medium text-sm">MRR Atual</p>
              <h3 className="text-3xl font-bold text-text-primary mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary font-medium text-sm">Assinantes Ativos</p>
              <h3 className="text-3xl font-bold text-text-primary mt-2">{activeTenants}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary font-medium text-sm">Volume de Agendamentos</p>
              <h3 className="text-3xl font-bold text-text-primary mt-2">{appointmentsCount}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
              <CalendarCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary font-medium text-sm">Total de Contas Criadas</p>
              <h3 className="text-3xl font-bold text-text-primary mt-2">{totalTenants}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-6">Status das Assinaturas</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <StatusPieChart data={pieData} />
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((d, i) => {
                  const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500'];
                  return (
                    <div key={d.name} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></span>
                      {d.name}: {d.value}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary">Nenhum dado de assinatura.</div>
          )}
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-6">Distribuição por Planos</h3>
          {barData.length > 0 ? (
            <PlanBarChart data={barData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary">Nenhum plano atribuído.</div>
          )}
        </div>
      </div>

      {/* FEED E PLANOS COMERCIAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed de Cadastros Recentes */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Cadastros Recentes</h3>
            <Link href="/super-admin/tenants" className="text-sm text-primary hover:underline font-medium">Ver todos</Link>
          </div>
          
          <div className="divide-y divide-secondary">
            {recentTenants.map(tenant => (
              <div key={tenant.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {tenant.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-text-primary">{tenant.name}</p>
                    <p className="text-xs text-text-secondary">Cadastrado em {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tenant.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {tenant.active ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de Planos Comerciais */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Planos Cadastrados</h3>
            <Link href="/super-admin/planos" className="text-sm text-primary hover:underline font-medium">Gerenciar</Link>
          </div>
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="relative overflow-hidden group p-4 rounded-xl border border-secondary bg-background/50 hover:border-primary/30 transition-all flex items-center justify-between">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:w-2 transition-all"></div>
                <div className="pl-3">
                  <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{plan.name}</h4>
                  <p className="text-xs text-text-secondary mt-1">{plan.max_barbers >= 999 ? 'Ilimitado' : `Até ${plan.max_barbers} prof.`} • {plan.max_units} unidade(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gradient-gold">
                    R$ {Number(plan.base_price).toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase text-text-secondary font-bold">/ mês</p>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-sm text-text-secondary text-center py-8">Nenhum plano pago cadastrado.</p>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
