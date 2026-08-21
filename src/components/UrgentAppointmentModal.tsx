"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  CheckCheck
} from "lucide-react";
import type { Notification } from "@/generated/prisma/client";

export interface UrgentAppointmentItem extends Notification {
  allIds?: string[];
}

interface UrgentAppointmentModalProps {
  notifications: UrgentAppointmentItem[];
  onAcknowledge: (notificationIds: string[]) => Promise<void>;
  onStopSound: () => void;
}

export function parseAppointmentDetails(message: string, createdAt?: Date | string) {
  let clientName = "Cliente";
  let serviceName = "Corte / Barba";
  let barberName = "Barbeiro da Casa";
  let dateTime = createdAt 
    ? new Date(createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Hoje";

  if (!message) {
    return { clientName, serviceName, barberName, dateTime };
  }

  // 1. Formato com pipes: "Cliente: Nome | Serviço: Corte | Barbeiro: Carlos | Horário: 21/08 às 14:00"
  if (message.includes("|")) {
    const parts = message.split("|").map((p) => p.trim());
    for (const part of parts) {
      if (/^cliente:/i.test(part)) {
        clientName = part.replace(/^cliente:/i, "").trim() || clientName;
      } else if (/^servi[çc]o:/i.test(part)) {
        serviceName = part.replace(/^servi[çc]o:/i, "").trim() || serviceName;
      } else if (/^(barbeiro|profissional):/i.test(part)) {
        barberName = part.replace(/^(barbeiro|profissional):/i, "").trim() || barberName;
      } else if (/^(hor[aá]rio|data):/i.test(part)) {
        dateTime = part.replace(/^(hor[aá]rio|data):/i, "").trim() || dateTime;
      }
    }
    return { clientName, serviceName, barberName, dateTime };
  }

  // 2. Formato SDR completo: "João Silva agendou Corte Cabelo com Carlos para 21/08/2026 às 14:00"
  const sdrMatch = message.match(/^(.*?)\s+agendou\s+(.*?)\s+com\s+(.*?)\s+para\s+(.*)$/i);
  if (sdrMatch) {
    clientName = sdrMatch[1].trim() || clientName;
    serviceName = sdrMatch[2].trim() || serviceName;
    barberName = sdrMatch[3].trim() || barberName;
    dateTime = sdrMatch[4].trim() || dateTime;
    return { clientName, serviceName, barberName, dateTime };
  }

  // 3. Formato legado: "João Silva agendou para 21/08/2026 às 14:00"
  const legacyMatch = message.match(/^(.*?)\s+agendou para\s+(.*)$/i);
  if (legacyMatch) {
    clientName = legacyMatch[1].trim() || clientName;
    dateTime = legacyMatch[2].trim() || dateTime;
    return { clientName, serviceName, barberName, dateTime };
  }

  // 4. Fallback se for mensagem livre/teste
  return {
    clientName: message.length > 35 ? `${message.substring(0, 35)}...` : message,
    serviceName,
    barberName,
    dateTime,
  };
}

export function UrgentAppointmentModal({
  notifications,
  onAcknowledge,
  onStopSound,
}: UrgentAppointmentModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, notifications.length - 1);
  const currentNotif = notifications[safeIndex] || notifications[0];
  const details = parseAppointmentDetails(currentNotif.message, currentNotif.createdAt);
  const totalCount = notifications.length;

  const handleConfirmSingle = async () => {
    try {
      setIsProcessing(true);
      onStopSound();
      const idsToAcknowledge =
        currentNotif.allIds && currentNotif.allIds.length > 0
          ? currentNotif.allIds
          : [currentNotif.id];

      await onAcknowledge(idsToAcknowledge);
      if (safeIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Erro ao confirmar agendamento:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAll = async () => {
    try {
      setIsProcessing(true);
      onStopSound();
      const allIds = notifications.flatMap((n) =>
        n.allIds && n.allIds.length > 0 ? n.allIds : [n.id]
      );
      await onAcknowledge(allIds);
    } catch (err) {
      console.error("Erro ao confirmar todos os agendamentos:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <aside
      role="alert"
      aria-live="assertive"
      aria-label="Alerta de Novo Agendamento SDR"
      className="fixed top-4 right-4 z-[9999] max-w-[340px] sm:max-w-[360px] w-[calc(100vw-2rem)] pointer-events-auto"
    >
      {/* Micro-Card Ultra Compacto e Discreto (Dynamic Island Style) */}
      <div className="relative bg-zinc-950/95 backdrop-blur-xl border border-emerald-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.25)] rounded-2xl p-3.5 text-zinc-100 animate-in slide-in-from-top-3 fade-in duration-200">
        {/* Glow Superior Elegante */}
        <div className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />

        {/* Linha 1: Título & Status de Som */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs shrink-0">🚨</span>
            <h4 className="text-xs font-bold text-white tracking-tight truncate">
              Novo Agendamento SDR
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {totalCount > 1 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                {safeIndex + 1}/{totalCount}
              </span>
            )}
            <button
              type="button"
              onClick={onStopSound}
              title="Silenciar som"
              className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded-full animate-pulse transition-colors cursor-pointer"
            >
              <Volume2 size={10} className="animate-bounce shrink-0" />
              <span>Som Ativo</span>
            </button>
          </div>
        </div>

        {/* Linhas 2 e 3 em Caixa de Conteúdo Ultra Limpa */}
        <div className="mt-2 py-1.5 px-2.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl space-y-1 text-xs">
          {/* Linha 2: Cliente • Serviço */}
          <div className="flex items-center gap-1.5 text-zinc-300 truncate">
            <span className="shrink-0 text-[11px]">👤</span>
            <span className="font-bold text-white truncate max-w-[130px] sm:max-w-[150px]">
              {details.clientName}
            </span>
            <span className="text-zinc-600 text-[10px]">•</span>
            <span className="shrink-0 text-[11px]">✂️</span>
            <span className="font-semibold text-emerald-400 truncate flex-1">
              {details.serviceName}
            </span>
          </div>

          {/* Linha 3: Barbeiro • Data às Horário */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
            <span className="shrink-0 text-[11px]">💈</span>
            <span className="text-zinc-300 truncate max-w-[110px] sm:max-w-[130px]">
              {details.barberName}
            </span>
            <span className="text-zinc-600 text-[10px]">•</span>
            <span className="shrink-0 text-[11px]">🕒</span>
            <span className="font-medium text-cyan-300 truncate">
              {details.dateTime}
            </span>
          </div>
        </div>

        {/* Botões de Ação Compactos */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleConfirmSingle}
            disabled={isProcessing}
            className="flex-1 h-8 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={14} className="stroke-[2.5]" />
                <span>Estou Ciente</span>
              </>
            )}
          </button>

          {totalCount > 1 && (
            <button
              type="button"
              onClick={handleConfirmAll}
              disabled={isProcessing}
              title={`Confirmar todos os ${totalCount} agendamentos`}
              className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Todos ({totalCount})</span>
            </button>
          )}

          {totalCount > 1 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={safeIndex === 0}
                aria-label="Anterior"
                className="h-8 w-6 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                disabled={safeIndex === totalCount - 1}
                aria-label="Próximo"
                className="h-8 w-6 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
