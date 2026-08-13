import { Clock, Scissors, User as UserIcon, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import Timeline from "@/components/Timeline";

export default async function BarberDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const dateParam = resolvedParams.date;
  
  // Buscar os appointments de hoje para este barbeiro ou da data selecionada
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
        
        <div className="flex gap-4">
          <Link href="/dashboard/encaixe" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/30">
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
      />
    </div>
  );
}
