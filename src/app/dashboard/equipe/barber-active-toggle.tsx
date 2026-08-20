"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleBarberActive } from "@/app/actions/team";
import { Loader2, Scissors, ShieldAlert, AlertTriangle, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function BarberActiveToggle({
  barberId,
  unitId,
  initialActive,
  isOwner
}: {
  barberId: string;
  unitId: string;
  initialActive: boolean;
  isOwner?: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar caso o initialActive mude do servidor
  useEffect(() => {
    setIsActive(initialActive);
  }, [initialActive]);

  // Auto-fechar notificação após 8 segundos
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await toggleBarberActive(barberId, unitId, nextState);
      if (res?.error) {
        setIsActive(!nextState); // Reverter em caso de erro
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-secondary/30 px-3 py-1.5 rounded-xl border border-secondary/50">
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
            {isActive ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Scissors size={12} /> Atende na Agenda & SDR
              </span>
            ) : (
              <span className="text-text-secondary flex items-center gap-1">
                {isOwner ? <ShieldAlert size={12} className="text-amber-400" /> : null} 
                {isOwner ? "Apenas Administrador" : "Inativo na Agenda"}
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={isPending}
          onClick={handleToggle}
          title={isActive ? "Desativar atendimento" : "Ativar atendimento"}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
            isActive ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isActive ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {isPending && <Loader2 size={10} className="animate-spin text-slate-800" />}
          </span>
        </button>
      </div>

      {/* Toast / Alerta Flutuante Não-Silencioso em caso de erro */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up bg-slate-900/95 border-2 border-danger/60 text-text-primary p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-danger/20 text-danger shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-danger">Limite do Plano Atingido</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-secondary/40 transition-colors"
              title="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-secondary/50">
            <button
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              Entendi
            </button>
            <Link
              href="/dashboard/assinatura"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20 transition-all hover:scale-105"
            >
              Fazer Upgrade <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
