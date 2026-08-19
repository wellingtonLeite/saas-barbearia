"use client";

import { useState, useEffect } from "react";
import { QrCode, Smartphone, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface WhatsappConnectionProps {
  tenantId: string;
  slug?: string;
  phone?: string;
}

export function WhatsappConnection({ tenantId, slug, phone }: WhatsappConnectionProps) {
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
    }, 4000);

    return () => clearInterval(interval);
  }, [status, instanceName]);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao solicitar conexão com o WhatsApp');
      }

      if (data.base64) {
        const qrSource = data.base64.startsWith('http') || data.base64.startsWith('data:')
          ? data.base64
          : `data:image/png;base64,${data.base64}`;

        setQrCode(qrSource);
        setStatus("connecting");
      } else {
        throw new Error('QR Code não recebido da Evolution API.');
      }
    } catch (error: any) {
      console.error("Erro ao conectar WhatsApp:", error);
      setErrorMessage(error.message || 'Erro inesperado ao gerar QR Code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2">
            <Smartphone className="text-primary" /> Conexão do Agente SDR (WhatsApp)
          </h2>
          <p className="text-text-secondary mt-2 text-sm max-w-xl">
            Conecte o número de WhatsApp da barbearia para ativar o Agente SDR. 
            Ele atenderá e agendará automaticamente os seus clientes com inteligência artificial 24h por dia.
          </p>
          {instanceName && (
            <p className="text-xs text-text-secondary/70 mt-1 font-mono">
              Identificador da Instância: {instanceName}
            </p>
          )}
        </div>

        {status === "disconnected" && (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <QrCode size={20} />
            )}
            Conectar WhatsApp
          </button>
        )}

        {status === "connected" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg border border-success/20">
              <CheckCircle2 size={20} />
              <span className="font-medium">WhatsApp Conectado</span>
            </div>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              title="Reconectar / Atualizar"
              className="p-2 text-text-secondary hover:text-white bg-surface border border-secondary rounded-lg transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === "connecting" && qrCode && (
        <div className="mt-8 p-8 border border-secondary rounded-xl bg-background flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Leia o QR Code com seu WhatsApp</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-md">
            Abra o WhatsApp no celular da barbearia, vá em <strong>Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho</strong> e aponte a câmera para o código abaixo:
          </p>
          <div className="bg-white p-4 rounded-xl shadow-2xl">
            <img 
              src={qrCode} 
              alt="QR Code WhatsApp" 
              width={250} 
              height={250}
              className="rounded-lg object-contain"
            />
          </div>
          <div className="mt-6 flex items-center gap-2 text-primary">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm font-medium">Aguardando leitura do celular...</span>
          </div>
        </div>
      )}
    </div>
  );
}
