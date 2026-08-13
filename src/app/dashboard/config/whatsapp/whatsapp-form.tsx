"use client";

import { useActionState } from "react";
import { saveWhatsappTemplates } from "@/app/actions/whatsapp";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-success text-white font-bold px-6 py-2 rounded-lg hover:bg-success/90 hover:scale-105 transition-all shadow-lg shadow-success/20 disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? "Salvando..." : "Salvar Templates"}
    </button>
  );
}

export function WhatsappForm({ tenantId, defaultValues }: { tenantId: string, defaultValues: any }) {
  const [state, formAction] = useActionState(saveWhatsappTemplates, null);

  const variablesHelper = (
    <div className="mt-2 text-xs text-text-secondary bg-background border border-secondary p-3 rounded-lg">
      <p className="font-bold mb-1">Variáveis disponíveis:</p>
      <ul className="flex flex-wrap gap-2">
        <li className="bg-secondary/50 px-2 py-1 rounded">{"{cliente}"}</li>
        <li className="bg-secondary/50 px-2 py-1 rounded">{"{barbearia}"}</li>
        <li className="bg-secondary/50 px-2 py-1 rounded">{"{hora}"}</li>
        <li className="bg-secondary/50 px-2 py-1 rounded">{"{barbeiro}"}</li>
        <li className="bg-secondary/50 px-2 py-1 rounded">{"{link}"}</li>
      </ul>
      <p className="mt-2">Use essas variáveis nos seus textos para personalizá-los dinamicamente.</p>
    </div>
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="tenantId" value={tenantId} />

      {state?.success === true && (
        <div className="bg-success/10 text-success border border-success/20 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={20} />
          <p>{state.message}</p>
        </div>
      )}

      {state?.success === false && (
        <div className="bg-danger/10 text-danger border border-danger/20 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-text-primary block mb-2">Lembrete de Agendamento</label>
          <textarea
            name="reminder"
            defaultValue={defaultValues?.reminder}
            rows={4}
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:border-success focus:outline-none resize-y"
            placeholder="Olá {cliente}, seu horário em {barbearia} está confirmado para {hora} com {barbeiro}."
          />
          {variablesHelper}
        </div>

        <div className="pt-4 border-t border-secondary">
          <label className="text-sm font-bold text-text-primary block mb-2">Pedido de Avaliação</label>
          <textarea
            name="review"
            defaultValue={defaultValues?.review}
            rows={4}
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:border-success focus:outline-none resize-y"
            placeholder="E aí {cliente}, o que achou do corte com {barbeiro}? Avalie no link: {link}"
          />
          {variablesHelper}
        </div>

        <div className="pt-4 border-t border-secondary">
          <label className="text-sm font-bold text-text-primary block mb-2">Mensagem de Cancelamento</label>
          <textarea
            name="cancellation"
            defaultValue={defaultValues?.cancellation}
            rows={4}
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:border-success focus:outline-none resize-y"
            placeholder="Olá {cliente}, seu agendamento em {barbearia} às {hora} foi cancelado."
          />
          {variablesHelper}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
