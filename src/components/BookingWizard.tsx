"use client"

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { createBooking } from "@/app/actions/booking";
import { CheckCircle2, ChevronRight, Scissors, Clock, User, Calendar as CalIcon } from "lucide-react";

export default function BookingWizard({ 
  tenant, 
  services, 
  barbers, 
  unitId 
}: { 
  tenant: any, 
  services: any[], 
  barbers: any[], 
  unitId: string 
}) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
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
      <div className="bg-surface p-12 rounded-2xl border border-secondary text-center space-y-6">
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
    <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-2xl">
      {/* Stepper Header */}
      <div className="bg-surface-hover p-6 border-b border-secondary flex justify-between items-center overflow-x-auto">
        <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 1 ? 'text-primary font-bold' : 'text-text-secondary'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary' : 'border-secondary'}`}>1</div>
          <span>Serviço</span>
        </div>
        <ChevronRight className="text-secondary mx-2" />
        <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 2 ? 'text-primary font-bold' : 'text-text-secondary'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary' : 'border-secondary'}`}>2</div>
          <span>Profissional</span>
        </div>
        <ChevronRight className="text-secondary mx-2" />
        <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 3 ? 'text-primary font-bold' : 'text-text-secondary'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary' : 'border-secondary'}`}>3</div>
          <span>Horário</span>
        </div>
        <ChevronRight className="text-secondary mx-2" />
        <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 4 ? 'text-primary font-bold' : 'text-text-secondary'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary' : 'border-secondary'}`}>4</div>
          <span>Confirmação</span>
        </div>
      </div>

      <div className="p-8">
        {/* Passo 1: Serviço */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Scissors className="text-primary" /> O que vamos fazer hoje?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div 
                  key={service.id} 
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className="p-6 border border-secondary rounded-xl hover:border-primary cursor-pointer transition-all hover:bg-primary/5 group"
                >
                  <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">{service.name}</h4>
                  <p className="text-text-secondary text-sm mt-1">{service.duration_minutes} min</p>
                  <p className="font-display font-bold text-primary text-xl mt-4">{formatCurrency(service.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Profissional */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <User className="text-primary" /> Escolha o Profissional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map(barber => (
                <div 
                  key={barber.id} 
                  onClick={() => { setSelectedBarber(barber); setStep(3); }}
                  className="p-6 border border-secondary rounded-xl hover:border-primary cursor-pointer transition-all hover:bg-primary/5 flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">{barber.name}</h4>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-text-secondary hover:text-text-primary underline mt-4 block">Voltar</button>
          </div>
        )}

        {/* Passo 3: Data e Hora */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <CalIcon className="text-primary" /> Escolha o Horário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Data</label>
                <input 
                  type="date" 
                  className="w-full md:w-1/2 bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedDate && (
                <div className="pt-4 animate-fade-in">
                  <label className="block text-sm font-medium text-text-secondary mb-3">Horários Disponíveis</label>
                  {isLoadingTimes ? (
                    <div className="text-text-secondary text-sm flex items-center gap-2">
                      <Clock size={16} className="animate-spin" /> Buscando horários...
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="p-4 bg-warning/10 text-warning border border-warning/20 rounded-lg text-sm">
                      Nenhum horário disponível para esta data. Escolha outra data.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-6 py-3 rounded-lg font-bold border transition-all ${
                            selectedTime === time 
                              ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                              : 'bg-background text-text-primary border-secondary hover:border-primary/50'
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

            <div className="flex justify-between items-center pt-8 border-t border-secondary mt-8">
              <button onClick={() => setStep(2)} className="text-text-secondary hover:text-text-primary underline">Voltar</button>
              <button 
                onClick={() => setStep(4)} 
                disabled={!selectedDate || !selectedTime}
                className="bg-primary hover:bg-primary-hover disabled:bg-secondary disabled:text-text-secondary text-black font-bold px-8 py-3 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Passo 4: Seus Dados */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-text-primary">Quase lá! Só precisamos do seu nome.</h3>
            
            <div className="bg-background p-6 rounded-xl border border-secondary flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-text-secondary text-sm">Resumo do Agendamento</p>
                <p className="font-bold text-text-primary text-lg">{selectedService?.name} com {selectedBarber?.name}</p>
                <p className="text-text-secondary"><CalIcon size={16} className="inline mr-1"/> {selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-primary text-3xl">{formatCurrency(selectedService?.price)}</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Como gostaria de ser chamado?"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp</label>
                <input 
                  type="tel" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-secondary mt-8">
              <button onClick={() => setStep(3)} className="text-text-secondary hover:text-text-primary underline">Voltar</button>
              <button 
                onClick={handleBooking} 
                disabled={isLoading || !clientName || !clientPhone}
                className="bg-primary hover:bg-primary-hover disabled:bg-secondary disabled:text-text-secondary text-black font-bold px-12 py-4 rounded-lg transition-colors text-lg flex items-center gap-2"
              >
                {isLoading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
