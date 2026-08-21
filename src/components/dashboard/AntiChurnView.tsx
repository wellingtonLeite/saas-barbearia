"use client";

import { useState, useEffect } from "react";
import {
  getAntiChurnClients,
  sendAntiChurnWhatsApp,
  AntiChurnSummaryResponse,
  AntiChurnClient,
} from "@/app/actions/anti-churn";
import {
  UserX,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Send,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function AntiChurnView() {
  const [data, setData] = useState<AntiChurnSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getAntiChurnClients();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendMessage = async (client: AntiChurnClient) => {
    setSendingId(client.clientId);
    const res = await sendAntiChurnWhatsApp(
      client.clientId,
      client.clientPhone,
      client.customMessage
    );
    setSendingId(null);

    if (res.success) {
      setSentMap((prev) => ({ ...prev, [client.clientId]: true }));
      setToastMessage(
        `💬 Mensagem de resgate enviada com sucesso para ${client.clientName} via SDR WhatsApp!`
      );
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-secondary p-8 rounded-2xl animate-pulse space-y-4">
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-800 rounded"></div>
          <div className="h-24 bg-slate-800 rounded"></div>
          <div className="h-24 bg-slate-800 rounded"></div>
          <div className="h-24 bg-slate-800 rounded"></div>
        </div>
        <div className="h-64 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="bg-surface border border-secondary p-8 rounded-2xl text-center">
        <p className="text-text-secondary">
          Não foi possível calcular o motor de retenção anti-churn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <Sparkles className="shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <UserX className="text-primary" />
            Motor de Retenção Anti-Churn com SDR WhatsApp
          </h2>
          <p className="text-sm text-text-secondary">
            Identificação de clientes atrasados no ciclo de corte e disparo de resgate humanizado.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50 self-end sm:self-auto"
          title="Recalcular ciclos"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <span className="text-xs text-text-secondary font-medium">Clientes em Risco</span>
          <p className="text-2xl font-display font-bold text-amber-400 mt-1">
            {data.totalAtRisk} clientes
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ciclo de retorno expirado
          </span>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <span className="text-xs text-text-secondary font-medium">Receita em Risco</span>
          <p className="text-2xl font-display font-bold text-red-400 mt-1">
            {formatCurrency(data.estimatedRevenueAtRisk)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ticket médio estimado
          </span>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <span className="text-xs text-text-secondary font-medium">Clientes Recuperados</span>
          <p className="text-2xl font-display font-bold text-emerald-400 mt-1">
            {data.totalRecoveredMonth} este mês
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <ShieldCheck size={12} /> Agendamento fechado
          </span>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-800/40 p-5 rounded-xl">
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
            Receita Resgatada
          </span>
          <p className="text-2xl font-display font-bold text-emerald-400 mt-1">
            +{formatCurrency(data.rescuedRevenueMonth)}
          </p>
          <span className="text-[11px] text-slate-300 mt-1 block">
            Retorno direto do SDR
          </span>
        </div>
      </div>

      {/* Tabela de Clientes em Risco */}
      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-secondary flex justify-between items-center bg-slate-900/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            Clientes com Ciclo Expirado sem Agendamento Futuro ({data.clients.length})
          </h3>
        </div>

        {data.clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3 opacity-80" />
            <p className="text-base font-semibold text-white">Nenhum cliente em risco no momento!</p>
            <p className="text-xs text-slate-400 mt-1">
              Todos os clientes frequentes estão com agendamentos em dia ou dentro da janela normal de corte.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {data.clients.map((client) => {
              const isSent = sentMap[client.clientId];
              const isSending = sendingId === client.clientId;

              return (
                <div
                  key={client.clientId}
                  className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-white">
                        {client.clientName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          client.riskLevel === "CRITICO"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {client.riskLevel === "CRITICO" ? "🔴 Risco Crítico" : "🟡 Atraso Moderado"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Ciclo Habitual: <strong>{client.averageCycleDays} dias</strong> | Sem vir há:{" "}
                      <strong className="text-amber-400">{client.daysSinceLastVisit} dias</strong> | Última visita:{" "}
                      {client.lastVisitDate} | Barbeiro preferido:{" "}
                      <strong className="text-white">{client.preferredBarberName}</strong>
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 max-w-2xl mt-1">
                      <span className="text-primary font-semibold">Mensagem do SDR WhatsApp: </span>
                      &ldquo;{client.customMessage}&rdquo;
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSendMessage(client)}
                      disabled={isSending || isSent}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                        isSent
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                          : "bg-gradient-to-r from-primary to-amber-500 text-white hover:opacity-90 shadow-primary/20"
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          Mensagem Enviada
                        </>
                      ) : isSending ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Disparar Resgate SDR
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
