import { db } from "@/lib/db";
import { 
  Server, Database, Users, Building2, CalendarCheck, 
  TrendingUp, AlertTriangle, Activity, Zap, BarChart2
} from "lucide-react";
import Link from "next/link";
import { InfraCharts } from "./InfraCharts";

export default async function InfraPage() {
  const now = new Date();

  // === MÉTRICAS GLOBAIS ===
  const [
    totalTenants,
    activeTenants,
    totalBarbers,
    totalClients,
    totalAppointments,
    totalUsers,
    recentAppointments,
    tenantGrowth,
    appointmentsByStatus
  ] = await Promise.all([
    db.tenant.count(),
    db.tenant.count({ where: { active: true } }),
    db.user.count({ where: { role: "BARBER" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.appointment.count(),
    db.user.count(),
    // Agendamentos dos últimos 30 dias agrupados por dia
    db.appointment.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    }),
    // Barbearias criadas nos últimos 6 meses (crescimento)
    db.tenant.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    }),
    // Distribuição de status de agendamentos
    db.appointment.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  // Agendamentos de hoje
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayAppointments = await db.appointment.count({
    where: { start_time: { gte: todayStart, lte: todayEnd } }
  });

  // Agendamentos nos últimos 7 dias
  const last7Days = await db.appointment.count({
    where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
  });

  // Novas barbearias nos últimos 30 dias
  const newTenantsThisMonth = await db.tenant.count({
    where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
  });

  // Barbearias sem assinatura ativa (risco de churn)
  const tenantsAtRisk = await db.tenant.count({
    where: {
      active: true,
      subscription: {
        status: { in: ["PAST_DUE", "TRIAL"] },
        current_period_end: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
      }
    }
  });

  // === PROCESSAMENTO DE DADOS PARA GRÁFICOS ===
  
  // Crescimento de barbearias por mês (últimos 6 meses)
  const tenantGrowthByMonth: Record<string, number> = {};
  tenantGrowth.forEach(t => {
    const month = t.createdAt.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    tenantGrowthByMonth[month] = (tenantGrowthByMonth[month] || 0) + 1;
  });
  const tenantGrowthData = Object.entries(tenantGrowthByMonth).map(([month, count]) => ({ month, count }));

  // Agendamentos por dia (últimos 30 dias)
  const apptByDay: Record<string, number> = {};
  recentAppointments.forEach(a => {
    const day = a.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    apptByDay[day] = (apptByDay[day] || 0) + 1;
  });
  const apptTrendData = Object.entries(apptByDay).map(([date, count]) => ({ date, count }));

  // Status de agendamentos
  const statusData = appointmentsByStatus.map(s => ({
    name: s.status,
    value: s._count.status
  }));

  // Estimativas de carga de infraestrutura
  const avgApptPerTenant = activeTenants > 0 ? Math.round(totalAppointments / activeTenants) : 0;
  const avgBarbersPerTenant = activeTenants > 0 ? (totalBarbers / activeTenants).toFixed(1) : "0";
  
  // Score de saúde do sistema (0-100)
  const healthScore = Math.min(100, Math.round(
    (activeTenants / Math.max(totalTenants, 1)) * 40 +
    (last7Days > 0 ? 30 : 0) +
    (tenantsAtRisk === 0 ? 30 : Math.max(0, 30 - tenantsAtRisk * 5))
  ));

  const healthColor = healthScore >= 80 ? "text-green-400" : healthScore >= 60 ? "text-yellow-400" : "text-red-400";
  const healthLabel = healthScore >= 80 ? "Saudável" : healthScore >= 60 ? "Atenção" : "Crítico";

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <Server size={28} className="text-primary" />
            Infraestrutura & Crescimento
          </h1>
          <p className="text-text-secondary mt-2">
            Monitore a saúde do sistema e antecipe necessidades de escala.
          </p>
        </div>
        <div className="bg-surface border border-secondary rounded-2xl px-6 py-4 text-center">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Saúde do Sistema</p>
          <p className={`text-3xl font-bold ${healthColor}`}>{healthScore}%</p>
          <p className={`text-xs font-bold mt-1 ${healthColor}`}>{healthLabel}</p>
        </div>
      </div>

      {/* ALERTAS */}
      {tenantsAtRisk > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-amber-400">
              {tenantsAtRisk} barbearia{tenantsAtRisk > 1 ? 's' : ''} com assinatura prestes a vencer
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Estas contas vencem nos próximos 7 dias e podem entrar em inadimplência.
              <Link href="/super-admin/tenants" className="text-amber-400 hover:underline ml-2 font-medium">Ver barbearias →</Link>
            </p>
          </div>
        </div>
      )}

      {/* KPIs DE INFRAESTRUTURA */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Barbearias", value: totalTenants, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Usuários", value: totalUsers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Barbeiros Ativos", value: totalBarbers, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Clientes Cadastrados", value: totalClients, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Agendamentos Total", value: totalAppointments, icon: CalendarCheck, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Agendamentos Hoje", value: todayAppointments, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-surface border border-secondary rounded-2xl p-4">
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{kpi.value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-text-secondary mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ESTIMATIVAS DE ESCALA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-primary" />
            <h3 className="font-bold text-text-primary">Carga por Tenant</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Média agend./barbearia</span>
                <span className="font-bold text-text-primary">{avgApptPerTenant.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-secondary/30 h-1.5 rounded-full">
                <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (avgApptPerTenant / 500) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Média barbeiros/barbearia</span>
                <span className="font-bold text-text-primary">{avgBarbersPerTenant}</span>
              </div>
              <div className="w-full bg-secondary/30 h-1.5 rounded-full">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (Number(avgBarbersPerTenant) / 10) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Novos clientes (30d)</span>
                <span className="font-bold text-green-400">+{newTenantsThisMonth} barbearias</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Volume (últimos 7 dias)</span>
                <span className="font-bold text-text-primary">{last7Days} agend.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-400" />
            <h3 className="font-bold text-text-primary">Crescimento</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <span className="text-text-secondary text-sm">Barbearias este mês</span>
              <span className={`font-bold text-lg ${newTenantsThisMonth > 0 ? 'text-green-400' : 'text-text-secondary'}`}>
                +{newTenantsThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <span className="text-text-secondary text-sm">Taxa de ativação</span>
              <span className="font-bold text-text-primary">
                {totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <span className="text-text-secondary text-sm">Barbearias em risco</span>
              <span className={`font-bold text-lg ${tenantsAtRisk > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {tenantsAtRisk}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <span className="text-text-secondary text-sm">Barbearias inativas</span>
              <span className="font-bold text-red-400">{totalTenants - activeTenants}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-purple-400" />
            <h3 className="font-bold text-text-primary">Status dos Agendamentos</h3>
          </div>
          <div className="space-y-3">
            {statusData.map(s => {
              const total = statusData.reduce((a, b) => a + b.value, 0);
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              const statusColors: Record<string, string> = {
                COMPLETED: "bg-green-500",
                CONFIRMED: "bg-blue-500",
                PENDING: "bg-yellow-500",
                CANCELLED: "bg-red-500",
                IN_PROGRESS: "bg-purple-500"
              };
              const statusLabels: Record<string, string> = {
                COMPLETED: "Concluídos",
                CONFIRMED: "Confirmados",
                PENDING: "Pendentes",
                CANCELLED: "Cancelados",
                IN_PROGRESS: "Em andamento"
              };
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{statusLabels[s.name] || s.name}</span>
                    <span className="font-bold text-text-primary">{s.value.toLocaleString('pt-BR')} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                    <div className={`${statusColors[s.name] || 'bg-primary'} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {statusData.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-4">Nenhum agendamento ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* GRÁFICOS DE TENDÊNCIA */}
      <InfraCharts tenantGrowthData={tenantGrowthData} apptTrendData={apptTrendData} />



      {/* RECOMENDAÇÕES DE INFRAESTRUTURA */}
      <div className="bg-surface border border-secondary rounded-2xl p-6">
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <Server size={18} className="text-primary" />
          Recomendações de Infraestrutura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              threshold: totalAppointments > 10000,
              title: "Escalar Banco de Dados",
              desc: "Volume de agendamentos elevado. Considere upgradar o plano do Neon DB ou adicionar read replicas.",
              icon: Database,
              color: "text-red-400",
              bg: "bg-red-500/10",
              active: totalAppointments > 10000,
              current: totalAppointments,
              target: 10000,
              unit: "agend."
            },
            {
              threshold: activeTenants > 50,
              title: "CDN para Assets",
              desc: "Muitas barbearias ativas. Implemente CDN para logos e imagens para reduzir latência.",
              icon: Zap,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
              active: activeTenants > 50,
              current: activeTenants,
              target: 50,
              unit: "barbearias"
            },
            {
              threshold: totalClients > 5000,
              title: "Cache de Sessões",
              desc: "Grande base de clientes. Adicione Redis para cachear sessões e dados frequentes.",
              icon: Server,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              active: totalClients > 5000,
              current: totalClients,
              target: 5000,
              unit: "clientes"
            },
            {
              threshold: true,
              title: "Backup Automatizado",
              desc: "Configure backups automáticos diários do banco para garantir recuperação em caso de falhas.",
              icon: Database,
              color: "text-green-400",
              bg: "bg-green-500/10",
              active: false,
              current: 100,
              target: 100,
              unit: "%" // Exemplo estático
            },
            {
              threshold: true,
              title: "Monitoramento (Uptime)",
              desc: "Adicione Uptime Robot, Better Stack ou similar para alertas de downtime em tempo real.",
              icon: Activity,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              active: false,
              current: 100,
              target: 100,
              unit: "%"
            },
            {
              threshold: activeTenants > 20,
              title: "Filas de Notificação",
              desc: "Com crescimento, implemente filas (BullMQ) para envios de WhatsApp e evitar timeout.",
              icon: TrendingUp,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              active: activeTenants > 20,
              current: activeTenants,
              target: 20,
              unit: "barbearias"
            },
          ].map(rec => (
            <div key={rec.title} className={`p-4 rounded-xl border ${rec.active ? 'border-amber-500/40 bg-amber-500/5' : 'border-secondary bg-background/50'} flex flex-col justify-between`}>
              <div>
                <div className={`w-8 h-8 ${rec.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <rec.icon size={16} className={rec.color} />
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-text-primary text-sm">{rec.title}</p>
                  {rec.active && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full shrink-0 animate-pulse">AGORA</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mb-4">{rec.desc}</p>
              </div>
              
              {rec.target !== 100 && (
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] text-text-secondary mb-1 font-medium">
                    <span>{rec.current.toLocaleString('pt-BR')} {rec.unit}</span>
                    <span>Meta: {rec.target.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${rec.active ? 'bg-amber-400' : 'bg-primary'}`} 
                      style={{ width: `${Math.min(100, (rec.current / rec.target) * 100)}%` }} 
                    />
                  </div>
                </div>
              )}
              {rec.target === 100 && (
                <div className="mt-auto flex items-center gap-1 text-[10px] text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Configuração Recomendada
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
