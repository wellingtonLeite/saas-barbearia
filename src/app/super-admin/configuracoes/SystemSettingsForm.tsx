"use client";

import { useActionState } from "react";
import { saveSystemSettings, saveGroqSettings } from "./actions";
import { MessageSquare, Save, Loader2, CheckCircle2, Bot, Key, Cpu, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const GROQ_MODELS = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", description: "Melhor qualidade • Recomendado para SDR" },
  { value: "llama-3.1-8b-instant",    label: "Llama 3.1 8B Instant",    description: "Ultra-rápido • Ideal para respostas simples" },
  { value: "llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B", description: "Modelo mais recente do Meta" },
  { value: "mixtral-8x7b-32768",      label: "Mixtral 8x7B",            description: "Excelente em múltiplos idiomas" },
  { value: "gemma2-9b-it",            label: "Gemma 2 9B (Google)",     description: "Modelo do Google, leve e rápido" },
];

export function SystemSettingsForm({
  defaultTemplates,
  groqConfig,
}: {
  defaultTemplates: any;
  groqConfig: any;
}) {
  const [showKey, setShowKey] = useState(false);

  const [templateState, templateAction, isTemplatePending] = useActionState(
    async (_: any, formData: FormData) => {
      try {
        await saveSystemSettings(formData);
        return { success: true, message: "Templates salvos com sucesso!" };
      } catch (error: any) {
        return { success: false, message: error.message || "Erro ao salvar" };
      }
    },
    null
  );

  const [groqState, groqAction, isGroqPending] = useActionState(
    async (_: any, formData: FormData) => {
      try {
        await saveGroqSettings(formData);
        return { success: true, message: "Configuração do Groq salva!" };
      } catch (error: any) {
        return { success: false, message: error.message || "Erro ao salvar" };
      }
    },
    null
  );

  return (
    <div className="space-y-8">

      {/* ─── CARD GROQ AI ─── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="text-orange-400" /> Agente SDR — Inteligência Artificial (Groq)
          </h2>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-orange-400 hover:underline"
          >
            Obter chave gratuita <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Configure a chave de API e o modelo de IA que o agente SDR usará para conversar com clientes via WhatsApp.
        </p>

        {groqState?.message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 ${groqState.success ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {groqState.success && <CheckCircle2 size={20} />}
            {groqState.message}
          </div>
        )}

        <form action={groqAction} className="space-y-6">
          {/* Chave de API */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Key size={14} className="text-orange-400" /> Chave de API do Groq
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                name="groq_api_key"
                defaultValue={groqConfig?.api_key || ""}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {groqConfig?.api_key
                ? "Chave já configurada — deixe em branco para manter a atual"
                : "Crie sua conta gratuita em console.groq.com e gere uma API Key"}
            </p>
          </div>

          {/* Seleção de Modelo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Cpu size={14} className="text-orange-400" /> Modelo de IA
            </label>
            <div className="grid grid-cols-1 gap-3">
              {GROQ_MODELS.map(model => (
                <label
                  key={model.value}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-orange-500/50 transition-all group has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/5"
                >
                  <input
                    type="radio"
                    name="groq_model"
                    value={model.value}
                    defaultChecked={
                      groqConfig?.model
                        ? groqConfig.model === model.value
                        : model.value === "llama-3.3-70b-versatile"
                    }
                    className="accent-orange-500 w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-has-[:checked]:text-orange-400 transition-colors">
                      {model.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                  </div>
                  {model.value === "llama-3.3-70b-versatile" && (
                    <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full shrink-0">
                      RECOMENDADO
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Status da configuração */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${groqConfig?.api_key ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-slate-700 bg-slate-800/50 text-slate-500"}`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${groqConfig?.api_key ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
            {groqConfig?.api_key
              ? `Agente SDR ativo — usando ${GROQ_MODELS.find(m => m.value === groqConfig.model)?.label || groqConfig.model || "Llama 3.3 70B"}`
              : "Agente SDR inativo — configure a chave de API para ativar"}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGroqPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {isGroqPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isGroqPending ? "Salvando..." : "Salvar Configuração do Groq"}
            </button>
          </div>
        </form>
      </div>

      {/* ─── CARD WHATSAPP TEMPLATES ─── */}
      <form action={templateAction} className="space-y-8">

        {templateState?.message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${templateState.success ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {templateState.success && <CheckCircle2 size={20} />}
            {templateState.message}
          </div>
        )}

        {/* Modelos Globais (Clientes Finais) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="text-blue-400" /> Comunicação com Clientes (Barbearias)
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Textos padrão que as barbearias vão herdar. Variáveis: {"{cliente}"}, {"{barbearia}"}, {"{hora}"}, {"{barbeiro}"}, {"{link}"}.
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

        {/* Modelos B2B */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="text-red-400" /> Comunicação B2B (Você e as Barbearias)
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Mensagens que você enviará para donos das barbearias. Variáveis: {"{dono}"}, {"{barbearia}"}, {"{plano}"}, {"{link_pagamento}"}.
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
            disabled={isTemplatePending}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isTemplatePending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isTemplatePending ? "Salvando..." : "Salvar Templates"}
          </button>
        </div>
      </form>
    </div>
  );
}
