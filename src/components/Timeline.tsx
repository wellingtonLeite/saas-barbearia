"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { Clock, Scissors, User as UserIcon, Check, Play, X, DollarSign, Star, Loader2 } from "lucide-react";

type Appointment = {
  id: string;
  time: string;
  duration: number;
  client: string;
  clientPhone?: string | null;
  service: string;
  servicePrice: number;
  barberName: string;
  status: string;
};

type Product = {
  id: string;
  name: string;
  price: any; // Decimal convert to number or use as any for now
  stock_quantity: number;
};

export default function Timeline({
  appointments,
  hours,
  products,
  isOwner,
  whatsappTemplates
}: {
  appointments: Appointment[];
  hours: number[];
  products: Product[];
  isOwner: boolean;
  whatsappTemplates?: any;
}) {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const getWhatsappLink = (type: 'reminder' | 'review' | 'cancellation', appt: Appointment) => {
    if (!whatsappTemplates) return "#";
    let text = whatsappTemplates[type] || "";
    text = text.replace(/{cliente}/g, appt.client);
    text = text.replace(/{barbearia}/g, "nossa barbearia");
    text = text.replace(/{hora}/g, appt.time);
    text = text.replace(/{barbeiro}/g, appt.barberName);
    
    // Base URL is available on client
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.com';
    text = text.replace(/{link}/g, `${origin}/avaliar/${appt.id}`);
    
    const phone = appt.clientPhone ? appt.clientPhone.replace(/\D/g, '') : '';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Otimização visual para o card de fundo atualizar instantaneamente
  const [localAppointments, setLocalAppointments] = useState(appointments);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = selectedAppt ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setSelectedAppt(null);
          setIsCheckoutMode(false);
          setSelectedProductIds([]);
        }}
      ></div>

      {/* Painel Lateral */}
      <div className="bg-background relative w-full max-w-md h-full shadow-2xl flex flex-col border-l border-secondary animate-slide-up z-10 overflow-hidden">
        <div className="p-6 border-b border-secondary flex justify-between items-center bg-surface">
          <h2 className="text-xl font-display font-bold text-text-primary">Gerenciar Atendimento</h2>
          <button 
            onClick={() => {
              setSelectedAppt(null);
              setIsCheckoutMode(false);
              setSelectedProductIds([]);
            }} 
            className="p-2 hover:bg-secondary rounded-full transition-colors text-text-secondary hover:text-text-primary"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-background">
          <div className="space-y-6">
            <div className="bg-surface p-4 rounded-xl border border-secondary/50">
              <label className="text-sm text-text-secondary uppercase tracking-wider font-bold">Cliente</label>
              <p className="text-xl font-bold text-text-primary mt-1">{selectedAppt.client}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-xl border border-secondary/50">
                <label className="text-sm text-text-secondary uppercase tracking-wider font-bold">Horário</label>
                <p className="text-lg font-bold text-text-primary flex items-center gap-2 mt-1"><Clock size={16} className="text-primary"/> {selectedAppt.time}</p>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-secondary/50">
                <label className="text-sm text-text-secondary uppercase tracking-wider font-bold">Duração</label>
                <p className="text-lg font-bold text-text-primary mt-1">{selectedAppt.duration} min</p>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-secondary/50">
              <label className="text-sm text-text-secondary uppercase tracking-wider font-bold">Serviço</label>
              <p className="text-lg font-bold text-text-primary mt-1 flex items-center gap-2"><Scissors size={16} className="text-primary"/> {selectedAppt.service}</p>
            </div>

            {isOwner && (
              <div className="bg-surface p-4 rounded-xl border border-secondary/50">
                <label className="text-sm text-text-secondary uppercase tracking-wider font-bold">Profissional</label>
                <p className="text-lg font-bold text-text-primary mt-1 flex items-center gap-2"><UserIcon size={16} className="text-primary"/> {selectedAppt.barberName}</p>
              </div>
            )}

            <div className="pt-6 border-t border-secondary space-y-4">
              <h3 className="font-bold text-lg mb-4 text-text-primary">Alterar Status</h3>
              
              {selectedAppt.status === 'PENDING' && (
                <>
                  <button 
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const { updateAppointmentStatus } = await import("@/app/actions/appointment");
                        
                        // Otimista
                        const newStatus = 'CONFIRMED';
                        setSelectedAppt({...selectedAppt, status: newStatus});
                        setLocalAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: newStatus } : a));
                        
                        // Server Action
                        await updateAppointmentStatus(selectedAppt.id, newStatus);
                      });
                    }}
                    className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <UserIcon size={20} />} Cliente Chegou
                  </button>
                  <button 
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const { updateAppointmentStatus } = await import("@/app/actions/appointment");
                        
                        const newStatus = 'CANCELLED';
                        setSelectedAppt({...selectedAppt, status: newStatus});
                        setLocalAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: newStatus } : a));
                        
                        await updateAppointmentStatus(selectedAppt.id, newStatus);
                      });
                    }}
                    className="w-full py-4 px-4 bg-transparent border-2 border-danger/50 text-danger hover:bg-danger/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <X size={20} />} Cancelar Atendimento
                  </button>
                  <a 
                    href={getWhatsappLink('reminder', selectedAppt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4 border border-green-500/30"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                    Lembrar via WhatsApp
                  </a>
                </>
              )}

              {selectedAppt.status === 'CONFIRMED' && (
                <>
                  <button 
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const { startAppointmentAndOpenComanda } = await import("@/app/actions/appointment");
                        
                        const newStatus = 'IN_PROGRESS';
                        setSelectedAppt({...selectedAppt, status: newStatus});
                        setLocalAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: newStatus } : a));
                        
                        await startAppointmentAndOpenComanda(selectedAppt.id);
                      });
                    }}
                    className="w-full py-4 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />} Iniciar Corte
                  </button>
                  <a 
                    href={getWhatsappLink('reminder', selectedAppt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4 border border-green-500/30"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                    Avisar no WhatsApp
                  </a>
                </>
              )}

              {selectedAppt.status === 'IN_PROGRESS' && (
                <button 
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const { updateAppointmentStatus } = await import("@/app/actions/appointment");
                      const newStatus = 'COMPLETED';
                      setSelectedAppt({...selectedAppt, status: newStatus});
                      setLocalAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: newStatus } : a));
                      await updateAppointmentStatus(selectedAppt.id, newStatus);
                    });
                  }}
                  className="w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  <Check size={20} /> Finalizar Atendimento
                </button>
              )}

              {selectedAppt.status === 'COMPLETED' && (
                <a 
                  href={getWhatsappLink('review', selectedAppt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4 border border-green-500/30"
                >
                  <Star size={20} />
                  Pedir Avaliação no WhatsApp
                </a>
              )}

              {selectedAppt.status === 'COMPLETED' && (
                <div className="bg-success/10 border border-success/30 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-success" />
                  </div>
                  <p className="font-bold text-success text-lg">Atendimento Concluído!</p>
                  <p className="text-sm text-text-secondary mt-2 mb-6">A comissão já foi lançada no financeiro.</p>
                  
                  <div className="flex flex-col gap-3">
                    {selectedAppt.clientPhone && (
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/avaliar/${selectedAppt.id}`;
                          const msg = encodeURIComponent(`Olá ${selectedAppt.client}! Muito obrigado por cortar na nossa barbearia com o barbeiro ${selectedAppt.barberName}. O que achou do atendimento? Deixe sua avaliação aqui: ${url}`);
                          const phoneNum = (selectedAppt.clientPhone || '').replace(/\D/g, '');
                          window.open(`https://wa.me/55${phoneNum}?text=${msg}`, '_blank');
                        }}
                        className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/20"
                      >
                        Enviar Avaliação pelo WhatsApp
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/avaliar/${selectedAppt.id}`);
                        alert("Link de avaliação copiado para a área de transferência!");
                      }}
                      className="w-full py-3 bg-surface border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                    >
                      <Star size={18} /> Copiar Link de Avaliação
                    </button>
                  </div>
                </div>
              )}

              {selectedAppt.status === 'CANCELLED' && (
                <div className="bg-danger/10 border border-danger/30 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-danger" />
                  </div>
                  <p className="font-bold text-danger text-lg">Atendimento Cancelado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-xl shadow-black/20 relative">
        <div className="p-6 border-b border-secondary bg-surface-hover flex justify-between items-center">
          <h2 className="font-bold text-text-primary text-xl">Timeline Diária</h2>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-text-secondary">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning"></span> Pendente</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Confirmado</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Em Progresso</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success"></span> Finalizado</div>
          </div>
        </div>

        <div className="relative py-8 px-4 sm:px-8">
          {/* Fio Vertical Contínuo */}
          <div className="absolute left-[72px] sm:left-[88px] top-8 bottom-8 w-[2px] bg-secondary/30 rounded-full"></div>

          <div className="space-y-0">
            {hours.map((hour) => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              const halfHourStr = `${hour.toString().padStart(2, '0')}:30`;
              
              const apptsOnHour = localAppointments.filter(a => a.time === hourStr);
              const apptsOnHalf = localAppointments.filter(a => a.time === halfHourStr);

              const getStatusStyles = (status: string) => {
                switch(status) {
                  case 'PENDING': return { bg: 'bg-warning/5', border: 'border-l-warning', text: 'text-warning' };
                  case 'CONFIRMED': return { bg: 'bg-blue-500/5', border: 'border-l-blue-500', text: 'text-blue-500' };
                  case 'IN_PROGRESS': return { bg: 'bg-purple-500/5', border: 'border-l-purple-500', text: 'text-purple-500' };
                  case 'COMPLETED': return { bg: 'bg-success/5', border: 'border-l-success', text: 'text-success' };
                  case 'CANCELLED': return { bg: 'bg-danger/5 opacity-50', border: 'border-l-danger', text: 'text-danger' };
                  default: return { bg: 'bg-secondary/5', border: 'border-l-secondary', text: 'text-text-secondary' };
                }
              };

              const renderAppointmentCard = (appt: Appointment) => {
                const styles = getStatusStyles(appt.status);
                return (
                  <div 
                    onClick={() => setSelectedAppt(appt)}
                    className={`group/card relative w-full sm:w-[90%] md:w-[80%] cursor-pointer mt-1 mb-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg rounded-r-2xl rounded-l-md border-l-[4px] border-y border-r border-secondary/20 ${styles.border} ${styles.bg} backdrop-blur-sm p-4`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-text-primary text-[15px]">
                        <UserIcon size={14} className={styles.text} /> 
                        {appt.client}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-black/5 text-text-secondary rounded-full">
                        {appt.duration} min
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Scissors size={12} className={styles.text} /> 
                        {appt.service}
                      </span>
                      {isOwner && (
                        <span className="flex items-center gap-1.5 pl-4 border-l border-secondary/40">
                          <Star size={12} className="text-primary" />
                          {appt.barberName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div key={hour} className="relative group">
                  {/* Slot Hora Cheia */}
                  <div className="flex min-h-[52px]">
                    <div className="w-14 sm:w-20 pr-4 sm:pr-6 text-right pt-2 font-display font-bold text-text-secondary text-sm sm:text-base">
                      {hourStr}
                    </div>
                    
                    <div className="flex-1 pl-6 sm:pl-8 relative border-t border-secondary/20 group-hover:bg-primary/[0.01] transition-colors pb-1">
                      {/* Bolinha no eixo */}
                      <div className="absolute left-[-5px] top-[-5px] w-2.5 h-2.5 rounded-full bg-background border-2 border-primary shadow-[0_0_8px_rgba(99,102,241,0.5)] z-10"></div>
                      
                      <div className="flex flex-col gap-2">
                        {apptsOnHour.map(appt => (
                          <div key={appt.id}>{renderAppointmentCard(appt)}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Slot Meia Hora */}
                  <div className="flex min-h-[44px]">
                    <div className="w-14 sm:w-20 pr-4 sm:pr-6 text-right pt-2 text-[11px] font-medium text-text-secondary/40">
                      30
                    </div>
                    
                    <div className="flex-1 pl-6 sm:pl-8 relative border-t border-secondary/10 border-dashed group-hover:bg-primary/[0.01] transition-colors pb-1">
                      <div className="flex flex-col gap-2">
                        {apptsOnHalf.map(appt => (
                          <div key={appt.id}>{renderAppointmentCard(appt)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
