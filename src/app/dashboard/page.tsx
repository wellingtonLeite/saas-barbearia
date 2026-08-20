import { Clock, Scissors, User as UserIcon, ChevronLeft, ChevronRight, DollarSign, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import Timeline from "@/components/Timeline";

export default async function BarberDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  try {
    const session = await auth();
    const resolvedParams = await searchParams;
    const dateParam = resolvedParams.date;
    
    const settings = await db.systemSetting.findUnique({ where: { key: "WHATSAPP_TEMPLATES" } });
    const systemTemplates = settings?.value as any;
    
    const selectedDate = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
    selectedDate.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Datas para navegação
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const prevDateStr = prevDate.toISOString().split('T')[0];
    const nextDateStr = nextDate.toISOString().split('T')[0];

    // Buscar o tenantId do usuário logado
    const userWithUnits = await db.user.findUnique({
      where: { id: session?.user?.id },
      include: {
        units: {
          include: { unit: true }
        }
      }
    });
    
    const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
    const currentUnitId = userWithUnits?.units[0]?.unitId;

    const tenant = tenantId ? await db.tenant.findUnique({ 
      where: { id: tenantId },
      include: { subscription: { include: { plan: true } } }
    }) : null;
    
    const plan = tenant?.subscription?.plan;
    const isOuro = (plan?.max_barbers ?? 0) >= 50;
    const isMaquina = (plan?.max_barbers ?? 0) >= 10;
    const isOwner = session?.user?.role !== 'BARBER';

    // [NOTIFICAÇÕES DE VENCIMENTO]
    if (isOwner && isMaquina && tenantId) {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const upcomingAccounts = await db.accountEntry.findMany({
        where: {
          tenantId,
          type: 'PAYABLE',
          status: 'PENDING',
          due_date: { lte: threeDaysFromNow }
        }
      });

      if (upcomingAccounts.length > 0) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const recentNotif = await db.notification.findFirst({
          where: {
            tenantId,
            type: 'SYSTEM_ALERT',
            title: { contains: 'Vencimento' },
            createdAt: { gte: startOfToday }
          }
        });

        if (!recentNotif && session?.user?.id) {
          await db.notification.create({
            data: {
              userId: session.user.id,
              tenantId,
              type: 'SYSTEM_ALERT',
              title: 'Vencimento Próximo',
              message: `Atenção: Você tem ${upcomingAccounts.length} conta(s) a pagar vencendo nos próximos dias.`
            }
          });
        }
      }
    }

    const tenantTemplates = tenant?.whatsapp_templates as any;
    
    const finalTemplates = {
      reminder: tenantTemplates?.reminder || systemTemplates?.reminder || "Olá {cliente}, passando para confirmar seu horário amanhã às {hora} na {barbearia} com {barbeiro}.",
      review: tenantTemplates?.review || systemTemplates?.review || "Olá {cliente}, muito obrigado pela preferência! Que tal avaliar o corte do {barbeiro}? Acesse: {link}",
      cancellation: tenantTemplates?.cancellation || systemTemplates?.cancellation || "Olá {cliente}, informamos que seu agendamento na {barbearia} foi cancelado. Acesse nosso link para remarcar!"
    };

    // Se for OWNER ou SUPER_ADMIN, buscar todos os agendamentos da unidade
    // Se for BARBER, buscar apenas os seus.
    const whereClause: any = {
      tenantId: tenantId,
      start_time: {
        gte: selectedDate,
        lt: tomorrow
      }
    };

    if (session?.user?.role === 'BARBER') {
      whereClause.barberId = session.user.id;
    }

    // Resumo Financeiro do Dia
    const todayStart = new Date(selectedDate);
    const todayEnd = new Date(tomorrow);

    let totalRevenue = 0;
    let totalCommissions = 0;

    if (isOwner) {
      const transactions = await db.transaction.findMany({
        where: {
          tenantId,
          type: 'INCOME',
          createdAt: { gte: todayStart, lt: todayEnd }
        }
      });
      totalRevenue = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    } else {
      const sales = await db.sale.findMany({
        where: {
          tenantId,
          barberId: session?.user?.id,
          createdAt: { gte: todayStart, lt: todayEnd }
        }
      });
      totalCommissions = sales.reduce((acc, s) => acc + Number(s.barber_commission), 0);
    }

    // Buscar lista de barbeiros para a visão de multi-colunas
    let barbersList: Array<{ id: string; name: string; avatar_url: string | null; role: string }> = [];

    if (tenantId) {
      if (isOwner) {
        const teamUnits = await db.barberUnit.findMany({
          where: {
            unit: { tenantId }
          },
          include: {
            barber: true
          },
          orderBy: [
            { barber: { role: 'asc' } },
            { barber: { name: 'asc' } }
          ]
        });

        const seenBarbers = new Set<string>();
        for (const item of teamUnits) {
          if (item.barber && !seenBarbers.has(item.barber.id)) {
            seenBarbers.add(item.barber.id);
            barbersList.push({
              id: item.barber.id,
              name: item.barber.name,
              avatar_url: item.barber.avatar_url,
              role: item.barber.role
            });
          }
        }
      } else if (session?.user?.id) {
        barbersList = [{
          id: session.user.id,
          name: session.user.name || "Meu Perfil",
          avatar_url: session.user.image || null,
          role: session.user.role || "BARBER"
        }];
      }
    }

    const dbAppointments = await db.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        barber: true // Incluir para mostrar o nome do barbeiro se for dono
      },
      orderBy: { start_time: 'asc' }
    });

    // Mapear DB para formato visual
    const appointments = dbAppointments.map(app => {
      const hours = app.start_time.getHours().toString().padStart(2, '0');
      const minutes = app.start_time.getMinutes().toString().padStart(2, '0');
      
      return {
        id: app.id,
        time: `${hours}:${minutes}`,
        duration: app.service.duration_minutes,
        client: app.client.name,
        clientPhone: app.client.phone,
        service: app.service.name,
        servicePrice: Number(app.service.price),
        barberId: app.barberId,
        barberName: app.barber.name,
        status: app.status
      };
    });

    // Se a lista de barbeiros estiver vazia mas tiver agendamentos, derive dos agendamentos
    if (barbersList.length === 0) {
      const barberMap = new Map<string, string>();
      appointments.forEach(a => {
        if (a.barberId && a.barberName) {
          barberMap.set(a.barberId, a.barberName);
        }
      });
      barbersList = Array.from(barberMap.entries()).map(([id, name]) => ({
        id,
        name,
        avatar_url: null,
        role: "BARBER"
      }));
    }

    // Horários de funcionamento (Ex: 08:00 às 21:00)
    const hours = Array.from({ length: 14 }, (_, i) => i + 8);
    
    // Buscar Produtos para o PDV
    const productsRaw = await db.product.findMany({
      where: { tenantId: tenantId },
      orderBy: { name: 'asc' }
    });
    const products = productsRaw.map(p => ({
      ...p,
      price: Number(p.price)
    }));

    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto w-full pb-16">
        
        {/* Header com os Resumos Rápidos */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
              <span className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Calendar size={26} />
              </span>
              Agenda & Atendimentos
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <Link
                href={`/dashboard?date=${prevDateStr}`}
                className="p-2 bg-surface hover:bg-surface-hover border border-secondary rounded-xl transition-all text-text-secondary hover:text-text-primary"
                title="Dia Anterior"
              >
                <ChevronLeft size={18} />
              </Link>
              <div className="px-4 py-2 bg-surface border border-secondary rounded-xl font-bold text-text-primary text-sm flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="capitalize">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <Link
                href={`/dashboard?date=${nextDateStr}`}
                className="p-2 bg-surface hover:bg-surface-hover border border-secondary rounded-xl transition-all text-text-secondary hover:text-text-primary"
                title="Próximo Dia"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {!isOwner && (
              <div className="bg-surface border border-secondary px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-bold tracking-wider">Minha Comissão Hoje</p>
                  <p className="text-lg font-bold text-emerald-400">R$ {totalCommissions.toFixed(2)}</p>
                </div>
              </div>
            )}
            {isOwner && (
              <div className="bg-surface border border-secondary px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-bold tracking-wider">Caixa Hoje</p>
                  <p className="text-lg font-bold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            )}

            <Link href="/dashboard/encaixe" className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
              <span>+ Encaixe Rápido</span>
            </Link>
          </div>
        </div>

        {/* O componente Timeline com visualização em Colunas por Barbeiro e Lista */}
        <Timeline 
          hours={hours} 
          appointments={appointments} 
          barbers={barbersList}
          products={products}
          isOwner={isOwner} 
          whatsappTemplates={finalTemplates}
          selectedDateFormatted={selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
        />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-danger bg-danger/10 rounded-2xl border border-danger/20 font-mono text-sm max-w-5xl mx-auto overflow-auto shadow-xl">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>⚠️</span> CRASH NO DASHBOARD
        </h1>
        <pre className="text-xs bg-black/40 p-4 rounded-xl mb-4 overflow-x-auto">{error.message}</pre>
        <pre className="text-xs opacity-70 bg-black/20 p-4 rounded-xl overflow-x-auto">{error.stack}</pre>
      </div>
    );
  }
}

