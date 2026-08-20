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
  Lock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare
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

  // Verificar status atual da conexão ao carregar (apenas se tiver SDR)
  useEffect(() => {
    if (!hasWhatsappSdr) return;
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
  }, [instanceName, hasWhatsappSdr]);

  // Polling para checar leitura do QR Code
  useEffect(() => {
    if (!hasWhatsappSdr || status !== "connecting") return;

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
  }, [status, instanceName, hasWhatsappSdr]);

  const handleConnect = async () => {
    if (!hasWhatsappSdr) return;
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
        throw new Error("QR Code não recebido do servidor.");
      }
    } catch (error: any) {
      console.error("Erro ao conectar WhatsApp:", error);
      setErrorMessage(error.message || "Erro inesperado ao gerar QR Code.");
    } finally {
      setIsLoading(false);
    }
  };

  // CASO 1: PLANO GRATUITO (SEM IA SDR) - 2 COLUNAS HORIZONTAIS
  if (!hasWhatsappSdr) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Card Status Manual */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-secondary/50 text-text-secondary shrink-0">
                <MessageSquare size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">WhatsApp Manual Ativo</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-text-secondary font-medium">
                    Plano Gratuito
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Suas mensagens e confirmações são enviadas pelo próprio barbeiro através de links diretos do WhatsApp (`wa.me`) ao criar ou finalizar atendimentos.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/60 border border-secondary/60 space-y-2 text-xs text-text-secondary">
              <p className="font-medium text-text-primary text-[11px]">Como funciona o WhatsApp Manual:</p>
              <ul className="space-y-1.5 list-disc list-inside text-[11px]">
                <li>Envio de lembretes manuais com 1 clique pelo painel</li>
                <li>Links prontos para chamar clientes no WhatsApp</li>
                <li>Modelos de mensagens customizáveis abaixo</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-secondary/50 flex items-center justify-between text-xs text-text-secondary">
            <span>Status: <strong className="text-text-primary">Ativo</strong></span>
            <span className="text-[11px]">Sem conexão de IA</span>
          </div>
        </div>

        {/* Coluna 2: Card Apresentação & Upgrade Barber Pro/VIP */}
        <div className="relative overflow-hidden bg-gradient-to-br from-surface to-surface/80 border border-primary/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles size={12} /> Automação com Inteligência Artificial
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              Atendimento e Agendamento 24h
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              No **Barber Pro**, seu WhatsApp conecta com um Agente IA que atende clientes, consulta a agenda e confirma horários sozinho no sistema.
            </p>
            
            <ul className="space-y-1.5 text-xs text-text-secondary pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                Agendamento em tempo real no banco
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                Compreende texto e áudios de voz
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                Lembretes para redução de faltas
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-secondary/50 flex items-center justify-between gap-3">
            <span className="text-[11px] text-text-secondary">
              A partir de R$ 89,90/mês
            </span>
            <Link 
              href="/dashboard/assinatura"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <Zap size={14} /> Fazer Upgrade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASO 2: PLANOS PRO OU VIP (COM IA SDR) - 2 COLUNAS LADO A LADO
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna 1: Status da Conexão & Detalhes da Instância */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Conexão do WhatsApp</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Instância: <code className="text-primary font-mono">{instanceName}</code>
                </p>
              </div>
            </div>

            {status === "connected" ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Conectado
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-secondary text-xs font-medium text-text-secondary shrink-0">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Desconectado
              </div>
            )}
          </div>

          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "connected" ? (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2 text-xs text-emerald-400">
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Instância operacional
              </div>
              <p className="text-text-secondary leading-relaxed">
                O Agente IA SDR está respondendo mensagens e agendando horários no seu WhatsApp 24 horas por dia.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-background/60 border border-secondary/60 space-y-2 text-xs text-text-secondary">
              <p className="font-medium text-text-primary text-[11px]">Como conectar seu número:</p>
              <ol className="space-y-1.5 list-decimal list-inside text-[11px] leading-relaxed">
                <li>Clique em <strong>Gerar QR Code</strong> ao lado.</li>
                <li>Abra o <strong>WhatsApp</strong> no celular da barbearia.</li>
                <li>Vá em <strong>Aparelhos Conectados &gt; Conectar um aparelho</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-secondary/50 flex items-center justify-between gap-3">
          <span className="text-xs text-text-secondary">
            Status: <strong className={status === "connected" ? "text-emerald-400" : "text-text-secondary"}>
              {status === "connected" ? "Online" : "Aguardando Pareamento"}
            </strong>
          </span>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Gerando...
              </>
            ) : status === "connected" ? (
              <>
                <RefreshCw size={13} /> Reconectar
              </>
            ) : (
              <>
                <QrCode size={13} /> Gerar QR Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coluna 2: Card de QR Code ou Status IA Ativo */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center">
        {status === "connected" ? (
          <div className="my-auto space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary flex items-center justify-center gap-1.5">
                <Sparkles size={16} className="text-primary" /> Agente IA SDR Ativo
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                Seu assistente virtual está pronto para atender novos clientes e sincronizar a agenda em tempo real.
              </p>
            </div>
          </div>
        ) : qrCode ? (
          <div className="space-y-4 my-auto">
            <div className="bg-white p-3 rounded-2xl shadow-lg inline-block">
              <img
                src={qrCode}
                alt="QR Code WhatsApp"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-text-secondary font-medium">
              <Loader2 size={13} className="animate-spin text-primary" />
              Aguardando leitura do QR Code...
            </div>
          </div>
        ) : (
          <div className="my-auto space-y-3 py-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/40 text-text-secondary border border-secondary flex items-center justify-center mx-auto">
              <QrCode size={30} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-text-primary">QR Code Desconectado</h4>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xs mx-auto">
                Clique em "Gerar QR Code" na coluna ao lado para visualizar e escanear o código.
              </p>
            </div>
          </div>
        )}

        <div className="w-full pt-4 border-t border-secondary/50 flex items-center justify-between text-xs text-text-secondary">
          <span>{planName}</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck size={14} /> Criptografia Ponta a Ponta
          </span>
        </div>
      </div>
    </div>
  );
}

