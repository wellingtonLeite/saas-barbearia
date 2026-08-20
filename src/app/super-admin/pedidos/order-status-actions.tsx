"use client";

import { useState, useTransition } from "react";
import { updateSubscriptionStatus, updateSubscriptionPlan, manualApproveOrder } from "@/app/actions/subscription-admin";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlanOption {
  id: string;
  name: string;
  base_price: any;
}

interface OrderStatusActionsProps {
  subscriptionId: string;
  currentStatus: string;
  currentPlanId: string;
  plans: PlanOption[];
}

export function OrderStatusActions({
  subscriptionId,
  currentStatus,
  currentPlanId,
  plans
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleStatusChange = (newStatus: any) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateSubscriptionStatus(subscriptionId, newStatus);
      if (res?.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: "Status atualizado!" });
        router.refresh();
      }
    });
  };

  const handlePlanChange = (newPlanId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateSubscriptionPlan(subscriptionId, newPlanId);
      if (res?.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: "Plano atualizado!" });
        router.refresh();
      }
    });
  };

  const handleQuickApprove = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await manualApproveOrder(subscriptionId);
      if (res?.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: "Pedido aprovado e acesso liberado!" });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
      {/* Seletor de Plano */}
      <select
        defaultValue={currentPlanId}
        onChange={(e) => handlePlanChange(e.target.value)}
        disabled={isPending}
        className="bg-background border border-secondary rounded-lg px-2 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none"
        title="Alterar plano da barbearia manualmente"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (R$ {Number(p.base_price).toFixed(2)})
          </option>
        ))}
      </select>

      {/* Seletor de Status (WooCommerce Style) */}
      <select
        defaultValue={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
        className={`border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
          currentStatus === "ACTIVE"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : currentStatus === "PAST_DUE"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : currentStatus === "TRIAL"
            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
        }`}
        title="Alterar status do pedido/assinatura"
      >
        <option value="ACTIVE" className="bg-slate-900 text-emerald-400">🟢 Aprovado (Ativo)</option>
        <option value="PAST_DUE" className="bg-slate-900 text-amber-400">🟡 Pendente (Aguardando)</option>
        <option value="TRIAL" className="bg-slate-900 text-blue-400">🔵 Período de Teste</option>
        <option value="CANCELED" className="bg-slate-900 text-rose-400">🔴 Cancelado</option>
      </select>

      {/* Botão de Aprovação Rápida se não estiver ativo */}
      {currentStatus !== "ACTIVE" && (
        <button
          onClick={handleQuickApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[11px] transition-all shadow-sm shrink-0 cursor-pointer"
          title="Aprovar pedido manualmente e liberar o plano"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <CheckCircle2 size={12} />
          )}
          <span>Aprovar</span>
        </button>
      )}

      {feedback && (
        <span className={`text-[10px] ${feedback.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
          {feedback.text}
        </span>
      )}
    </div>
  );
}
