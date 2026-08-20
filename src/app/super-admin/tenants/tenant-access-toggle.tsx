"use client";

import { useState, useTransition } from "react";
import { toggleTenantAccess } from "./actions";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

export function TenantAccessToggle({
  tenantId,
  initialActive,
  tenantName
}: {
  tenantId: string;
  initialActive: boolean;
  tenantName: string;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);

    startTransition(async () => {
      const res = await toggleTenantAccess(tenantId, nextState);
      if (res?.error) {
        setIsActive(!nextState); // Reverte caso haja erro
        alert(res.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={isPending}
        onClick={handleToggle}
        title={isActive ? `Bloquear acesso de ${tenantName}` : `Liberar acesso de ${tenantName}`}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          isActive ? "bg-emerald-500 shadow-sm shadow-emerald-500/20" : "bg-red-500/40"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            isActive ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {isPending ? (
            <Loader2 size={10} className="animate-spin text-slate-800" />
          ) : isActive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
        </span>
      </button>

      <span className={`text-xs font-bold flex items-center gap-1 ${
        isActive ? "text-emerald-400" : "text-red-400"
      }`}>
        {isActive ? "Liberado" : "Bloqueado"}
      </span>
    </div>
  );
}
