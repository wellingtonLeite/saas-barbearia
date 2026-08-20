"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  Scissors,
  User as UserIcon,
  Check,
  Play,
  X,
  DollarSign,
  Star,
  Loader2,
  Columns3,
  ListFilter,
  MessageCircle,
  Crown,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { updateAppointmentStatus, startAppointmentAndOpenComanda } from "@/app/actions/appointment";

export type Appointment = {
  id: string;
  time: string;
  duration: number;
  client: string;
  clientPhone?: string | null;
  service: string;
  servicePrice: number;
  barberId?: string;
  barberName: string;
  status: string;
};

export type BarberInfo = {
  id: string;
  name: string;
  avatar_url?: string | null;
  role?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
};

interface TimelineProps {
  appointments: Appointment[];
  hours: number[];
  barbers?: BarberInfo[];
  products?: Product[];
  isOwner: boolean;
  whatsappTemplates?: any;
  selectedDateFormatted?: string;
}

export default function Timeline({
  appointments,
  hours,
  barbers = [],
  products = [],
  isOwner,
  whatsappTemplates,
  selectedDateFormatted
}: TimelineProps) {
  const [viewMode, setViewMode] = useState<"columns" | "chronological">("columns");
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Otimização visual para o card atualizar instantaneamente
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalizar lista de barbeiros
  const activeBarbers: BarberInfo[] = barbers.length > 0
    ? barbers
    : Array.from(new Set(appointments.map(a => a.barberName))).map((name, idx) => ({
        id: `barber-${idx}`,
        name,
        avatar_url: null,
        role: "BARBER"
      }));

  // Barbeiros filtrados para exibição
  const displayedBarbers = selectedBarberFilter === "all"
    ? activeBarbers
    : activeBarbers.filter(b => b.id === selectedBarberFilter || b.name === selectedBarberFilter);

  // Link WhatsApp inteligente
  const getWhatsappLink = (type: "reminder" | "review" | "cancellation", appt: Appointment) => {
    if (!whatsappTemplates) return "#";
    let text = whatsappTemplates[type] || "";
    text = text.replace(/{cliente}/g, appt.client);
    text = text.replace(/{barbearia}/g, "nossa barbearia");
    text = text.replace(/{hora}/g, appt.time);
    text = text.replace(/{barbeiro}/g, appt.barberName);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://88barber.top";
    text = text.replace(/{link}/g, `${origin}/avaliar/${appt.id}`);

    const phone = appt.clientPhone ? appt.clientPhone.replace(/\D/g, "") : "";
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Funções de Ação Rápida de Status
  const handleSetStatus = (appt: Appointment, newStatus: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    startTransition(async () => {
      // Atualização otimista
      setLocalAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: newStatus } : a));
      if (selectedAppt?.id === appt.id) {
        setSelectedAppt({ ...selectedAppt, status: newStatus });
      }

      if (newStatus === "IN_PROGRESS") {
        await startAppointmentAndOpenComanda(appt.id);
      } else {
        await updateAppointmentStatus(appt.id, newStatus);
      }
    });
  };

  // Configuração visual de status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendente",
          badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          cardBg: "bg-amber-500/[0.04] border-amber-500/50 hover:border-amber-500/80",
          accentColor: "text-amber-400",
          barColor: "bg-amber-400"
        };
      case "CONFIRMED":
        return {
          label: "Confirmado",
          badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          cardBg: "bg-blue-500/[0.04] border-blue-500/50 hover:border-blue-500/80",
          accentColor: "text-blue-400",
          barColor: "bg-blue-400"
        };
      case "IN_PROGRESS":
        return {
          label: "Em Corte",
          badgeBg: "bg-purple-500/20 text-purple-200 border-purple-500/40 animate-pulse",
          cardBg: "bg-purple-500/[0.08] border-purple-500/60 hover:border-purple-400 shadow-lg shadow-purple-500/5",
          accentColor: "text-purple-300",
          barColor: "bg-purple-400"
        };
      case "COMPLETED":
        return {
          label: "Finalizado",
          badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          cardBg: "bg-emerald-500/[0.03] border-emerald-500/40 hover:border-emerald-500/70",
          accentColor: "text-emerald-400",
          barColor: "bg-emerald-400"
        };
      case "CANCELLED":
        return {
          label: "Cancelado",
          badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          cardBg: "bg-rose-500/[0.02] border-rose-500/30 opacity-60",
          accentColor: "text-rose-400",
          barColor: "bg-rose-400"
        };
      default:
        return {
          label: status,
          badgeBg: "bg-secondary text-text-secondary border-secondary",
          cardBg: "bg-surface border-secondary",
          accentColor: "text-text-secondary",
          barColor: "bg-secondary"
        };
    }
  };

  // Contadores rápidos
  const totalCount = localAppointments.length;
  const pendingCount = localAppointments.filter(a => a.status === "PENDING").length;
  const confirmedCount = localAppointments.filter(a => a.status === "CONFIRMED").length;
  const inProgressCount = localAppointments.filter(a => a.status === "IN_PROGRESS").length;
  const completedCount = localAppointments.filter(a => a.status === "COMPLETED").length;

  // Componente de Card de Agendamento Moderno
  const renderAppointmentCard = (appt: Appointment, isCompact: boolean = false) => {
    const statusCfg = getStatusConfig(appt.status);

    return (
      <div
        key={appt.id}
        onClick={() => setSelectedAppt(appt)}
        className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer shadow-md overflow-hidden flex flex-col justify-between ${statusCfg.cardBg} ${
          isCompact ? "p-3.5" : "p-4"
        }`}
      >
        {/* Barra de destaque lateral */}
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${statusCfg.barColor}`} />

        <div>
          {/* Linha Superior: Horário e Badge */}
          <div className="flex items-center justify-between gap-2 pl-1 mb-2">
            <span className="font-display font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
              <Clock size={13} className={statusCfg.accentColor} />
              {appt.time}
              <span className="text-[11px] font-normal text-text-secondary">({appt.duration}m)</span>
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${statusCfg.badgeBg}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Linha Central: Cliente e Serviço */}
          <div className="pl-1 space-y-1">
            <div className="flex items-center gap-1.5 text-text-primary font-bold text-sm truncate">
              <UserIcon size={14} className="text-text-secondary shrink-0" />
              <span className="truncate">{appt.client}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-secondary truncate">
              <Scissors size={13} className="text-primary shrink-0" />
              <span className="truncate">{appt.service}</span>
            </div>

            {isOwner && viewMode === "chronological" && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                <Star size={11} className="fill-amber-400/80" />
                <span>{appt.barberName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Linha Inferior: Preço e Ações Rápidas */}
        <div className="pl-1 pt-3 mt-3 border-t border-secondary/40 flex items-center justify-between gap-2">
          <span className="font-bold text-xs sm:text-sm text-emerald-400">
            R$ {appt.servicePrice.toFixed(2)}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {appt.clientPhone && (
              <a
                href={getWhatsappLink("reminder", appt)}
                target="_blank"
                rel="noopener noreferrer"
                title="Mensagem no WhatsApp"
                className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
              >
                <MessageCircle size={13} />
              </a>
            )}

            {/* Ações Rápidas de 1 Clique */}
            {appt.status === "PENDING" && (
              <button
                disabled={isPending}
                onClick={() => handleSetStatus(appt, "CONFIRMED")}
                title="Cliente Chegou"
                className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/40 flex items-center gap-1 disabled:opacity-50"
              >
                <UserCheck size={12} /> Chegou
              </button>
            )}

            {appt.status === "CONFIRMED" && (
              <button
                disabled={isPending}
                onClick={() => handleSetStatus(appt, "IN_PROGRESS")}
                title="Iniciar Corte"
                className="px-2.5 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1 disabled:opacity-50"
              >
                <Play size={12} className="fill-white" /> Iniciar
              </button>
            )}

            {appt.status === "IN_PROGRESS" && (
              <button
                disabled={isPending}
                onClick={() => handleSetStatus(appt, "COMPLETED")}
                title="Finalizar Atendimento"
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 disabled:opacity-50"
              >
                <Check size={12} /> Concluir
              </button>
            )}

            {appt.status === "COMPLETED" && (
              <a
                href={getWhatsappLink("review", appt)}
                target="_blank"
                rel="noopener noreferrer"
                title="Pedir Avaliação"
                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-bold transition-colors border border-emerald-500/30 flex items-center gap-1"
              >
                <Star size={11} className="fill-emerald-400" /> Avaliação
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Lateral (Drawer) de Detalhes
  const modalContent = selectedAppt ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end">
      {/* Overlay Escuro */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setSelectedAppt(null)}
      />

      {/* Painel Lateral */}
      <div className="bg-surface relative w-full max-w-md h-full shadow-2xl flex flex-col border-l border-secondary animate-slide-up z-10 overflow-hidden">
        {/* Topo do Drawer */}
        <div className="p-6 border-b border-secondary flex justify-between items-center bg-surface-hover">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-text-primary">Gerenciar Atendimento</h2>
              <span className="text-xs text-text-secondary">Código #{selectedAppt.id.slice(-6)}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedAppt(null)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-background">
          {/* Card do Cliente */}
          <div className="bg-surface p-5 rounded-2xl border border-secondary shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-bold">Cliente</span>
                <p className="text-xl font-bold text-text-primary mt-0.5">{selectedAppt.client}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {selectedAppt.client.charAt(0).toUpperCase()}
              </div>
            </div>

            {selectedAppt.clientPhone && (
              <div className="pt-3 border-t border-secondary/50 flex items-center justify-between gap-2 text-xs">
                <span className="text-text-secondary font-medium">{selectedAppt.clientPhone}</span>
                <a
                  href={`https://wa.me/${selectedAppt.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-bold border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle size={13} /> Chamar no WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* Grade de Detalhes do Corte */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-4 rounded-2xl border border-secondary">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Horário</span>
              <p className="text-base font-bold text-text-primary flex items-center gap-1.5 mt-1">
                <Clock size={15} className="text-primary" /> {selectedAppt.time}
              </p>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-secondary">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Duração</span>
              <p className="text-base font-bold text-text-primary mt-1">{selectedAppt.duration} min</p>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-secondary">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Serviço</span>
              <p className="text-sm font-bold text-text-primary flex items-center gap-1.5 mt-1 truncate">
                <Scissors size={14} className="text-primary shrink-0" />
                <span className="truncate">{selectedAppt.service}</span>
              </p>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-secondary">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Valor</span>
              <p className="text-base font-bold text-emerald-400 mt-1">
                R$ {selectedAppt.servicePrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Barbeiro Responsável */}
          <div className="bg-surface p-4 rounded-2xl border border-secondary flex items-center justify-between">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Profissional</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{selectedAppt.barberName}</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Barbeiro
            </div>
          </div>

          {/* Status Atual e Ações */}
          <div className="pt-4 border-t border-secondary space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider">Alterar Status</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusConfig(selectedAppt.status).badgeBg}`}>
                {getStatusConfig(selectedAppt.status).label}
              </span>
            </div>

            {selectedAppt.status === "PENDING" && (
              <div className="space-y-3">
                <button
                  disabled={isPending}
                  onClick={() => handleSetStatus(selectedAppt, "CONFIRMED")}
                  className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                  Cliente Chegou na Barbearia
                </button>

                <a
                  href={getWhatsappLink("reminder", selectedAppt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-500/30"
                >
                  <MessageCircle size={18} /> Lembrar via WhatsApp
                </a>

                <button
                  disabled={isPending}
                  onClick={() => handleSetStatus(selectedAppt, "CANCELLED")}
                  className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-rose-500/20 disabled:opacity-50 cursor-pointer text-sm"
                >
                  <X size={16} /> Cancelar Agendamento
                </button>
              </div>
            )}

            {selectedAppt.status === "CONFIRMED" && (
              <div className="space-y-3">
                <button
                  disabled={isPending}
                  onClick={() => handleSetStatus(selectedAppt, "IN_PROGRESS")}
                  className="w-full py-4 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-white" />}
                  Iniciar Atendimento (Abrir Comanda)
                </button>

                <a
                  href={getWhatsappLink("reminder", selectedAppt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-500/30"
                >
                  <MessageCircle size={18} /> Avisar no WhatsApp
                </a>
              </div>
            )}

            {selectedAppt.status === "IN_PROGRESS" && (
              <div className="space-y-3">
                <button
                  disabled={isPending}
                  onClick={() => handleSetStatus(selectedAppt, "COMPLETED")}
                  className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Finalizar Atendimento & Lançar Caixa
                </button>
              </div>
            )}

            {selectedAppt.status === "COMPLETED" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-emerald-300 text-base">Atendimento Concluído</h4>
                  <p className="text-xs text-text-secondary">Comissão e caixa registrados com sucesso.</p>
                </div>

                {selectedAppt.clientPhone && (
                  <a
                    href={getWhatsappLink("review", selectedAppt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle size={18} /> Pedir Avaliação no WhatsApp
                  </a>
                )}

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/avaliar/${selectedAppt.id}`;
                    navigator.clipboard.writeText(url);
                    alert("Link de avaliação copiado!");
                  }}
                  className="w-full py-3 px-4 bg-surface hover:bg-surface-hover border border-secondary text-text-primary rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Star size={16} className="text-amber-400" /> Copiar Link de Avaliação
                </button>
              </div>
            )}

            {selectedAppt.status === "CANCELLED" && (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                  <X size={24} />
                </div>
                <h4 className="font-bold text-rose-300 text-base">Agendamento Cancelado</h4>
                <p className="text-xs text-text-secondary">Este horário ficou liberado na agenda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="bg-surface border border-secondary rounded-3xl overflow-hidden shadow-2xl shadow-black/40 relative">
        {/* Barra Superior com Controles e Seletor de Modo */}
        <div className="p-5 sm:p-6 border-b border-secondary bg-surface-hover flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Lado Esquerdo: Seletor de Visualização */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 bg-background/80 border border-secondary rounded-2xl shadow-inner">
              <button
                onClick={() => setViewMode("columns")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === "columns"
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                <Columns3 size={16} />
                <span>Colunas por Barbeiro</span>
              </button>

              <button
                onClick={() => setViewMode("chronological")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === "chronological"
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                <ListFilter size={16} />
                <span>Lista Cronológica</span>
              </button>
            </div>

            {/* Filtro por Barbeiro quando aplicável */}
            {isOwner && activeBarbers.length > 1 && (
              <div className="flex items-center gap-1.5 bg-background/60 border border-secondary px-3 py-1.5 rounded-2xl">
                <span className="text-xs text-text-secondary font-medium">Filtrar:</span>
                <select
                  value={selectedBarberFilter}
                  onChange={(e) => setSelectedBarberFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-surface text-text-primary">Todos os Barbeiros</option>
                  {activeBarbers.map(b => (
                    <option key={b.id} value={b.id} className="bg-surface text-text-primary">{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Lado Direito: Resumo de Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {pendingCount} Pendentes
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {confirmedCount} Confirmados
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              {inProgressCount} Em Corte
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {completedCount} Finalizados
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODO 1: VISÃO POR COLUNAS DE BARBEIRO (MULTI-BARBER GRID)      */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "columns" && (
          <div className="overflow-x-auto pb-6">
            <div
              className="min-w-full"
              style={{
                minWidth: displayedBarbers.length > 2 ? `${(displayedBarbers.length * 290) + 90}px` : "100%"
              }}
            >
              {/* Cabeçalho das Colunas de Barbeiros */}
              <div className="flex border-b border-secondary bg-surface/90 sticky top-0 z-20 backdrop-blur-md">
                {/* Canto do Horário */}
                <div className="w-20 sm:w-24 shrink-0 p-4 border-r border-secondary/60 text-center font-display font-bold text-xs text-text-secondary uppercase tracking-wider flex items-center justify-center">
                  Horário
                </div>

                {/* Colunas dos Barbeiros */}
                <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${displayedBarbers.length}, minmax(0, 1fr))` }}>
                  {displayedBarbers.map((barber) => {
                    const barberAppts = localAppointments.filter(
                      a => a.barberId === barber.id || a.barberName === barber.name
                    );
                    const isOwnerRole = barber.role === "OWNER";

                    return (
                      <div
                        key={barber.id}
                        className="p-4 border-r last:border-r-0 border-secondary/60 flex items-center justify-between gap-3 bg-surface-hover/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-background border border-secondary flex items-center justify-center font-bold text-text-primary text-sm shadow-inner overflow-hidden">
                              {barber.avatar_url ? (
                                <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                              ) : (
                                barber.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {isOwnerRole && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow" title="Proprietário">
                                <Crown size={9} className="fill-slate-950" />
                              </div>
                            )}
                          </div>

                          {/* Nome e Indicadores */}
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm text-text-primary truncate">
                              {barber.name}
                            </h3>
                            <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Disponível
                            </span>
                          </div>
                        </div>

                        {/* Badge de Total de Cortes do Dia */}
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                            {barberAppts.length} {barberAppts.length === 1 ? "corte" : "cortes"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linhas de Horários do Dia */}
              <div className="divide-y divide-secondary/40">
                {hours.map((hour) => {
                  const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                  const halfHourStr = `${hour.toString().padStart(2, "0")}:30`;

                  return (
                    <div key={hour} className="flex min-h-[110px] group/row hover:bg-surface-hover/20 transition-colors">
                      {/* Coluna do Horário na Esquerda */}
                      <div className="w-20 sm:w-24 shrink-0 p-3 sm:p-4 border-r border-secondary/60 flex flex-col justify-between text-center select-none bg-surface/30">
                        <span className="font-display font-bold text-sm sm:text-base text-text-primary">
                          {hourStr}
                        </span>
                        <span className="text-[11px] font-medium text-text-secondary/40">
                          {halfHourStr}
                        </span>
                      </div>

                      {/* Colunas dos Barbeiros para esta Hora */}
                      <div
                        className="flex-1 grid"
                        style={{ gridTemplateColumns: `repeat(${displayedBarbers.length}, minmax(0, 1fr))` }}
                      >
                        {displayedBarbers.map((barber) => {
                          // Agendamentos deste barbeiro neste horário (hora cheia ou meia hora)
                          const barberHourAppts = localAppointments.filter((a) => {
                            const isMatchBarber = a.barberId === barber.id || a.barberName === barber.name;
                            const apptHour = parseInt(a.time.split(":")[0], 10);
                            return isMatchBarber && apptHour === hour;
                          });

                          return (
                            <div
                              key={barber.id}
                              className="p-2 sm:p-3 border-r last:border-r-0 border-secondary/40 flex flex-col gap-2 relative transition-all"
                            >
                              {/* Linha pontilhada de meia hora no fundo */}
                              <div className="absolute top-1/2 left-0 right-0 border-b border-secondary/15 border-dashed pointer-events-none" />

                              {barberHourAppts.length > 0 ? (
                                barberHourAppts.map((appt) => renderAppointmentCard(appt, true))
                              ) : (
                                <div className="h-full min-h-[85px] rounded-xl border border-transparent hover:border-secondary/30 hover:bg-secondary/10 transition-all flex items-center justify-center opacity-0 group-hover/row:opacity-100">
                                  <span className="text-[11px] text-text-secondary/40 font-medium">+ Livre</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODO 2: VISÃO CRONOLÓGICA (TIMELINE LINEAR TRADICIONAL)        */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "chronological" && (
          <div className="relative py-8 px-4 sm:px-8">
            {/* Linha Vertical Contínua */}
            <div className="absolute left-[72px] sm:left-[88px] top-8 bottom-8 w-[2px] bg-secondary/40 rounded-full" />

            <div className="space-y-2">
              {hours.map((hour) => {
                const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                const halfHourStr = `${hour.toString().padStart(2, "0")}:30`;

                const apptsOnHour = localAppointments.filter(
                  a => a.time === hourStr && (selectedBarberFilter === "all" || a.barberId === selectedBarberFilter || a.barberName === selectedBarberFilter)
                );
                const apptsOnHalf = localAppointments.filter(
                  a => a.time === halfHourStr && (selectedBarberFilter === "all" || a.barberId === selectedBarberFilter || a.barberName === selectedBarberFilter)
                );

                return (
                  <div key={hour} className="relative group">
                    {/* Slot Hora Cheia */}
                    <div className="flex min-h-[58px]">
                      <div className="w-14 sm:w-20 pr-4 sm:pr-6 text-right pt-2 font-display font-bold text-text-primary text-sm sm:text-base">
                        {hourStr}
                      </div>

                      <div className="flex-1 pl-6 sm:pl-8 relative border-t border-secondary/30 group-hover:bg-primary/[0.01] transition-colors pb-2">
                        {/* Ponto no eixo */}
                        <div className="absolute left-[-5px] top-[-5px] w-2.5 h-2.5 rounded-full bg-background border-2 border-primary shadow-[0_0_10px_rgba(139,92,246,0.6)] z-10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {apptsOnHour.map(appt => renderAppointmentCard(appt))}
                        </div>
                      </div>
                    </div>

                    {/* Slot Meia Hora */}
                    <div className="flex min-h-[48px]">
                      <div className="w-14 sm:w-20 pr-4 sm:pr-6 text-right pt-2 text-xs font-semibold text-text-secondary/50">
                        30
                      </div>

                      <div className="flex-1 pl-6 sm:pl-8 relative border-t border-secondary/20 border-dashed group-hover:bg-primary/[0.01] transition-colors pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {apptsOnHalf.map(appt => renderAppointmentCard(appt))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rodapé da Agenda com Contador de Total */}
        <div className="px-6 py-4 border-t border-secondary bg-surface-hover/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">Total:</span>
            <span>{totalCount} {totalCount === 1 ? "agendamento cadastrado" : "agendamentos cadastrados"} para esta data.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {displayedBarbers.length} {displayedBarbers.length === 1 ? "profissional ativo" : "profissionais ativos"}
            </span>
          </div>
        </div>
      </div>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}

