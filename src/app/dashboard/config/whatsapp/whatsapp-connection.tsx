"use client";

import { useState } from "react";
import { QrCode, Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface WhatsappConnectionProps {
  tenantId: string;
}

export function WhatsappConnection({ tenantId }: WhatsappConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Simulação da chamada para a Evolution API ou nosso endpoint interno
      // const response = await fetch('/api/sdr/instance/create', {
      //   method: 'POST',
      //   body: JSON.stringify({ tenantId })
      // });
      // const data = await response.json();
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulando retorno do base64 de um QRCode
      setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ExemploDeQrCodeEvolutionAPI");
      setStatus("connecting");
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2">
            <Smartphone className="text-primary" /> Conexão do Agente SDR
          </h2>
          <p className="text-text-secondary mt-2 text-sm max-w-xl">
            Conecte o número de WhatsApp da barbearia para ativar o Agente SDR. 
            Ele responderá automaticamente aos seus clientes agendando horários e tirando dúvidas.
          </p>
        </div>

        {status === "disconnected" && (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg border border-success/20">
            <CheckCircle2 size={20} />
            <span className="font-medium">Conectado</span>
          </div>
        )}
      </div>

      {status === "connecting" && qrCode && (
        <div className="mt-8 p-8 border border-secondary rounded-xl bg-background flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Leia o QR Code</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-md">
            Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho e aponte a câmera para o código abaixo.
          </p>
          <div className="bg-white p-4 rounded-xl">
            {/* Usando img normal pois o domínio mock não estaria no next.config.ts */}
            <img 
              src={qrCode} 
              alt="QR Code WhatsApp" 
              width={250} 
              height={250}
              className="rounded-lg"
            />
          </div>
          <div className="mt-6 flex items-center gap-2 text-primary">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm font-medium">Aguardando leitura do QR Code...</span>
          </div>
        </div>
      )}
    </div>
  );
}
