"use client";

import { useEffect, useState } from "react";
import { getBreakEvenAnalysis, BreakEvenResponse } from "@/app/actions/break-even";
import { Flame, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, Scissors, UserCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BreakEvenThermometer() {
  const [data, setData] = useState<BreakEvenResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await getBreakEvenAnalysis();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-secondary p-6 rounded-2xl animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-slate-800 rounded"></div>
          <div className="h-20 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return null;
  }

  const isProfitable = data.tenantIsProfitable;

  return (
    <div className="bg-surface border border-secondary/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background glow highlight */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none ${
          isProfitable ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isProfitable
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            <Flame size={24} className={isProfitable ? "animate-pulse" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-text-primary">
                Termômetro de Ponto de Equilíbrio (Break-Even)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                Tempo Real
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Custo Fixo por Cadeira:{" "}
              <strong className="text-white">
                {formatCurrency(data.fixedCostPerChair)}
              </strong>{" "}
              | Meta Geral:{" "}
              <strong className="text-white">
                {data.tenantTargetCount} cortes
              </strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="self-end sm:self-auto p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
          title="Atualizar análise"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Barra Geral da Barbearia */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Progresso Geral da Barbearia
          </span>
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                isProfitable ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {data.tenantProgressPercent}%
            </span>
            <span className="text-xs text-slate-400 ml-2">
              ({data.tenantCurrentCount} / {data.tenantTargetCount} cortes)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isProfitable
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30"
                : "bg-gradient-to-r from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30"
            }`}
            style={{ width: `${data.tenantProgressPercent}%` }}
          />
        </div>

        <div className="mt-3 text-xs flex items-center justify-between text-slate-400">
          {isProfitable ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} /> Ponto de Equilíbrio atingido! A barbearia está gerando Lucro Líquido Real.
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} /> Faltam{" "}
              <strong>
                {Math.max(0, data.tenantTargetCount - data.tenantCurrentCount)}
              </strong>{" "}
              cortes para cobrir 100% dos custos fixos do mês.
            </span>
          )}
          <span className="text-slate-500 hidden sm:inline">
            Despesa Fixa Base: {formatCurrency(data.totalFixedExpenses)}
          </span>
        </div>
      </div>

      {/* Grid individual por Cadeira / Barbeiro */}
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <Scissors size={15} className="text-slate-400" />
        Desempenho Individual por Cadeira & Profissional:
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.barbers.map((b) => (
          <div
            key={b.barberId}
            className={`p-4 rounded-xl border transition-all ${
              b.isProfitable
                ? "bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-700"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {b.avatarUrl ? (
                  <img
                    src={b.avatarUrl}
                    alt={b.barberName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {b.barberName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-bold text-white truncate">
                  {b.barberName}
                </span>
              </div>

              {b.isProfitable ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Lucro Ativado 🚀
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  {b.progressPercent}%
                </span>
              )}
            </div>

            {/* Barra do Barbeiro */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  b.isProfitable ? "bg-emerald-400" : "bg-amber-400"
                }`}
                style={{ width: `${b.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>
                Atendimentos: <strong className="text-white">{b.currentCount}</strong> / {b.targetCount}
              </span>
              <span>
                Margem Retida: <strong className="text-slate-300">{formatCurrency(b.marginPerService)}</strong>
              </span>
            </div>

            {b.isProfitable ? (
              <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
                Lucro extra gerado: <strong>+{formatCurrency(b.netProfitGenerated)}</strong>
                {b.profitableAt && ` (Virou no dia ${b.profitableAt})`}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Faltam <strong>{b.remainingAppointments} atendimentos</strong> para cobrir sua cadeira ({formatCurrency(b.fixedCostShare)}).
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
