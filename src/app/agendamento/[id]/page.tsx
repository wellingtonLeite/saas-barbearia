import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Calendar, Clock, Scissors, User as UserIcon, X, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { cancelAppointment } from "@/app/actions/client-appointment";

export default async function ClientAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const paramId = resolvedParams.id;
  
  const appointment = await db.appointment.findUnique({
    where: { id: paramId },
    include: {
      tenant: true,
      unit: true,
      barber: true,
      service: true,
      client: true
    }
  });

  // Se não encontrou o agendamento pelo ID, verifica se o parâmetro é o slug de uma barbearia
  if (!appointment) {
    const tenant = await db.tenant.findFirst({
      where: {
        OR: [
          { slug: paramId },
          { id: paramId }
        ]
      }
    });

    if (tenant) {
      redirect(`/${tenant.slug}/agendar`);
    }

    notFound();
  }

  const isCancellable = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  
  // Calcula horas até o agendamento
  const now = new Date();
  const hoursUntil = (appointment.start_time.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancelWithoutPenalty = hoursUntil > 2; // Exemplo: só pode cancelar se faltar mais de 2 horas

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-bold">Aguardando</span>;
      case 'CONFIRMED': return <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm font-bold">Confirmado</span>;
      case 'IN_PROGRESS': return <span className="bg-purple-500/20 text-purple-500 px-3 py-1 rounded-full text-sm font-bold">Em Atendimento</span>;
      case 'COMPLETED': return <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-bold">Finalizado</span>;
      case 'CANCELLED': return <span className="bg-danger/20 text-danger px-3 py-1 rounded-full text-sm font-bold">Cancelado</span>;
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-secondary rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        
        <div className="p-8 text-center border-b border-secondary bg-surface-hover/30">
          {appointment.tenant.logo_url ? (
            <img src={appointment.tenant.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded-xl mx-auto mb-4" />
          ) : (
            <div className="w-20 h-20 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Scissors size={32} />
            </div>
          )}
          <h1 className="text-2xl font-display font-bold text-text-primary">{appointment.tenant.name}</h1>
          <p className="text-text-secondary mt-1">Gestão do seu agendamento</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Status do Horário</h2>
            {getStatusDisplay(appointment.status)}
          </div>

          <div className="bg-background border border-secondary rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <Scissors size={18} className="text-primary" />
              <span>Serviço: <strong className="text-text-primary">{appointment.service.name}</strong></span>
            </div>
            
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <UserIcon size={18} className="text-primary" />
              <span>Profissional: <strong className="text-text-primary">{appointment.barber.name}</strong></span>
            </div>

            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <CalendarDays size={18} className="text-primary" />
              <span>Data: <strong className="text-text-primary">{appointment.start_time.toLocaleDateString('pt-BR')}</strong></span>
            </div>

            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <Clock size={18} className="text-primary" />
              <span>Horário: <strong className="text-text-primary">{appointment.start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong></span>
            </div>

            {appointment.unit?.address && (
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <MapPin size={18} className="text-primary" />
                <span>Local: <strong className="text-text-primary">{appointment.unit.address}</strong></span>
              </div>
            )}
          </div>

          {isCancellable && (
            <div className="space-y-4">
              <form action={async () => {
                "use server";
                await cancelAppointment(appointment.id);
              }}>
                <button
                  type="submit"
                  className="w-full py-4 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={20} /> Cancelar Agendamento
                </button>
              </form>
              
              {!canCancelWithoutPenalty && (
                <p className="text-xs text-text-secondary text-center">
                  * Atenção: Cancelamentos com menos de 2 horas de antecedência podem estar sujeitos a taxas de acordo com a política da barbearia.
                </p>
              )}
            </div>
          )}

          {!isCancellable && (
            <div className="text-center">
              <Link 
                href={`/${appointment.tenant.slug}/agendar`}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors inline-block"
              >
                Fazer Novo Agendamento
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
