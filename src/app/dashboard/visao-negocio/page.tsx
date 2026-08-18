import { BarChart2, TrendingUp, Users } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { BarberRanking } from "@/components/dashboard/BarberRanking";
import { TopServices } from "@/components/dashboard/TopServices";
import { MetaCard } from "@/components/dashboard/MetaCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function VisaoNegocioPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Buscar o tenantId do usuário logado
  const userWithUnits = await db.user.findUnique({
    where: { id: userId },
    include: {
      units: {
        include: { unit: true }
      }
    }
  });
  
  const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
  if (!tenantId) return null;

  const tenant = await db.tenant.findUnique({ 
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });
  
  const plan = tenant?.subscription?.plan;
  const isOuro = (plan?.max_barbers ?? 0) >= 50;
  const isOwner = session?.user?.role !== 'BARBER';

  if (!isOwner || !isOuro) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <div className="bg-surface border border-secondary p-8 rounded-2xl text-center">
          <p className="text-text-secondary">Esta página está disponível apenas para proprietários no plano VIP ou superior.</p>
        </div>
      </div>
    );
  }

  // --- GRÁFICOS E RANKINGS ---
  let growthData: { date: string; total: number }[] = [];
  let barberRankData: { name: string; revenue: number; appointments: number; avatar?: string }[] = [];
  let topServicesData: { name: string; count: number; revenue: number }[] = [];
  let totalRevenue30d = 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = await db.sale.findMany({
    where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
    include: { barber: true }
  });

  const groupedSales = recentSales.reduce((acc: any, sale: any) => {
    const date = sale.createdAt.toISOString().split('T')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += Number(sale.total_amount);
    return acc;
  }, {});
  
  growthData = Object.keys(groupedSales).sort().map(date => ({
    date,
    total: groupedSales[date]
  }));
  totalRevenue30d = growthData.reduce((acc, curr) => acc + curr.total, 0);

  const topAppointments = await db.appointment.findMany({
    where: { tenantId, status: 'COMPLETED' },
    include: { barber: true, service: true },
    orderBy: { start_time: 'desc' },
    take: 500
  });

  const groupedBarbers = topAppointments.reduce((acc: any, app: any) => {
    if (!app.barber) return acc;
    const bId = app.barber.id;
    if (!acc[bId]) acc[bId] = { name: app.barber.name, revenue: 0, appointments: 0 };
    acc[bId].appointments += 1;
    acc[bId].revenue += Number(app.service.price);
    return acc;
  }, {});

  barberRankData = Object.values(groupedBarbers).sort((a: any, b: any) => b.revenue - a.revenue) as any;

  const groupedServices = topAppointments.reduce((acc: any, app: any) => {
    if (!app.service) return acc;
    const sId = app.service.id;
    if (!acc[sId]) acc[sId] = { name: app.service.name, count: 0, revenue: 0 };
    acc[sId].count += 1;
    acc[sId].revenue += Number(app.service.price);
    return acc;
  }, {});

  topServicesData = (Object.values(groupedServices).sort((a: any, b: any) => b.count - a.count) as any).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <BarChart2 size={32} className="text-primary" /> Visão do Negócio
          </h1>
          <p className="text-text-secondary mt-2">Acompanhe as métricas de crescimento e performance da sua barbearia em tempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6 lg:col-span-2 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Faturamento (30 dias)
          </h3>
          <GrowthChart data={growthData} />
        </div>
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl shadow-black/10 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Meta Mensal</h3>
          {/* @ts-ignore */}
          <MetaCard currentRevenue={totalRevenue30d} targetRevenue={tenant?.monthly_target || 15000} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} /> Top Barbeiros (Receita)
          </h3>
          <BarberRanking barbers={barberRankData} />
        </div>
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Serviços Mais Realizados</h3>
          <TopServices services={topServicesData} />
        </div>
      </div>
    </div>
  );
}
