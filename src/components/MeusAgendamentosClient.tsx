"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  Clock, 
  Scissors, 
  User, 
  MapPin, 
  Phone, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { searchClientAppointments, SerializedClientAppointment } from "@/app/actions/client-portal";
import { formatCurrency } from "@/lib/utils";

const STORAGE_KEY = "88barber_client_identifier";

export default function MeusAgendamentosClient() {
  const [identifier, setIdentifier] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [appointments, setAppointments] = useState<SerializedClientAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Carrega último identificador do localStorage na montagem
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        setIdentifier(saved);
        handleSearch(saved);
      }
    } catch (e) {
      console.warn("Could not read from localStorage", e);
    }
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const term = (searchQuery !== undefined ? searchQuery : identifier).trim();
    if (!term || term.length < 3) {
      setErrorMessage("Por favor, digite seu telefone (WhatsApp com DDD) ou e-mail.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const res = await searchClientAppointments(term);
      setHasSearched(true);
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
        try {
          localStorage.setItem(STORAGE_KEY, term);
        } catch (e) {
          // ignore
        }
      } else {
        setErrorMessage(res.error || "Não foi possível carregar os agendamentos.");
        setAppointments([]);
      }
    });
  };

  const handleClear = () => {
    setIdentifier("");
    setAppointments([]);
    setHasSearched(false);
    setErrorMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  // Separa agendamentos em Próximos e Passados
  const now = new Date();

  const upcomingAppointments = appointments.filter((appt) => {
    const isCancelled = appt.status === "CANCELLED";
    const isCompleted = appt.status === "COMPLETED";
    const apptDate = new Date(appt.start_time);
    
    // Se foi cancelado ou completado, vai para o histórico passado
    if (isCancelled || isCompleted) return false;
    
    // Se for PENDING, CONFIRMED ou IN_PROGRESS e não for muito antigo
    return true;
  });

  const pastAppointments = appointments.filter((appt) => {
    const isCancelled = appt.status === "CANCELLED";
    const isCompleted = appt.status === "COMPLETED";
    const apptDate = new Date(appt.start_time);

    return isCancelled || isCompleted || apptDate < now;
  });

  const getStatusBadge = (status: SerializedClientAppointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 size={13} /> Confirmado
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle size={13} /> Aguardando Confirmação
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse">
            <Clock size={13} /> Em Atendimento
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={13} /> Concluído
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle size={13} /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* HEADER DE BUSCA */}
      <section className="bg-gradient-to-b from-[#181a20] to-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20">
          <Calendar size={14} /> Histórico e Gestão de Horários
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
          Meus Agendamentos
        </h1>

        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Digite seu número de WhatsApp (com DDD) ou e-mail para acompanhar e gerenciar seus horários em qualquer barbearia da rede 88barber.
        </p>

        {/* INPUT DE BUSCA */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone size={18} className="text-primary" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ex: (11) 99999-9999 ou seu e-mail"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface border border-secondary text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm shadow-inner transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-primary/25 cursor-pointer shrink-0"
          >
            {isPending ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Buscando...
              </>
            ) : (
              <>
                <Search size={16} /> Consultar
              </>
            )}
          </button>
        </form>

        {identifier && hasSearched && (
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Consultando para: <strong className="text-white">{identifier}</strong></span>
            <button
              onClick={handleClear}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Trocar número / e-mail
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold max-w-md mx-auto">
            {errorMessage}
          </div>
        )}
      </section>

      {/* RESULTADOS DOS AGENDAMENTOS */}
      {hasSearched && (
        <section className="space-y-6">
          {/* TABS SELECTOR */}
          <div className="flex items-center justify-center gap-2 border-b border-secondary pb-4">
            <button
              onClick={() => setActiveTab("UPCOMING")}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "UPCOMING"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface text-slate-400 hover:text-white border border-secondary"
              }`}
            >
              <Calendar size={16} />
              <span>Próximos Agendamentos</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/10 font-mono">
                {upcomingAppointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("PAST")}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "PAST"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface text-slate-400 hover:text-white border border-secondary"
              }`}
            >
              <Clock size={16} />
              <span>Histórico Passado</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/10 font-mono">
                {pastAppointments.length}
              </span>
            </button>
          </div>

          {/* LISTA DE AGENDAMENTOS DA ABA SELECIONADA */}
          {activeTab === "UPCOMING" ? (
            upcomingAppointments.length === 0 ? (
              <div className="bg-surface border border-secondary rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <Calendar size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Nenhum agendamento futuro ativo</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Você não tem nenhum corte ou atendimento agendado para os próximos dias com este telefone/e-mail.
                </p>
                <Link
                  href="/explorar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-primary/20"
                >
                  <Scissors size={16} /> Encontrar uma Barbearia e Agendar
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map((appt) => {
                  const startDate = new Date(appt.start_time);
                  const dateStr = startDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });
                  const timeStr = startDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={appt.id}
                      className="bg-surface hover:bg-[#1f232c] border border-secondary hover:border-primary/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl"
                    >
                      <div className="space-y-4">
                        {/* HEADER DO CARD */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {appt.tenant.logo_url ? (
                              <img
                                src={appt.tenant.logo_url}
                                alt={appt.tenant.name}
                                className="w-12 h-12 rounded-xl object-cover border border-secondary"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                                <Scissors size={20} />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-white text-base">{appt.tenant.name}</h3>
                              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-primary" />
                                {appt.unit?.name || "Unidade Principal"}
                              </span>
                            </div>
                          </div>

                          {getStatusBadge(appt.status)}
                        </div>

                        {/* DETALHES DO SERVIÇO & HORÁRIO */}
                        <div className="bg-background/80 border border-secondary/60 rounded-2xl p-4 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-secondary/40 pb-2">
                            <span className="text-slate-400 flex items-center gap-2">
                              <Scissors size={14} className="text-primary" /> Serviço:
                            </span>
                            <span className="font-bold text-white text-sm">
                              {appt.service.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-secondary/40 pb-2">
                            <span className="text-slate-400 flex items-center gap-2">
                              <User size={14} className="text-primary" /> Barbeiro:
                            </span>
                            <span className="font-semibold text-white">
                              {appt.barber.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-secondary/40 pb-2">
                            <span className="text-slate-400 flex items-center gap-2">
                              <Calendar size={14} className="text-primary" /> Data & Hora:
                            </span>
                            <span className="font-bold text-primary capitalize">
                              {dateStr} às {timeStr}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-400">Valor Total:</span>
                            <span className="font-bold text-white text-sm">
                              {formatCurrency(appt.service.price)}
                            </span>
                          </div>
                        </div>

                        {appt.unit?.address && (
                          <div className="text-xs text-slate-400 flex items-start gap-1.5 px-1">
                            <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                            <span>{appt.unit.address}</span>
                          </div>
                        )}
                      </div>

                      {/* AÇÕES DO CARD */}
                      <div className="pt-2">
                        <Link
                          href={`/agendamento/${appt.id}`}
                          className="w-full py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Ver Detalhes / Gerenciar Cancelamento</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            pastAppointments.length === 0 ? (
              <div className="bg-surface border border-secondary rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Nenhum histórico anterior</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Você ainda não possui atendimentos finalizados ou cancelados no sistema.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastAppointments.map((appt) => {
                  const startDate = new Date(appt.start_time);
                  const dateStr = startDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const timeStr = startDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isCompleted = appt.status === "COMPLETED";

                  return (
                    <div
                      key={appt.id}
                      className="bg-surface border border-secondary rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-white text-base">{appt.tenant.name}</h3>
                            <span className="text-xs text-slate-400">
                              {dateStr} às {timeStr}
                            </span>
                          </div>
                          {getStatusBadge(appt.status)}
                        </div>

                        <div className="bg-background/50 border border-secondary/50 rounded-2xl p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Serviço:</span>
                            <span className="font-bold text-white">{appt.service.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Profissional:</span>
                            <span className="font-medium text-slate-200">{appt.barber.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Valor pago:</span>
                            <span className="font-bold text-slate-200">{formatCurrency(appt.service.price)}</span>
                          </div>
                        </div>

                        {/* STATUS DE AVALIAÇÃO */}
                        {appt.review && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                            <Star size={14} className="fill-amber-400" />
                            <span>Você avaliou com <strong>{appt.review.rating} estrelas</strong></span>
                          </div>
                        )}
                      </div>

                      {/* BOTÕES DE AÇÃO */}
                      <div className="space-y-2 pt-2">
                        {isCompleted && !appt.review && (
                          <Link
                            href={`/avaliar/${appt.id}`}
                            className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                          >
                            <Star size={14} /> Avaliar Atendimento
                          </Link>
                        )}

                        <div className="flex gap-2">
                          <Link
                            href={`/agendamento/${appt.id}`}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            Ver Resumo
                          </Link>
                          <Link
                            href={`/${appt.tenant.slug}/agendar`}
                            className="flex-1 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            Agendar de Novo
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>
      )}

      {/* BANNER INFORMATIVO PARA NOVOS CLIENTES */}
      {!hasSearched && (
        <section className="bg-surface border border-secondary rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-primary/20">
            <Scissors size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-white">
              Ainda não tem agendamentos?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Explore o catálogo completo de barbearias parceiras 88barber, veja fotos, avaliações e agende seu próximo corte em poucos cliques.
            </p>
          </div>

          <div>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-base transition-all shadow-xl shadow-primary/30 hover:scale-105"
            >
              <CompassIcon /> Encontrar Barbearias Parceiras
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function CompassIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  );
}
