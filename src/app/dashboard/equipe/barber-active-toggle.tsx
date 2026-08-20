"use client";

import { useState, useTransition } from "react";
import { toggleBarberActive } from "@/app/actions/team";
import { Loader2, Scissors, ShieldAlert } from "lucide-react";

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

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    startTransition(async () => {
      const res = await toggleBarberActive(barberId, unitId, nextState);
      if (res?.error) {
        setIsActive(!nextState); // Reverter em caso de erro
        alert(res.error);
      }
    });
  };

  return (
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
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          isActive ? "bg-emerald-500" : "bg-slate-700"
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
  );
}
