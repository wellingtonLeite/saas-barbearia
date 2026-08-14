import { Clock, Scissors, User as UserIcon, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import Timeline from "@/components/Timeline";

export default async function BarberDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
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
      barberName: app.barber.name,
      status: app.status
    };
  });

  // Horários de funcionamento (Ex: 09:00 às 18:00)
  const hours = Array.from({ length: 10 }, (_, i) => i + 9);
  
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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header com os Resumos Rápidos */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Agenda</h1>
          <div className="flex items-center gap-4 mt-2">
            <Link href={`/dashboard?date=${prevDateStr}`} className="p-1 hover:bg-secondary rounded-lg transition-colors text-text-secondary hover:text-text-primary">
              <ChevronLeft size={20} />
            </Link>
            <p className="text-text-primary font-bold">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <Link href={`/dashboard?date=${nextDateStr}`} className="p-1 hover:bg-secondary rounded-lg transition-colors text-text-secondary hover:text-text-primary">
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {!isOwner && (
            <div className="bg-surface border border-secondary px-6 py-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="text-success" size={20} />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold">Minha Comissão Hoje</p>
                <p className="text-lg font-bold text-success">R$ {totalCommissions.toFixed(2)}</p>
              </div>
            </div>
          )}
          {isOwner && (
            <div className="bg-surface border border-secondary px-6 py-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="text-success" size={20} />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold">Caixa Hoje</p>
                <p className="text-lg font-bold text-success">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          <Link href="/dashboard/encaixe" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center justify-center">
            + Encaixe
          </Link>
        </div>
      </div>



      {/* O componente Timeline recebe os horários, os agendamentos e agora os produtos para o checkout */}
      <Timeline 
        hours={hours} 
        appointments={appointments} 
        products={products}
        isOwner={session?.user?.role !== 'BARBER'} 
        whatsappTemplates={finalTemplates}
      />
    </div>
  );
}
