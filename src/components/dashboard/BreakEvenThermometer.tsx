"use client";

import { useEffect, useState } from "react";
import { 
  getBreakEvenAnalysis, 
  updateMonthlyFixedCost, 
  BreakEvenResponse 
} from "@/app/actions/break-even";
import { 
  CheckCircle2, 
  RefreshCw, 
  Scissors, 
  ChevronDown, 
  ChevronUp, 
  Settings2, 
  X, 
  DollarSign, 
  Target, 
  Sparkles 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BreakEvenThermometer() {
  const [data, setData] = useState<BreakEvenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fixedCostInput, setFixedCostInput] = useState("");
  const [savingCost, setSavingCost] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await getBreakEvenAnalysis();
    setData(res);
    if (res?.totalFixedExpenses) {
      setFixedCostInput(res.totalFixedExpenses.toString());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    if (data?.totalFixedExpenses) {
      setFixedCostInput(data.totalFixedExpenses.toString());
    }
    setIsModalOpen(true);
  };

  const handleSaveFixedCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(fixedCostInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      return;
    }

    setSavingCost(true);
    const res = await updateMonthlyFixedCost(parsed);
    setSavingCost(false);

    if (res.success) {
      setIsModalOpen(false);
      setToastMessage("Custo fixo mensal atualizado!");
      setTimeout(() => setToastMessage(null), 3000);
      await fetchData();
    } else {
      alert(res.error || "Erro ao salvar custo fixo.");
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-surface border border-secondary/70 p-5 rounded-2xl animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-secondary/60 rounded w-1/4"></div>
          <div className="h-5 bg-secondary/60 rounded w-24"></div>
        </div>
        <div className="h-3 bg-secondary/40 rounded-full w-full"></div>
        <div className="h-4 bg-secondary/30 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data || !data.success) {
    return null;
  }

  const isProfitable = data.tenantIsProfitable;
  const progressPercent = Math.min(100, Math.max(0, data.tenantProgressPercent));
  const remainingCuts = Math.max(0, data.tenantTargetCount - data.tenantCurrentCount);

  return (
    <div className="bg-surface border border-secondary/70 rounded-2xl p-5 shadow-sm relative transition-all">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-30 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fade-in shadow-lg">
          <CheckCircle2 size={14} />
          {toastMessage}
        </div>
      )}

      {/* Header Executivo & Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isProfitable 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-primary/10 border-primary/20 text-primary"
          }`}>
            <Target size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Ponto de Equilíbrio (Break-Even)
              </h2>
              {isProfitable ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Lucro Ativado
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary/80 text-text-secondary border border-secondary">
                  Meta em andamento
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Custo Fixo: <strong className="text-text-primary">{formatCurrency(data.totalFixedExpenses)}</strong>
              <span className="mx-1.5 text-secondary">•</span>
              Por Cadeira: <strong className="text-text-primary">{formatCurrency(data.fixedCostPerChair)}</strong>
            </p>
          </div>
        </div>

        {/* Ações de Topo */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-white bg-background hover:bg-surface-hover border border-secondary rounded-xl transition-all shadow-sm"
            title="Ajustar Custo Fixo Mensal"
          >
            <Settings2 size={14} className="text-primary" />
            <span>Ajustar Custo Fixo</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 text-text-secondary hover:text-white hover:bg-surface-hover border border-secondary rounded-xl transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Bloco de Progresso Limpo */}
      <div className="bg-background/60 border border-secondary/60 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-end">
          <div className="text-xs text-text-secondary">
            Meta: <strong className="text-white">{data.tenantTargetCount} cortes</strong>
            <span className="mx-1 text-secondary">•</span>
            Realizados: <strong className="text-primary font-bold">{data.tenantCurrentCount}</strong>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${isProfitable ? "text-emerald-400" : "text-primary"}`}>
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Barra de Progresso Fina */}
        <div className="w-full bg-secondary/50 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isProfitable
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                : "bg-gradient-to-r from-primary/80 to-primary"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Feedback visual sutil */}
        <div className="text-xs text-text-secondary flex items-center justify-between">
          {isProfitable ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <Sparkles size={13} /> Ponto de equilíbrio superado! A barbearia está gerando lucro líquido real.
            </span>
          ) : (
            <span>
              Faltam <strong className="text-white">{remainingCuts} cortes</strong> para cobrir 100% dos custos fixos do mês.
            </span>
          )}
          <span className="text-[11px] text-text-secondary/70 hidden sm:inline">
            {data.activeChairsCount} {data.activeChairsCount === 1 ? "cadeira ativa" : "cadeiras ativas"}
          </span>
        </div>
      </div>

      {/* Gaveta Retrátil de Detalhamento por Barbeiro */}
      {data.barbers && data.barbers.length > 0 && (
        <div className="mt-3 pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-text-secondary hover:text-text-primary py-2 px-3 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <span className="flex items-center gap-2">
              <Scissors size={14} className="text-primary" />
              Detalhamento por barbeiro ({data.barbers.length})
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-normal text-text-secondary">
                {showDetails ? "Recolher" : "Expandir"}
              </span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 pt-2 border-t border-secondary/40 animate-fade-in">
              {data.barbers.map((b) => (
                <div
                  key={b.barberId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    b.isProfitable
                      ? "bg-emerald-950/15 border-emerald-800/30"
                      : "bg-background/80 border-secondary/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {b.avatarUrl ? (
                        <img
                          src={b.avatarUrl}
                          alt={b.barberName}
                          className="w-7 h-7 rounded-full object-cover border border-secondary shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-secondary text-text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                          {b.barberName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-bold text-white truncate">
                        {b.barberName}
                      </span>
                    </div>

                    {b.isProfitable ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                        Meta Batida
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-text-secondary shrink-0">
                        {b.progressPercent}%
                      </span>
                    )}
                  </div>

                  {/* Barra do Barbeiro */}
                  <div className="w-full bg-secondary/50 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isProfitable ? "bg-emerald-400" : "bg-primary"
                      }`}
                      style={{ width: `${b.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-text-secondary">
                    <span>
                      Atendimentos: <strong className="text-white">{b.currentCount}</strong>/{b.targetCount}
                    </span>
                    <span>
                      Margem: {formatCurrency(b.marginPerService)}
                    </span>
                  </div>

                  {b.isProfitable ? (
                    <p className="text-[10px] text-emerald-400 font-medium mt-1 truncate">
                      Lucro gerado: +{formatCurrency(b.netProfitGenerated)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-text-secondary mt-1 truncate">
                      Faltam {b.remainingAppointments} atendimentos para cobrir cadeira
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Interativo de Ajuste de Custo Fixo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-secondary rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-slide-up relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ajustar Custo Fixo Mensal</h3>
                  <p className="text-xs text-text-secondary">Despesas operacionais base da barbearia</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFixedCost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Custo Fixo Total do Mês (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={fixedCostInput}
                    onChange={(e) => setFixedCostInput(e.target.value)}
                    placeholder="Ex: 4500.00"
                    className="w-full bg-background border border-secondary rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-base focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                  Inclua aluguel, luz, água, internet, softwares e despesas fixas. O sistema divide esse valor igualmente entre as cadeiras ativas para calcular quantos cortes cada barbeiro precisa fazer para atingir o Ponto de Equilíbrio.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-secondary/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCost}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {savingCost ? "Salvando..." : "Salvar Custo Fixo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
