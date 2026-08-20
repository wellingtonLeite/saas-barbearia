"use client";

import { useActionState } from "react";
import { saveWhatsappTemplates } from "@/app/actions/whatsapp";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Save, Loader2, MessageSquareText, Star, BellRing } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          <span>Salvando...</span>
        </>
      ) : (
        <>
          <Save size={18} />
          <span>Salvar Templates de Mensagem</span>
        </>
      )}
    </button>
  );
}

export function WhatsappForm({ tenantId, defaultValues, hasWhatsappSdr = false }: { tenantId: string, defaultValues?: any, hasWhatsappSdr?: boolean }) {
  const [state, formAction] = useActionState(saveWhatsappTemplates, null);

  const variablesHelper = (
    <div className="mt-2 text-xs text-text-secondary bg-background/60 border border-secondary/60 p-2.5 rounded-lg">
      <p className="font-medium text-text-primary mb-1 text-[11px] flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Variáveis dinâmicas:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {["{cliente}", "{barbearia}", "{hora}", "{barbeiro}", "{link}"].map((tag) => (
          <span 
            key={tag} 
            className="bg-surface border border-secondary text-primary font-mono text-[11px] px-1.5 py-0.5 rounded cursor-help"
            title={`Substituído automaticamente por: ${tag.replace(/[{}]/g, '')}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm space-y-5">
      <div className="border-b border-secondary/50 pb-3">
        <h3 className="font-semibold text-text-primary">
          {hasWhatsappSdr ? "Templates de Mensagens Automáticas" : "Modelos de Mensagens de Contato"}
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          {hasWhatsappSdr
            ? "Personalize os textos dos lembretes, solicitações de avaliação e cancelamentos enviados aos clientes."
            : "Textos pré-formatados para envio manual de avisos e lembretes via WhatsApp aos seus clientes."}
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="tenantId" value={tenantId} />

      {state?.success === true && (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="font-medium text-sm">{state.message}</p>
        </div>
      )}

      {state?.success === false && (
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium text-sm">{state.error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Lembrete */}
        <div className="p-4 rounded-xl bg-background/40 border border-secondary/60">
          <label className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
            <BellRing size={16} className="text-primary" /> Lembrete de Agendamento
          </label>
          <textarea
            name="reminder"
            defaultValue={defaultValues?.reminder || "Olá {cliente}, seu horário em {barbearia} está confirmado para {hora} com {barbeiro}."}
            rows={3}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y"
            placeholder="Olá {cliente}, seu horário em {barbearia} está confirmado para {hora} com {barbeiro}."
          />
          {variablesHelper}
        </div>

        {/* Avaliação */}
        <div className="p-4 rounded-xl bg-background/40 border border-secondary/60">
          <label className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
            <Star size={16} className="text-amber-400" /> Pedido de Avaliação Pós-Corte
          </label>
          <textarea
            name="review"
            defaultValue={defaultValues?.review || "E aí {cliente}, o que achou do atendimento com {barbeiro}? Avalie no link: {link}"}
            rows={3}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y"
            placeholder="E aí {cliente}, o que achou do atendimento com {barbeiro}? Avalie no link: {link}"
          />
          {variablesHelper}
        </div>

        {/* Cancelamento */}
        <div className="p-4 rounded-xl bg-background/40 border border-secondary/60">
          <label className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
            <MessageSquareText size={16} className="text-rose-400" /> Aviso de Cancelamento
          </label>
          <textarea
            name="cancellation"
            defaultValue={defaultValues?.cancellation || "Olá {cliente}, seu agendamento em {barbearia} às {hora} foi cancelado. Se desejar reagendar, acesse: {link}"}
            rows={3}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y"
            placeholder="Olá {cliente}, seu agendamento em {barbearia} às {hora} foi cancelado. Se desejar reagendar, acesse: {link}"
          />
          {variablesHelper}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
    </div>
  );
}
