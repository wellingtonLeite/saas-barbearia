"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { createBooking } from "@/app/actions/booking";
import { CheckCircle2, ChevronRight, Scissors, Clock, User, Calendar as CalIcon, Star, Sparkles, Check, ArrowLeft, Loader2 } from "lucide-react";

export default function BookingWizard({ 
  tenant, 
  services, 
  barbers, 
  unitId,
  initialServiceId,
  initialBarberId
}: { 
  tenant: any, 
  services: any[], 
  barbers: any[], 
  unitId: string,
  initialServiceId?: string,
  initialBarberId?: string
}) {
  const initialService = initialServiceId ? services.find(s => s.id === initialServiceId) : null;
  const initialBarber = initialBarberId ? barbers.find(b => b.id === initialBarberId) : null;
  
  const initialStep = (initialService && initialBarber) ? 3 : (initialService ? 2 : 1);

  const [step, setStep] = useState(initialStep);
  const [selectedService, setSelectedService] = useState<any>(initialService || null);
  const [selectedBarber, setSelectedBarber] = useState<any>(initialBarber || null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Form details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic available times
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  useEffect(() => {
    if (!selectedDate || !selectedBarber || !selectedService) return;

    const fetchAvailableTimes = async () => {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}&barberId=${selectedBarber.id}&unitId=${unitId}&serviceId=${selectedService.id}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableTimes(data.availableTimes || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTimes(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, selectedBarber, selectedService, unitId]);

  const handleBooking = async () => {
    setIsLoading(true);
    const res = await createBooking({
      tenantId: tenant.id,
      unitId,
      serviceId: selectedService.id,
      barberId: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientPhone
    });
    
    if (res.success) {
      window.location.href = `/agendamento/${res.appointmentId}`;
    } else {
      setIsLoading(false);
      alert(res.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-surface p-12 rounded-3xl border border-secondary text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-text-primary">Agendamento Confirmado!</h2>
        <p className="text-text-secondary text-lg">
          Olá, {clientName}! Seu horário para <span className="text-primary font-bold">{selectedService.name}</span> com <span className="text-primary font-bold">{selectedBarber.name}</span> foi marcado para dia <span className="text-text-primary font-bold">{selectedDate.split('-').reverse().join('/')} às {selectedTime}</span>.
        </p>
        <p className="text-text-secondary">Te esperamos lá!</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-secondary rounded-3xl overflow-hidden shadow-2xl">
      {/* Stepper Header */}
      <div className="bg-surface-hover p-4 sm:p-6 border-b border-secondary flex justify-between items-center overflow-x-auto gap-2">
        <button 
          type="button" 
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${step >= 1 ? 'text-primary font-bold' : 'text-text-secondary'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= 1 ? 'border-primary bg-primary text-black' : 'border-secondary bg-surface'}`}>
            {step > 1 ? <Check size={14} strokeWidth={3} /> : "1"}
          </div>
          <span className="text-sm">Serviço</span>
        </button>

        <ChevronRight className="text-secondary shrink-0" size={16} />

        <button 
          type="button" 
          onClick={() => selectedService && setStep(2)}
          disabled={!selectedService}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${step >= 2 ? 'text-primary font-bold' : 'text-text-secondary'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= 2 ? 'border-primary bg-primary text-black' : 'border-secondary bg-surface'}`}>
            {step > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
          </div>
          <span className="text-sm">Profissional</span>
        </button>

        <ChevronRight className="text-secondary shrink-0" size={16} />

        <button 
          type="button" 
          onClick={() => selectedBarber && setStep(3)}
          disabled={!selectedBarber}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${step >= 3 ? 'text-primary font-bold' : 'text-text-secondary'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= 3 ? 'border-primary bg-primary text-black' : 'border-secondary bg-surface'}`}>
            {step > 3 ? <Check size={14} strokeWidth={3} /> : "3"}
          </div>
          <span className="text-sm">Horário</span>
        </button>

        <ChevronRight className="text-secondary shrink-0" size={16} />

        <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 4 ? 'text-primary font-bold' : 'text-text-secondary'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= 4 ? 'border-primary bg-primary text-black' : 'border-secondary bg-surface'}`}>
            4
          </div>
          <span className="text-sm">Confirmação</span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        
        {/* Passo 1: Serviços com Cards Ricos e Fotos em Alta Definição */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2.5">
                  <Scissors className="text-primary" /> Escolha o Serviço ou Corte
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">{services.length} opções disponíveis</p>
              </div>
              {selectedBarber && (
                <div className="flex items-center gap-2 bg-surface-hover border border-secondary px-3 py-1.5 rounded-full w-fit">
                  <span className="text-xs text-text-secondary">Barbeiro:</span>
                  <span className="text-xs font-bold text-primary">{selectedBarber.name}</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedBarber(null); }}
                    className="text-[10px] text-text-secondary hover:text-white underline ml-1"
                  >
                    Trocar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div 
                    key={service.id} 
                    onClick={() => { 
                      setSelectedService(service); 
                      if (selectedBarber) {
                        setStep(3);
                      } else {
                        setStep(2);
                      }
                    }}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col group ${
                      isSelected 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xl" 
                        : "border-secondary hover:border-primary/60 bg-surface hover:bg-surface-hover shadow-sm"
                    }`}
                  >
                    {/* Imagem do Serviço se houver */}
                    {service.image_url && (
                      <div className="h-36 w-full overflow-hidden bg-background relative shrink-0">
                        <img 
                          src={service.image_url} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                        <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <Clock size={12} className="text-primary" /> {service.duration_minutes} min
                        </span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {!service.image_url && (
                          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                            <span className="flex items-center gap-1 font-medium"><Clock size={13} /> {service.duration_minutes} min</span>
                          </div>
                        )}
                        <h4 className="font-bold text-base sm:text-lg text-text-primary group-hover:text-primary transition-colors">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-secondary/60">
                        <div>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">Valor</span>
                          <p className="font-display font-black text-primary text-xl">
                            {formatCurrency(Number(service.price))}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs group-hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
                          Selecionar <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Passo 2: Profissionais com Foto de Alta Qualidade, Estrelas e Badges */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2.5">
                <User className="text-primary" /> Escolha o Profissional
              </h3>
              {selectedService && (
                <span className="text-xs text-primary font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  {selectedService.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map(barber => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <div 
                    key={barber.id} 
                    onClick={() => { setSelectedBarber(barber); setStep(3); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${
                      isSelected 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xl" 
                        : "border-secondary hover:border-primary/60 bg-surface hover:bg-surface-hover shadow-sm"
                    }`}
                  >
                    {/* Foto do Barbeiro em Alta Resolução */}
                    <div className="relative shrink-0">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-primary/40 overflow-hidden bg-secondary flex items-center justify-center shadow-lg group-hover:border-primary transition-colors">
                        {barber.avatar_url ? (
                          <img 
                            src={barber.avatar_url} 
                            alt={barber.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-text-primary group-hover:text-primary">
                            {barber.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-surface" title="Disponível Hoje" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base sm:text-lg text-text-primary group-hover:text-primary transition-colors truncate">
                          {barber.name}
                        </h4>
                      </div>

                      {/* Badge de Especialista */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-0.5">
                        <Sparkles size={11} /> Especialista Disponível
                      </span>

                      {/* Avaliações & Estrelas */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <div className="flex items-center text-amber-400 gap-0.5">
                          <Star size={13} className="fill-amber-400" />
                          <span className="font-bold text-text-primary">{barber.averageRating || "5.0"}</span>
                        </div>
                        <span className="text-text-secondary text-[11px]">
                          ({barber.reviewCount || 0} avaliações)
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="w-9 h-9 rounded-full bg-secondary group-hover:bg-primary group-hover:text-black flex items-center justify-center transition-all text-text-secondary">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              type="button"
              onClick={() => setStep(1)} 
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-medium transition-colors pt-2"
            >
              <ArrowLeft size={14} /> Trocar serviço selecionado
            </button>
          </div>
        )}

        {/* Passo 3: Data e Hora */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <CalIcon className="text-primary" /> Escolha o Dia e Horário
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Selecione a Data</label>
                <input 
                  type="date" 
                  className="w-full md:w-1/2 bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm font-medium"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedDate && (
                <div className="pt-2 animate-fade-in space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Horários Disponíveis</label>
                  {isLoadingTimes ? (
                    <div className="text-text-secondary text-sm flex items-center gap-2 py-4">
                      <Loader2 size={18} className="animate-spin text-primary" /> Buscando horários disponíveis na agenda...
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl text-sm">
                      Nenhum horário livre para esta data com este barbeiro. Por favor, selecione outra data.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                            selectedTime === time 
                              ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30 scale-105' 
                              : 'bg-background text-text-primary border-secondary hover:border-primary/50 hover:bg-surface-hover'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-secondary mt-8">
              <button 
                type="button"
                onClick={() => setStep(2)} 
                className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-medium"
              >
                <ArrowLeft size={14} /> Voltar para profissionais
              </button>

              <button 
                type="button"
                onClick={() => setStep(4)} 
                disabled={!selectedDate || !selectedTime}
                className="bg-primary hover:bg-primary-hover disabled:bg-secondary disabled:text-text-secondary text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Continuar para Confirmação
              </button>
            </div>
          </div>
        )}

        {/* Passo 4: Confirmação & Seus Dados */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Confirmar Agendamento</h3>
            
            {/* Card de Resumo do Atendimento */}
            <div className="bg-background/80 p-6 rounded-2xl border border-secondary flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Foto ou Avatar do Barbeiro */}
                <div className="w-16 h-16 rounded-full border-2 border-primary/50 overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                  {selectedBarber?.avatar_url ? (
                    <img src={selectedBarber.avatar_url} alt={selectedBarber.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{selectedBarber?.name?.charAt(0)}</span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Resumo da Reserva</p>
                  <h4 className="font-bold text-text-primary text-lg">{selectedService?.name}</h4>
                  <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
                    Profissional: <strong className="text-text-primary">{selectedBarber?.name}</strong>
                  </p>
                  <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                    <CalIcon size={13} /> {selectedDate.split('-').reverse().join('/')} às {selectedTime} ({selectedService?.duration_minutes} min)
                  </p>
                </div>
              </div>

              <div className="text-right border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                <span className="text-xs text-text-secondary uppercase">Total</span>
                <p className="font-display font-black text-primary text-2xl sm:text-3xl">
                  {formatCurrency(Number(selectedService?.price))}
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Seu Nome Completo</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Como você prefere ser chamado?"
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Seu WhatsApp (para confirmação e lembretes)</label>
                <input 
                  type="tel" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-secondary mt-8">
              <button 
                type="button"
                onClick={() => setStep(3)} 
                className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-medium"
              >
                <ArrowLeft size={14} /> Voltar para horários
              </button>

              <button 
                type="button"
                onClick={handleBooking} 
                disabled={isLoading || !clientName || !clientPhone}
                className="bg-primary hover:bg-primary-hover disabled:bg-secondary disabled:text-text-secondary text-black font-black px-10 py-4 rounded-xl transition-all text-base flex items-center gap-2 shadow-xl shadow-primary/25 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirmar Agendamento
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
