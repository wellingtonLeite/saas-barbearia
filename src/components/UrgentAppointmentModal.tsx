"use client";

import React, { useState } from "react";
import { 
  BellRing, 
  CheckCircle2, 
  User, 
  Scissors, 
  Clock, 
  Sparkles, 
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
    clientName: message.length > 40 ? `${message.substring(0, 40)}...` : message,
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
      aria-label="Alerta de Novo Agendamento SDR"
      className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[400px] pointer-events-auto"
    >
      {/* Floating Island Card */}
      <div className="relative bg-[#111318]/95 backdrop-blur-xl border border-emerald-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.25)] rounded-2xl p-4 text-white animate-in slide-in-from-top-4 duration-300 transition-all">
        {/* Subtle Top Glowing Line */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full mb-3 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          {/* Neon Point + Bell Icon + Title */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <BellRing size={14} className="animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1 font-display">
              <span>🚨</span>
              <span>Novo Agendamento SDR</span>
            </h3>
          </div>

          {/* Sound Active Indicator */}
          <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full animate-pulse shrink-0">
            <Volume2 size={11} className="animate-bounce shrink-0" />
            <span>Som Ativo</span>
          </div>
        </div>

        {/* Multiple Appointments Compact Counter */}
        {totalCount > 1 && (
          <div className="mt-2.5 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong className="text-emerald-400">{safeIndex + 1}</strong> de <strong>{totalCount}</strong> pendentes
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={safeIndex === 0}
                aria-label="Agendamento anterior"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                disabled={safeIndex === totalCount - 1}
                aria-label="Próximo agendamento"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Clean and Compact Details Card */}
        <div className="mt-2.5 bg-[#161a22]/90 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 space-y-1.5 text-xs">
          {/* Cliente */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <User size={13} className="text-slate-400" />
              <span>Cliente:</span>
            </div>
            <span className="font-bold text-white truncate max-w-[210px] text-right">
              {details.clientName}
            </span>
          </div>

          {/* Serviço */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <Scissors size={13} className="text-emerald-400" />
              <span>Serviço:</span>
            </div>
            <span className="font-bold text-emerald-400 truncate max-w-[210px] text-right">
              {details.serviceName}
            </span>
          </div>

          {/* Barbeiro & Horário */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1 text-slate-300 truncate max-w-[150px]">
              <Sparkles size={11} className="text-amber-400 shrink-0" />
              <span className="truncate">{details.barberName}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-300 font-medium shrink-0">
              <Clock size={11} className="text-cyan-400 shrink-0" />
              <span>{details.dateTime}</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-3 space-y-2">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleConfirmSingle}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} className="stroke-[2.5]" />
                <span>Estou Ciente</span>
              </>
            )}
          </button>

          {/* Confirm All Button if Multiple */}
          {totalCount > 1 && (
            <button
              type="button"
              onClick={handleConfirmAll}
              disabled={isProcessing}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck size={14} className="text-emerald-400" />
              <span>Confirmar todos ({totalCount})</span>
            </button>
          )}

          {/* Quick Mute helper */}
          <div className="flex items-center justify-center pt-0.5">
            <button
              type="button"
              onClick={() => onStopSound()}
              className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Silenciar som
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
