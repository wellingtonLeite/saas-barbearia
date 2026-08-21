"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationProvider";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Deduplica itens idênticos para exibição limpa no menu
  const displayNotifications = useMemo(() => {
    const seen = new Set<string>();
    return notifications.filter((notif) => {
      const dateKey = notif.createdAt ? new Date(notif.createdAt).toISOString().slice(0, 16) : "";
      const key = `${notif.title}_${notif.message}_${notif.is_read}_${dateKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [notifications]);

  const handleMarkItemAsRead = (targetNotif: typeof notifications[0]) => {
    if (targetNotif.is_read) return;
    // Marca todos os registros duplicados no banco com a mesma mensagem
    const matchingIds = notifications
      .filter((n) => !n.is_read && n.message === targetNotif.message && n.title === targetNotif.title)
      .map((n) => n.id);

    markAsRead(matchingIds.length > 0 ? matchingIds : [targetNotif.id]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir notificações"
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 focus:outline-none"
      >
        <Bell size={24} className={unreadCount > 0 ? "animate-pulse text-amber-400" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-bold text-white text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhuma notificação por aqui.
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {displayNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 transition-colors hover:bg-slate-800 cursor-pointer ${!notif.is_read ? 'bg-slate-800/40' : ''}`}
                    onClick={() => handleMarkItemAsRead(notif)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString('pt-BR')} às {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
