"use client";

import { useState, useEffect } from "react";
import {
  getCashFlowProjection,
  CashFlowProjectionResponse,
} from "@/app/actions/cash-flow-projection";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function CashFlowProjectionView() {
  const [data, setData] = useState<CashFlowProjectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<"days30" | "days60" | "days90">("days30");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProjection = async () => {
    setLoading(true);
    const res = await getCashFlowProjection();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjection();
  }, []);

  const triggerVipCampaign = () => {
    setToastMessage("🚀 Campanha Relâmpago VIP enviada para fila de automação do SDR WhatsApp!");
    setTimeout(() => setToastMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-secondary p-8 rounded-2xl animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
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
          Não foi possível carregar a projeção de fluxo de caixa.
        </p>
      </div>
    );
  }

  const periodData = data.periods[activePeriod];
  const points = periodData.points;
  const maxBalance = Math.max(...points.map((p) => p.projectedBalance), 1000);
  const minBalance = Math.min(...points.map((p) => p.projectedBalance), 0);
  const isHealthy = periodData.endBalance >= 0;

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <Sparkles className="shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Fluxo de Caixa Projetado Dinâmico
          </h2>
          <p className="text-sm text-text-secondary">
            Antecipação algorítmica de saldo futuro, contas a pagar e receitas recorrentes VIP.
          </p>
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActivePeriod("days30")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePeriod === "days30"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setActivePeriod("days60")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePeriod === "days60"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            60 Dias
          </button>
          <button
            onClick={() => setActivePeriod("days90")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePeriod === "days90"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            90 Dias
          </button>
          <button
            onClick={fetchProjection}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Recalcular"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">Saldo Atual de Partida</span>
            <DollarSign size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(data.currentBalance)}
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <ShieldCheck size={12} /> Caixa Consolidado
          </span>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">Entradas Projetadas</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold text-emerald-400">
            +{formatCurrency(periodData.totalInflow)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Inclui VIP ({formatCurrency(data.vipSubscriptionsMonthly)}/mês)
          </span>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">Saídas Projetadas</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-display font-bold text-red-400">
            -{formatCurrency(periodData.totalOutflow)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Boletos + Comissões previstas
          </span>
        </div>

        <div
          className={`p-5 rounded-xl border transition-all ${
            isHealthy
              ? "bg-emerald-950/20 border-emerald-800/40"
              : "bg-red-950/20 border-red-800/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium">
              Saldo Projetado ({activePeriod.replace("days", "")}d)
            </span>
            <Calendar size={16} className={isHealthy ? "text-emerald-400" : "text-red-400"} />
          </div>
          <p
            className={`text-2xl font-display font-bold ${
              isHealthy ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(periodData.endBalance)}
          </p>
          <span className="text-[11px] text-slate-300 mt-1 block">
            {isHealthy ? "✅ Projeção Positiva" : "⚠️ Risco de Déficit de Caixa"}
          </span>
        </div>
      </div>

      {/* Alertas Prescritivos se houver risco */}
      {data.alerts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/40 p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold mb-3 text-sm">
            <AlertTriangle size={18} />
            Alertas de Quebra de Caixa e Ações Prescritivas Detectadas:
          </div>
          <div className="space-y-3">
            {data.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {alert.date}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    Projeção de saldo negativo de -{formatCurrency(alert.projectedDeficit)}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.reason}</p>
                </div>

                <button
                  onClick={triggerVipCampaign}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-primary text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-95 shadow-md shadow-amber-500/20 shrink-0"
                >
                  <Zap size={14} />
                  Ativar Campanha VIP Antecipada
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico Visual de Projeção Temporal */}
      <div className="bg-surface border border-secondary p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Curva de Saldo Acumulado Projetado ({activePeriod.replace("days", "")} Dias)
          </h3>
          <span className="text-xs text-slate-400">
            Escala diária ponderada
          </span>
        </div>

        {/* Visualizador de Barras / Linha Dinâmica */}
        <div className="h-48 flex items-end gap-1 sm:gap-1.5 pt-8 pb-2 px-2 bg-slate-950/60 rounded-xl border border-slate-900 overflow-x-auto">
          {points.map((p, idx) => {
            // normalizar altura entre 10% e 95%
            const heightPercent = Math.max(
              12,
              Math.min(95, Math.round(((p.projectedBalance - minBalance) / (maxBalance - minBalance + 1)) * 100))
            );

            return (
              <div
                key={idx}
                className="flex-1 min-w-[14px] flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 text-white text-[11px] p-2.5 rounded-lg shadow-2xl whitespace-nowrap">
                    <p className="font-bold text-primary">{p.dayLabel}</p>
                    <p className="text-slate-300">
                      Saldo: <strong className={p.isNegative ? "text-red-400" : "text-emerald-400"}>{formatCurrency(p.projectedBalance)}</strong>
                    </p>
                    <p className="text-xs text-slate-400">
                      Entrada: +{formatCurrency(p.projectedInflow)} | Saída: -{formatCurrency(p.projectedOutflow)}
                    </p>
                    {p.notes.length > 0 && (
                      <p className="text-[10px] text-amber-400 mt-1 max-w-[200px] truncate">
                        {p.notes[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Barra */}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    p.isNegative
                      ? "bg-red-500/80 group-hover:bg-red-400"
                      : "bg-emerald-500/70 group-hover:bg-emerald-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 mt-3 px-2">
          <span>Hoje</span>
          <span>{points[Math.floor(points.length / 2)]?.dayLabel}</span>
          <span>+{activePeriod.replace("days", "")} Dias</span>
        </div>
      </div>
    </div>
  );
}
