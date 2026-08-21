"use client";

import { useState } from "react";
import { Users, UserX, Phone, Calendar, History, Scissors, Search, Sparkles } from "lucide-react";
import { AntiChurnView } from "./AntiChurnView";

export type ClientData = {
  id: string;
  name: string;
  phone: string | null;
  appointmentsCount: number;
  lastAppointment?: {
    dateFormatted: string;
    serviceName: string;
  } | null;
};

type Props = {
  clients: ClientData[];
  isOwner: boolean;
  initialTab?: "carteira" | "antichurn";
};

export function ClientesTabsView({ clients, isOwner, initialTab = "carteira" }: Props) {
  const [activeTab, setActiveTab] = useState<"carteira" | "antichurn">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(term);
    const phoneMatch = c.phone ? c.phone.includes(term) : false;
    return nameMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header com Navegação de Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/60 pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <span className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Users size={26} />
            </span>
            Gestão de Clientes & Retenção
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {isOwner
              ? "Base completa de clientes, histórico de cortes e motor de retenção anti-churn."
              : "Seus clientes atendidos e histórico de serviços."}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("carteira")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "carteira"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Users size={15} />
            <span>Carteira ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("antichurn")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "antichurn"
                ? "bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <UserX size={15} />
            <span>Anti-Churn & SDR</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba 1: Carteira de Clientes */}
      {activeTab === "carteira" && (
        <div className="space-y-6">
          {/* Barra de Filtro / Busca Rápida */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-surface p-4 rounded-2xl border border-secondary">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="text-xs text-text-secondary flex items-center gap-2 self-end sm:self-auto font-medium">
              <span>Exibindo:</span>
              <span className="font-bold text-primary">{filteredClients.length}</span>
              <span>de {clients.length} clientes</span>
            </div>
          </div>

          {/* Grid de Cards de Clientes */}
          {filteredClients.length === 0 ? (
            <div className="bg-surface border border-secondary rounded-2xl p-12 text-center shadow-xl">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Users size={28} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                {searchTerm
                  ? "Tente buscar por outro termo ou limpe o filtro de pesquisa."
                  : "Assim que os clientes realizarem agendamentos, eles aparecerão aqui com histórico completo."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map((client) => {
                const hasPhone = !!client.phone;
                const cleanPhone = client.phone?.replace(/\D/g, "");

                return (
                  <div
                    key={client.id}
                    className="bg-surface border border-secondary/80 rounded-2xl p-5 shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold text-lg uppercase shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-text-primary text-base truncate">
                            {client.name}
                          </h3>
                          {hasPhone ? (
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Phone size={12} className="text-emerald-400 shrink-0" />
                              <span>{client.phone}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-0.5">Sem telefone</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                          <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                            <History size={14} className="text-slate-400" /> Frequência:
                          </span>
                          <span className="font-bold text-text-primary">
                            {client.appointmentsCount}{" "}
                            {client.appointmentsCount === 1 ? "atendimento" : "atendimentos"}
                          </span>
                        </div>

                        {client.lastAppointment && (
                          <div className="pt-2 border-t border-secondary/50">
                            <span className="text-[11px] text-text-secondary uppercase font-bold tracking-wider">
                              Último Corte
                            </span>
                            <div className="flex items-start gap-2 mt-1">
                              <Calendar size={14} className="text-primary mt-0.5 shrink-0" />
                              <div className="text-xs">
                                <p className="font-semibold text-text-primary">
                                  {client.lastAppointment.dateFormatted}
                                </p>
                                <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Scissors size={11} />
                                  <span>{client.lastAppointment.serviceName}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {hasPhone && (
                      <div className="mt-4 pt-3 border-t border-secondary/40">
                        <a
                          href={`https://wa.me/55${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/25 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Phone size={14} /> Chamar no WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Motor Anti-Churn & Retenção SDR */}
      {activeTab === "antichurn" && (
        <div className="animate-fade-in">
          <AntiChurnView />
        </div>
      )}
    </div>
  );
}
