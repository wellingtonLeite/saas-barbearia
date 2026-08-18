import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Users, Phone, Calendar, History, Scissors } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isOwner = session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN';

  // Buscar o Tenant do usuário logado (dono ou funcionário)
  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: {
        include: { unit: { include: { tenant: true } } }
      }
    }
  });

  const tenant = userWithUnits?.units[0]?.unit?.tenant;

  if (!tenant) {
    return <div>Barbearia não encontrada.</div>;
  }

  const tenantData = await db.tenant.findUnique({
    where: { id: tenant.id },
    include: {
      subscription: {
        include: {
          plan: true
        }
      }
    }
  });

  const plan = tenantData?.subscription?.plan;
  const hasClientsModule = plan?.has_clients_module ?? true; // Defaults to true for backward compat

  if (!hasClientsModule) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 text-center">
        <div className="bg-surface border border-secondary p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Users className="text-secondary w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Gestão de Clientes</h2>
          <p className="text-text-secondary mb-6">A gestão de carteira de clientes não está disponível no plano {plan?.name || 'Atual'}.</p>
          <Link href="/dashboard/assinatura" className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
            Fazer Upgrade do Plano
          </Link>
        </div>
      </div>
    );
  }

  // Buscar Clientes (Usuários que têm agendamento nesta barbearia)
  const clients = await db.user.findMany({
    where: {
      role: 'CLIENT',
      client_appointments: {
        some: {
          tenantId: tenant.id,
          ...(isOwner ? {} : { barberId: session.user.id }) // Barbeiro vê só seus clientes
        }
      }
    },
    include: {
      client_appointments: {
        where: {
          tenantId: tenant.id,
          ...(isOwner ? {} : { barberId: session.user.id })
        },
        orderBy: { start_time: 'desc' },
        include: { service: true, barber: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <Users className="text-primary" size={32} /> Meus Clientes
          </h1>
          <p className="text-text-secondary mt-2">
            {isOwner ? "Todos os clientes que já agendaram na barbearia." : "Clientes que você já atendeu."}
          </p>
        </div>
        <div className="bg-surface border border-secondary px-6 py-3 rounded-xl shadow-sm flex items-center justify-center flex-col">
          <p className="text-sm text-text-secondary uppercase tracking-wider font-bold">Total de Clientes</p>
          <p className="text-2xl font-bold text-primary">{clients.length}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-surface border border-secondary rounded-2xl p-12 text-center shadow-lg shadow-gray-200/50">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Nenhum cliente ainda</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Assim que os clientes começarem a agendar horários, eles aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            const appointmentsCount = client.client_appointments.length;
            const lastAppt = client.client_appointments[0];
            const hasPhone = !!client.phone;

            return (
              <div key={client.id} className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center font-bold text-xl uppercase shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary line-clamp-1">{client.name}</h3>
                    {hasPhone ? (
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <Phone size={14} /> {client.phone}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <Phone size={14} /> Sem telefone
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-secondary/50">
                    <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                      <History size={16} /> Frequência
                    </span>
                    <span className="font-bold text-text-primary">
                      {appointmentsCount} {appointmentsCount === 1 ? 'corte' : 'cortes'}
                    </span>
                  </div>
                  
                  {lastAppt && (
                    <div className="pt-4 border-t border-secondary/50">
                      <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2">Último Agendamento</p>
                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {new Date(lastAppt.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                            <Scissors size={12} /> {lastAppt.service.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {hasPhone && (
                  <div className="mt-6">
                    <a 
                      href={`https://wa.me/55${client.phone?.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={18} /> Chamar no WhatsApp
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
