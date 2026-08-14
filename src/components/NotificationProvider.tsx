"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import type { Notification } from "@/generated/prisma/client";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioNotifRef = useRef<HTMLAudioElement | null>(null);
  const audioApptRef = useRef<HTMLAudioElement | null>(null);
  const previousUnreadRef = useRef(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        
        const newUnreadCount = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(newUnreadCount);

        // Se o número de não lidas for maior que o anterior, significa que chegou mensagem nova
        if (newUnreadCount > previousUnreadRef.current) {
          const latestUnread = data.find((n: Notification) => !n.is_read);
          const isAppt = latestUnread?.type === 'APPOINTMENT_REMINDER' || latestUnread?.type === 'NEW_APPOINTMENT';
          playNotificationSound(isAppt);
        }
        previousUnreadRef.current = newUnreadCount;
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const playNotificationSound = (isAppt = false) => {
    const audio = isAppt ? audioApptRef.current : audioNotifRef.current;
    if (audio) {
      audio.volume = 0.5; // Som suave
      audio.play().catch(e => console.warn("Auto-play blocked by browser. User needs to interact first.", e));
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids }),
      });
      // Atualizar estado local otimisticamente
      setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      previousUnreadRef.current = Math.max(0, previousUnreadRef.current - ids.length);
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  useEffect(() => {
    // Inicializa o áudio
    audioNotifRef.current = new Audio("/sounds/notification.mp3");
    audioApptRef.current = new Audio("/sounds/appointment.mp3");

    // Fetch inicial
    fetchNotifications();

    // Polling a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
