"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { Notification } from "@/generated/prisma/client";
import { UrgentAppointmentModal, type UrgentAppointmentItem } from "./UrgentAppointmentModal";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  unreadAppointments: UrgentAppointmentItem[];
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  stopSoundLoop: () => void;
  playSoundLoop: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  unreadAppointments: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  stopSoundLoop: () => {},
  playSoundLoop: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const audioNotifRef = useRef<HTMLAudioElement | null>(null);
  const audioApptRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAlarmPlayingRef = useRef<boolean>(false);
  const previousUnreadRef = useRef<number>(0);
  const userInteractedRef = useRef<boolean>(false);

  // Web Audio API Synthesizer - Chime / Sino harmônico de alta qualidade (fallback e reforço sonoro)
  const playSynthChime = useCallback(() => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtxClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Tríade brilhante de sino de notificação (D5, F#5, A5, D6)
      const chord = [
        { freq: 587.33, start: 0, dur: 0.8, gainVal: 0.2 },
        { freq: 739.99, start: 0.08, dur: 0.8, gainVal: 0.25 },
        { freq: 880.0, start: 0.16, dur: 0.9, gainVal: 0.3 },
        { freq: 1174.66, start: 0.24, dur: 1.2, gainVal: 0.35 },
      ];

      chord.forEach(({ freq, start, dur, gainVal }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch (err) {
      console.warn("[NotificationProvider] Falha ao tocar chime sintético:", err);
    }
  }, []);

  // Parar qualquer som / alarme imediatamente
  const stopSoundLoop = useCallback(() => {
    isAlarmPlayingRef.current = false;

    // Pausar áudio mp3
    if (audioApptRef.current) {
      try {
        audioApptRef.current.pause();
        audioApptRef.current.currentTime = 0;
      } catch (err) {
        console.warn("Erro ao pausar áudio:", err);
      }
    }

    // Cancelar intervalo do sintetizador
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  }, []);

  // Iniciar reprodução de alarme contínuo em loop
  const playSoundLoop = useCallback(() => {
    if (isAlarmPlayingRef.current) return;
    isAlarmPlayingRef.current = true;

    // Tentar tocar arquivo mp3
    if (audioApptRef.current) {
      audioApptRef.current.loop = true;
      audioApptRef.current.volume = 0.9;
      
      const playPromise = audioApptRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[NotificationProvider] Autoplay bloqueado ou falha no mp3, ativando WebAudio synth:", err);
          // Fallback para sintetizador Web Audio com repetição a cada 2.5s
          playSynthChime();
          if (!synthIntervalRef.current) {
            synthIntervalRef.current = setInterval(() => {
              if (isAlarmPlayingRef.current) {
                playSynthChime();
              }
            }, 2500);
          }
        });
      }
    } else {
      // Fallback puro sintetizador
      playSynthChime();
      if (!synthIntervalRef.current) {
        synthIntervalRef.current = setInterval(() => {
          if (isAlarmPlayingRef.current) {
            playSynthChime();
          }
        }, 2500);
      }
    }
  }, [playSynthChime]);

  // Tocar som pontual para notificações normais
  const playSingleNotificationSound = useCallback(() => {
    if (audioNotifRef.current) {
      audioNotifRef.current.volume = 0.5;
      audioNotifRef.current.play().catch(() => {
        playSynthChime();
      });
    } else {
      playSynthChime();
    }
  }, [playSynthChime]);

  // Buscar notificações da API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data: Notification[] = await res.json();
      setNotifications(data);

      const unreadList = data.filter((n) => !n.is_read);
      const newUnreadCount = unreadList.length;
      setUnreadCount(newUnreadCount);

      const unreadAppointmentsList = unreadList.filter(
        (n) => n.type === "NEW_APPOINTMENT"
      );

      // Se há novos agendamentos não lidos, aciona o som contínuo
      if (unreadAppointmentsList.length > 0) {
        playSoundLoop();
      } else {
        // Se não há agendamentos não lidos, para o alarme
        if (isAlarmPlayingRef.current) {
          stopSoundLoop();
        }

        // Se chegaram outras notificações que não são agendamento
        if (newUnreadCount > previousUnreadRef.current) {
          playSingleNotificationSound();
        }
      }

      previousUnreadRef.current = newUnreadCount;
    } catch (error) {
      console.error("[NotificationProvider] Falha ao sincronizar notificações:", error);
    }
  }, [playSoundLoop, stopSoundLoop, playSingleNotificationSound]);

  // Marcar como lida
  const markAsRead = useCallback(
    async (ids: string[]) => {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: ids }),
        });

        // Atualizar estado local otimisticamente
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
        );

        setUnreadCount((prev) => Math.max(0, prev - ids.length));
        previousUnreadRef.current = Math.max(0, previousUnreadRef.current - ids.length);

        // Se não restar nenhum NEW_APPOINTMENT não lido, para o alarme
        setNotifications((currentNotifs) => {
          const remainingUnreadAppts = currentNotifs.filter(
            (n) => !n.is_read && !ids.includes(n.id) && n.type === "NEW_APPOINTMENT"
          );
          if (remainingUnreadAppts.length === 0) {
            stopSoundLoop();
          }
          return currentNotifs;
        });
      } catch (error) {
        console.error("[NotificationProvider] Erro ao marcar como lido:", error);
      }
    },
    [stopSoundLoop]
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      stopSoundLoop();
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead, stopSoundLoop]);

  // Lista de agendamentos pendentes de confirmação com deduplicação inteligente por mensagem/conteúdo
  const unreadAppointments = useMemo<UrgentAppointmentItem[]>(() => {
    const rawUnread = notifications.filter(
      (n) => !n.is_read && n.type === "NEW_APPOINTMENT"
    );

    const map = new Map<string, UrgentAppointmentItem>();
    for (const notif of rawUnread) {
      // Normalização da chave de agrupamento por título e mensagem
      const key = `${notif.title || ""}_${notif.message || ""}`.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...notif, allIds: [notif.id] });
      } else {
        if (!existing.allIds) {
          existing.allIds = [existing.id];
        }
        existing.allIds.push(notif.id);
      }
    }

    return Array.from(map.values());
  }, [notifications]);

  // Inicialização de áudio e desbloqueio por interação do usuário
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioNotifRef.current = new Audio("/sounds/notification.mp3");
      audioApptRef.current = new Audio("/sounds/appointment.mp3");

      // Listener para desbloquear WebAudio e retomar áudio se necessário
      const handleUserInteraction = () => {
        userInteractedRef.current = true;
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {});
        }
        // Se havia um alarme pendente bloqueado, tocar agora
        if (isAlarmPlayingRef.current && audioApptRef.current && audioApptRef.current.paused) {
          audioApptRef.current.play().catch(() => {});
        }
      };

      window.addEventListener("click", handleUserInteraction, { passive: true });
      window.addEventListener("keydown", handleUserInteraction, { passive: true });
      window.addEventListener("touchstart", handleUserInteraction, { passive: true });

      // Polling rápido: 4 segundos (para tempo real com SDR)
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000);

      return () => {
        clearInterval(interval);
        window.removeEventListener("click", handleUserInteraction);
        window.removeEventListener("keydown", handleUserInteraction);
        window.removeEventListener("touchstart", handleUserInteraction);
        stopSoundLoop();
      };
    }
  }, [fetchNotifications, stopSoundLoop]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadAppointments,
        markAsRead,
        markAllAsRead,
        stopSoundLoop,
        playSoundLoop,
      }}
    >
      {children}

      {/* Floating Island / Toast Urgente de Novo Agendamento (não intrusivo, canto superior direito) */}
      {unreadAppointments.length > 0 && (
        <UrgentAppointmentModal
          notifications={unreadAppointments}
          onAcknowledge={markAsRead}
          onStopSound={stopSoundLoop}
        />
      )}
    </NotificationContext.Provider>
  );
}
