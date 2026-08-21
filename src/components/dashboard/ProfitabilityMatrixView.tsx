"use client";

import { useEffect, useState } from "react";
import {
  getProfitabilityMatrix,
  ProfitabilityMatrixResponse,
  BCGClassification,
} from "@/app/actions/profitability-matrix";
import {
  Clock,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Scissors,
  CheckCircle2,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ProfitabilityMatrixView() {
  const [data, setData] = useState<ProfitabilityMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | BCGClassification>("ALL");

  const loadData = async () => {
    setLoading(true);
    const res = await getProfitabilityMatrix();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-secondary p-8 rounded-2xl animate-pulse space-y-4">
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-800 rounded"></div>
          <div className="h-24 bg-slate-800 rounded"></div>
          <div className="h-24 bg-slate-800 rounded"></div>
        </div>
        <div className="h-64 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!data || !data.success || data.services.length === 0) {
    return (
      <div className="bg-surface border border-secondary p-8 rounded-2xl text-center">
        <p className="text-text-secondary">
          Nenhum serviço disponível para análise de rentabilidade.
        </p>
      </div>
    );
  }

  const filteredServices =
    filter === "ALL"
      ? data.services
      : data.services.filter((s) => s.classification === filter);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Clock className="text-primary" />
            Matriz de Rentabilidade & Lucro por Hora (BCG)
          </h2>
          <p className="text-sm text-text-secondary">
            Eficiência financeira real por minuto de cadeira ocupada na barbearia.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({data.services.length})
          </button>
          <button
            onClick={() => setFilter("ESTRELA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "ESTRELA"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            🌟 Estrelas
          </button>
          <button
            onClick={() => setFilter("VACA_LEITEIRA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "VACA_LEITEIRA"
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                : "text-slate-400 hover:text-blue-400"
            }`}
          >
            🐮 Vacas Leiteiras
          </button>
          <button
            onClick={() => setFilter("INTERROGACAO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "INTERROGACAO"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                : "text-slate-400 hover:text-amber-400"
            }`}
          >
            ❓ Interrogações
          </button>
          <button
            onClick={() => setFilter("ABACAXI")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "ABACAXI"
                ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                : "text-slate-400 hover:text-red-400"
            }`}
          >
            🍍 Abacaxis
          </button>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Recarregar"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Resumo de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-secondary">
          <span className="text-xs text-text-secondary font-medium">
            Lucro Médio Geral por Hora de Cadeira
          </span>
          <p className="text-2xl font-display font-bold text-white mt-1">
            {formatCurrency(data.overallAvgProfitPerHour)}
            <span className="text-xs text-slate-400 font-normal"> / hora</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Base para benchmarking interno
          </span>
        </div>

        {data.mostProfitableService && (
          <div className="bg-emerald-950/20 border border-emerald-800/40 p-5 rounded-xl">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              🏆 Campeão em Lucro/Hora
            </span>
            <p className="text-xl font-display font-bold text-white mt-1 truncate">
              {data.mostProfitableService.name}
            </p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {formatCurrency(data.mostProfitableService.profitPerHour)} / hora
              <span className="text-xs text-slate-400 font-normal ml-2">
                ({data.mostProfitableService.durationMinutes} min)
              </span>
            </p>
          </div>
        )}

        {data.leastProfitableService && (
          <div className="bg-red-950/20 border border-red-800/40 p-5 rounded-xl">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
              ⚠️ Menor Retorno por Hora
            </span>
            <p className="text-xl font-display font-bold text-white mt-1 truncate">
              {data.leastProfitableService.name}
            </p>
            <p className="text-sm font-bold text-red-400 mt-0.5">
              {formatCurrency(data.leastProfitableService.profitPerHour)} / hora
              <span className="text-xs text-slate-400 font-normal ml-2">
                ({data.leastProfitableService.durationMinutes} min)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Grid de Serviços Analisados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-surface border border-secondary p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scissors size={16} className="text-primary" />
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preço: <strong className="text-white">{formatCurrency(service.price)}</strong> | Duração:{" "}
                    <strong className="text-white">{service.durationMinutes} min</strong> | Atendimentos:{" "}
                    <strong>{service.completedCount}</strong>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${service.badgeColor}`}
                >
                  {service.classification === "ESTRELA" && "🌟 Estrela"}
                  {service.classification === "VACA_LEITEIRA" && "🐮 Vaca Leiteira"}
                  {service.classification === "INTERROGACAO" && "❓ Interrogação"}
                  {service.classification === "ABACAXI" && "🍍 Abacaxi"}
                </span>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-3">
                <div>
                  <span className="text-[11px] text-slate-400">Lucro Retido Salão:</span>
                  <p className="text-sm font-bold text-white">{formatCurrency(service.netMargin)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Rendimento por Hora:</span>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(service.profitPerHour)} / h
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendação da IA / FP&A */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-300 flex items-start gap-2">
              <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
              <span>{service.recommendation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
