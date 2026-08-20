"use client";

import { useState, useEffect } from "react";
import { 
  QrCode, 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Bot, 
  Sparkles, 
  Crown, 
  Clock, 
  CalendarCheck, 
  Mic, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";

interface WhatsappConnectionProps {
  tenantId: string;
  slug?: string;
  phone?: string;
  hasWhatsappSdr?: boolean;
  planName?: string;
}

export function WhatsappConnection({ 
  tenantId, 
  slug, 
  phone, 
  hasWhatsappSdr = false,
  planName = "Plano Gratuito"
}: WhatsappConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const instanceName = slug || phone?.replace(/\D/g, "") || `tenant_${tenantId.slice(0, 8)}`;

  // Verificar status atual da conexão ao carregar
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentStatus() {
      try {
        const res = await fetch(`/api/whatsapp/instance?instanceName=${encodeURIComponent(instanceName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected && isMounted) {
            setStatus("connected");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status da conexão:", err);
      }
    }

    checkCurrentStatus();
    return () => {
      isMounted = false;
    };
  }, [instanceName]);

  // Polling para checar se o usuário leu o QR Code
  useEffect(() => {
    if (status !== "connecting") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/whatsapp/instance?instanceName=${encodeURIComponent(instanceName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setStatus("connected");
            setQrCode(null);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Erro no polling de status:", err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [status, instanceName]);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao solicitar conexão com o WhatsApp");
      }

      if (data.base64) {
        const qrSource = data.base64.startsWith("http") || data.base64.startsWith("data:")
          ? data.base64
          : `data:image/png;base64,${data.base64}`;

        setQrCode(qrSource);
        setStatus("connecting");
      } else {
        throw new Error("QR Code não recebido do servidor do WhatsApp.");
      }
    } catch (error: any) {
      console.error("Erro ao conectar WhatsApp:", error);
      setErrorMessage(error.message || "Erro inesperado ao gerar QR Code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Upgrade para Planos sem IA SDR */}
      {!hasWhatsappSdr && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface to-amber-500/5 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown size={12} /> {planName} • WhatsApp Manual Ativo
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Quer que a IA atenda e agende sozinha no WhatsApp 24h por dia?
              </h3>
              <p className="text-sm text-text-secondary max-w-2xl">
                Seu plano atual permite disparar mensagens manuais. Para que o <strong>Agente IA SDR</strong> responda mensagens, consulte a agenda e marque horários automaticamente, faça o upgrade para o Plano VIP.
              </p>
            </div>
            <Link
              href="/dashboard/assinatura"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Zap size={16} /> Liberar IA SDR no VIP <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Card Principal de Conexão com Status em Destaque */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-secondary/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Smartphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
                  Conexão com o WhatsApp
                </h2>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  Instância: <span className="text-text-primary font-semibold">{instanceName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge Visual */}
          <div className="flex items-center gap-3">
            {status === "connected" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-bold text-sm">🟢 WhatsApp Conectado</span>
              </div>
            )}

            {status === "connecting" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Loader2 className="animate-spin text-amber-400" size={16} />
                <span className="font-bold text-sm">🟡 Aguardando Leitura</span>
              </div>
            )}

            {status === "disconnected" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-bold text-sm">🔴 Desconectado</span>
              </div>
            )}

            {status === "connected" && (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                title="Reconectar ou Gerar Novo QR Code"
                className="p-2.5 text-text-secondary hover:text-white bg-background border border-secondary rounded-xl hover:border-primary/50 transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Estado Desconectado - Botão de Ação */}
        {status === "disconnected" && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-background/60 border border-secondary">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2 justify-center md:justify-start">
                <QrCode size={18} className="text-primary" /> Conecte o aparelho da sua barbearia
              </h3>
              <p className="text-sm text-text-secondary">
                Clique no botão ao lado para gerar o QR Code oficial e sincronizar seu WhatsApp em poucos segundos.
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Gerando QR Code...</span>
                </>
              ) : (
                <>
                  <QrCode size={20} />
                  <span>Gerar QR Code de Conexão</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Estado Conectando - Exibição do QR Code Grande e Instruções */}
        {status === "connecting" && qrCode && (
          <div className="mt-8 p-6 md:p-10 border border-secondary rounded-2xl bg-background/80 flex flex-col items-center text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold mb-4">
              <Sparkles size={14} /> Passo a Passo de Conexão
            </div>
            
            <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
              Escaneie o QR Code com seu WhatsApp
            </h3>

            <ol className="text-left text-sm text-text-secondary max-w-md space-y-2 mb-8 bg-surface p-4 rounded-xl border border-secondary/60">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Abra o WhatsApp no celular da sua barbearia.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Toque em <strong>Aparelhos Conectados</strong> e depois em <strong>Conectar um aparelho</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Aponte a câmera do celular para o código abaixo:</span>
              </li>
            </ol>

            {/* Container do QR Code em tamanho grande com contraste ideal */}
            <div className="relative p-6 bg-white rounded-3xl shadow-2xl border-4 border-primary/40 inline-block">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                width={280} 
                height={280}
                className="rounded-xl object-contain block mx-auto"
              />
            </div>

            <div className="mt-8 flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Loader2 className="animate-spin text-primary shrink-0" size={18} />
              <span className="text-sm font-semibold">
                Aguardando leitura do celular... A tela atualizará automaticamente!
              </span>
            </div>

            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="mt-4 text-xs text-text-secondary hover:text-text-primary underline flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> O código expirou? Clique para gerar outro
            </button>
          </div>
        )}

        {/* Estado Conectado - Confirmação */}
        {status === "connected" && (
          <div className="mt-6 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-base">
                Instância do WhatsApp Conectada com Sucesso!
              </h4>
              <p className="text-sm text-text-secondary mt-0.5">
                Seu número está pronto para interações automáticas, envio de confirmações e integração com o Agente SDR.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Especial: Apresentação do Agente IA SDR */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-surface via-surface to-primary/5 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Bot size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-display font-bold text-text-primary">
                Agente IA SDR no WhatsApp
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Inteligência Artificial
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Seu assistente virtual 24h que atende, tira dúvidas e agenda cortes automaticamente.
            </p>
          </div>
        </div>

        {/* Grid de Recursos do SDR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-background/70 border border-secondary hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-text-primary text-sm mb-1">Atendimento 24/7</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Atende clientes mesmo fora do horário comercial, fins de semana e feriados sem atrasos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/70 border border-secondary hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CalendarCheck size={20} />
            </div>
            <h4 className="font-bold text-text-primary text-sm mb-1">Agendamento Real-Time</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Consulta a agenda dos barbeiros e confirma o agendamento diretamente no banco de dados.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/70 border border-secondary hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Mic size={20} />
            </div>
            <h4 className="font-bold text-text-primary text-sm mb-1">Entende Áudios e Texto</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Transcreve áudios com IA e responde de forma natural e amigável aos clientes da barbearia.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/70 border border-secondary hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-text-primary text-sm mb-1">Zero Faltas (No-Show)</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Dispara lembretes automáticos com links rápidos para confirmar ou reagendar horários.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
