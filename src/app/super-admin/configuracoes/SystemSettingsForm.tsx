"use client";

import { useActionState } from "react";
import { saveSystemSettings } from "./actions";
import { MessageSquare, Save, Loader2, CheckCircle2 } from "lucide-react";

export function SystemSettingsForm({ defaultTemplates }: { defaultTemplates: any }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        await saveSystemSettings(formData);
        return { success: true, message: "Modelos salvos com sucesso!" };
      } catch (error: any) {
        return { success: false, message: error.message || "Erro ao salvar" };
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-8 animate-in fade-in duration-500">
      
      {state?.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${state.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {state.success ? <CheckCircle2 size={20} /> : null}
          {state.message}
        </div>
      )}

      {/* Modelos Globais (Clientes Finais) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <MessageSquare className="text-blue-400" /> Comunicação com Clientes (Barbearias)
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Estes são os textos padrão que as barbearias vão herdar. Variáveis: {'{cliente}'}, {'{barbearia}'}, {'{hora}'}, {'{barbeiro}'}, {'{link}'}.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lembrete de Agendamento</label>
            <textarea 
              name="reminder" 
              defaultValue={defaultTemplates?.reminder || "Olá {cliente}, passando para confirmar seu horário amanhã às {hora} na {barbearia} com {barbeiro}."}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pedido de Avaliação</label>
            <textarea 
              name="review" 
              defaultValue={defaultTemplates?.review || "Olá {cliente}, muito obrigado pela preferência! Que tal avaliar o corte do {barbeiro}? Acesse: {link}"}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aviso de Cancelamento</label>
            <textarea 
              name="cancellation" 
              defaultValue={defaultTemplates?.cancellation || "Olá {cliente}, informamos que seu agendamento na {barbearia} foi cancelado. Acesse nosso link para remarcar!"}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Modelos B2B (Dono do Sistema -> Dono da Barbearia) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <MessageSquare className="text-red-400" /> Comunicação B2B (Você e as Barbearias)
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Modelos de mensagens que você enviará para os donos das barbearias. Variáveis: {'{dono}'}, {'{barbearia}'}, {'{plano}'}, {'{link_pagamento}'}.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Boas Vindas (Nova Barbearia)</label>
            <textarea 
              name="b2b_welcome" 
              defaultValue={defaultTemplates?.b2b_welcome || "Olá {dono}, parabéns por cadastrar a {barbearia}! Seja muito bem-vindo ao nosso sistema. Qualquer dúvida, estou por aqui!"}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aviso de Cobrança / Assinatura</label>
            <textarea 
              name="b2b_billing" 
              defaultValue={defaultTemplates?.b2b_billing || "Fala {dono}! Tudo bem? A assinatura do {plano} da {barbearia} está próxima do vencimento. Renove aqui: {link_pagamento}"}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit"
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isPending ? 'Salvando...' : 'Salvar Templates'}
        </button>
      </div>

    </form>
  );
}
