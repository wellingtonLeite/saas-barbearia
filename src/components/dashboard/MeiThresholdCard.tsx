"use client";

import { useEffect, useState } from "react";
import {
  getMeiThresholdAnalysis,
  MeiThresholdResponse,
} from "@/app/actions/mei-threshold";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function MeiThresholdCard() {
  const [data, setData] = useState<MeiThresholdResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await getMeiThresholdAnalysis();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-secondary p-6 rounded-2xl animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!data || !data.success || data.barbers.length === 0) {
    return null;
  }

  const criticalCount = data.barbers.filter(
    (b) => b.statusLevel === "CRITICO" || b.statusLevel === "ALERTA"
  ).length;

  return (
    <div className="bg-surface border border-secondary/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              criticalCount > 0
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {criticalCount > 0 ? (
              <AlertTriangle size={24} className="text-amber-400" />
            ) : (
              <ShieldCheck size={24} className="text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white">
                Monitor de Teto MEI dos Barbeiros Parceiros
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                Ano Fiscal {data.year}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Limite Anual Oficial da Receita Federal:{" "}
              <strong className="text-white">
                {formatCurrency(data.thresholdLimit)}
              </strong>{" "}
              (R$ 6.750,00/mês)
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="self-end sm:self-auto p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
          title="Atualizar dados fiscais"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Grid de Barbeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.barbers.map((b) => (
          <div
            key={b.barberId}
            className="p-4 rounded-xl border bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
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

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${b.statusBadge.color}`}
                >
                  {b.percentageUsed}% do Teto
                </span>
              </div>

              {/* Barra de Progresso do Teto MEI */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    b.statusLevel === "CRITICO"
                      ? "bg-red-500"
                      : b.statusLevel === "ALERTA"
                      ? "bg-orange-500"
                      : b.statusLevel === "ATENCAO"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${b.percentageUsed}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>
                  Acumulado YTD:{" "}
                  <strong className="text-white">
                    {formatCurrency(b.accumulatedYear)}
                  </strong>
                </span>
                <span>
                  Projeção Dez:{" "}
                  <strong
                    className={
                      b.willExceedLimit ? "text-amber-400 font-bold" : "text-slate-300"
                    }
                  >
                    {formatCurrency(b.projectedYearEnd)}
                  </strong>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 mt-1">
              {b.recommendation}
            </p>
          </div>
        ))}
      </div>

      {/* Nota de Governança Fiscal */}
      <div className="mt-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-400 flex items-start gap-2.5">
        <FileText size={16} className="text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Consultoria Tributária (Dra. Vanessa Rios):</strong> Os repasses da Lei
          Salão Parceiro (Lei 13.352/16) contam como faturamento bruto do profissional MEI.
          Acompanhar a projeção evita desenquadramento involuntário e preserva a conformidade jurídica da barbearia.
        </span>
      </div>
    </div>
  );
}
