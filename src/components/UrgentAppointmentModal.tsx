"use client";

import React, { useState } from "react";
import { 
  BellRing, 
  CheckCircle2, 
  User, 
  Scissors, 
  Clock, 
  Sparkles, 
  Calendar, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  CheckCheck
} from "lucide-react";
import type { Notification } from "@/generated/prisma/client";

interface UrgentAppointmentModalProps {
  notifications: Notification[];
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
      await onAcknowledge([currentNotif.id]);
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
      const allIds = notifications.map((n) => n.id);
      await onAcknowledge(allIds);
    } catch (err) {
      console.error("Erro ao confirmar todos os agendamentos:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Background Animated Pulse Glow */}
      <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-[280px] h-[280px] bg-teal-500/15 rounded-full blur-2xl pointer-events-none -top-10 -right-10" />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0c1017]/95 border-2 border-emerald-500/80 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.45)] overflow-hidden transition-all duration-300 transform animate-slide-up">
        {/* Neon Light Strip on Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Pulsing Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Alerta em Tempo Real</span>
            </div>

            {/* Sound Wave Indicator */}
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full animate-pulse">
              <Volume2 size={14} className="animate-bounce" />
              <span>Som Ativo</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <BellRing size={26} className="animate-pulse text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
                🚨 NOVO AGENDAMENTO RECEBIDO!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Um novo cliente realizou agendamento. Confirme para silenciar o alarme sonoro.
              </p>
            </div>
          </div>

          {/* Badge de Múltiplos Agendamentos */}
          {totalCount > 1 && (
            <div className="mt-4 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Agendamento <strong>{safeIndex + 1}</strong> de <strong>{totalCount}</strong> pendentes
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={safeIndex === 0}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                  disabled={safeIndex === totalCount - 1}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Details Card */}
        <div className="px-6 sm:px-7 py-2">
          <div className="bg-[#141b26]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner backdrop-blur-sm">
            {/* Cliente */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs font-semibold">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <User size={16} />
                </div>
                <span>CLIENTE</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide text-right">
                {details.clientName}
              </span>
            </div>

            {/* Serviço */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs font-semibold">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Scissors size={16} />
                </div>
                <span>SERVIÇO</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-emerald-400 tracking-wide text-right">
                {details.serviceName}
              </span>
            </div>

            {/* Barbeiro */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs font-semibold">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Sparkles size={16} />
                </div>
                <span>BARBEIRO</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-amber-300 tracking-wide text-right">
                {details.barberName}
              </span>
            </div>

            {/* Horário */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs font-semibold">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Clock size={16} />
                </div>
                <span>HORÁRIO</span>
              </div>
              <span className="text-sm sm:text-base font-black text-cyan-300 tracking-wide text-right flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400/80" />
                {details.dateTime}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-6 sm:p-7 pt-4 space-y-3">
          {/* Main Action Button - Neon Emerald Glow */}
          <button
            type="button"
            onClick={handleConfirmSingle}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} className="stroke-[2.5] group-hover:scale-110 transition-transform" />
                <span>ESTOU CIENTE / ACEITAR AGENDAMENTO</span>
              </>
            )}
          </button>

          {/* Confirm All Button if Multiple */}
          {totalCount > 1 && (
            <button
              type="button"
              onClick={handleConfirmAll}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck size={16} className="text-emerald-400" />
              <span>Confirmar todos os {totalCount} agendamentos de uma vez</span>
            </button>
          )}

          {/* Quick Mute Helper */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => onStopSound()}
              className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Silenciar apenas o som
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
