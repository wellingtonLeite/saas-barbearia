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

  // CASO 1: PLANO GRATUITO (SEM IA SDR)
  if (!hasWhatsappSdr) {
    return (
      <div className="space-y-6">
        {/* Card Status Manual */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <p className="text-sm text-text-secondary mt-1">
                  Suas mensagens e confirmações são enviadas pelo próprio barbeiro através de links diretos do WhatsApp ao criar ou finalizar atendimentos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Apresentação & Upgrade Barber Pro/VIP */}
        <div className="relative overflow-hidden bg-gradient-to-br from-surface to-surface/80 border border-primary/30 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                <Sparkles size={13} /> Automação com Inteligência Artificial
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                Atendimento e Agendamento Automático 24h
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                No **Barber Pro** e **Barber VIP**, seu WhatsApp é conectado a um Agente de IA que responde clientes, consulta a agenda dos barbeiros e confirma horários sozinho, mesmo de madrugada ou feriados.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  Agendamento em tempo real no banco
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  Compreende texto e áudios de voz
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  Atendimento 24/7 sem fila de espera
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  Lembretes para redução de faltas
                </li>
              </ul>
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <Link 
                href="/dashboard/assinatura"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                <Zap size={16} /> Fazer Upgrade para Barber Pro
              </Link>
              <span className="text-center text-[11px] text-text-secondary">
                A partir de R$ 89,90/mês
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASO 2: PLANOS PRO OU VIP (COM IA SDR)
  return (
    <div className="space-y-6">
      {/* Card de Conexão */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-secondary/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Conexão do WhatsApp da Barbearia</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Instância: <code className="text-primary font-mono">{instanceName}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === "connected" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                WhatsApp Conectado
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-secondary text-xs font-medium text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Desconectado
              </div>
            )}

            {status === "connected" && (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                title="Reconectar WhatsApp"
                className="p-2 text-text-secondary hover:text-text-primary rounded-lg border border-secondary hover:bg-secondary/50 transition-colors"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conteúdo dependendo do status */}
        <div className="mt-6">
          {status === "connected" ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-sm text-emerald-400">
              <CheckCircle2 size={18} className="shrink-0" />
              <div>
                <p className="font-semibold text-text-primary">Instância conectada e operacional!</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  O Agente IA SDR está ativo respondendo mensagens e agendando horários no seu WhatsApp.
                </p>
              </div>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background rounded-xl border border-secondary">
              <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="space-y-4 text-sm flex-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <QrCode size={18} /> Escaneie o QR Code para conectar
                </div>

                <ol className="space-y-2.5 text-xs text-text-secondary list-decimal list-inside leading-relaxed">
                  <li>Abra o **WhatsApp** no celular da barbearia.</li>
                  <li>Toque em **Configurações / Aparelhos Conectados**.</li>
                  <li>Toque em **Conectar um aparelho** e aponte para o código.</li>
                </ol>

                <div className="flex items-center gap-2 text-xs text-text-secondary pt-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  Aguardando leitura do QR Code...
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-background rounded-xl border border-secondary">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Conectar número do WhatsApp</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Gere o QR Code para parear o número da barbearia com a inteligência artificial.
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode size={14} /> Gerar QR Code
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
