import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Calendar, Clock, Scissors, User as UserIcon, X, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { cancelAppointment } from "@/app/actions/client-appointment";

export default async function ClientAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const appointment = await db.appointment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      tenant: true,
      unit: true,
      barber: true,
      service: true,
      client: true
    }
  });

  if (!appointment) notFound();

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

          <div className="bg-background rounded-xl p-6 border border-secondary space-y-4">
            <div className="flex items-center gap-4 text-text-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Data e Hora</p>
                <p className="font-bold">
                  {appointment.start_time.toLocaleDateString('pt-BR')} às {appointment.start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-text-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Scissors size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Serviço</p>
                <p className="font-bold">{appointment.service.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-text-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Profissional</p>
                <p className="font-bold">{appointment.barber.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-text-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Local</p>
                <p className="font-bold text-sm">{appointment.unit.name} - {appointment.unit.address || "Endereço não cadastrado"}</p>
              </div>
            </div>
          </div>

          {isCancellable && (
            <div className="pt-4 space-y-4">
              <p className="text-sm text-center text-text-secondary">Precisa mudar os planos?</p>
              
              <div className="grid grid-cols-1 gap-4">
                <Link 
                  href={`/${appointment.tenant.slug}/agendar`}
                  className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
                >
                  <CalendarDays size={20} /> Fazer Novo Agendamento
                </Link>
                
                {canCancelWithoutPenalty ? (
                  <form action={cancelAppointment}>
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <button 
                      type="submit"
                      className="w-full py-4 bg-transparent border-2 border-danger text-danger font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-danger/10 transition-colors"
                    >
                      <X size={20} /> Cancelar este Horário
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-4 bg-danger/10 border border-danger/30 rounded-xl">
                    <p className="text-sm text-danger font-medium">Cancelamentos só podem ser feitos com mais de 2h de antecedência. Entre em contato diretamente com a barbearia.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
