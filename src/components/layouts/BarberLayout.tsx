"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Scissors, 
  Settings, 
  Menu, 
  X,
  Bell,
  Crown,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Serviços", href: "/services", icon: Scissors },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function BarberLayout({ 
  children,
  isSuperAdmin = false 
}: { 
  children: React.ReactNode;
  isSuperAdmin?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-background flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between bg-surface p-4 border-b border-secondary">
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-primary">BarberPro</span>
          {isSuperAdmin && (
            <Link
              href="/super-admin"
              className="px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] uppercase tracking-wider shadow-sm"
            >
              👑 ADMIN
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-text-primary">
            <Bell size={24} />
          </button>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text-primary"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-secondary transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6">
          <span className="text-2xl font-display font-bold text-primary">BarberPro</span>
          <button 
            className="md:hidden text-text-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Super Admin Highlight in Sidebar */}
        {isSuperAdmin && (
          <div className="px-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Crown size={12} className="fill-amber-400" />
                  SaaS Master
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white tracking-widest">
                  ADMIN
                </span>
              </div>
              <Link
                href="/super-admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow transition-all hover:scale-[1.02]"
              >
                <ShieldAlert size={14} />
                Painel Super Admin
              </Link>
            </div>
          </div>
        )}

        <nav className="mt-2 px-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary hover:bg-secondary/50 hover:text-text-primary"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-6 border-b border-secondary">
          <div>
            {isSuperAdmin && (
              <Link
                href="/super-admin"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-red-600/30 transition-all hover:scale-[1.02]"
              >
                <Crown size={14} className="fill-white" />
                👑 Acessar Painel Super Admin
              </Link>
            )}
          </div>
          <button className="text-text-secondary hover:text-text-primary relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background"></span>
          </button>
        </header>
        
        <div className="p-4 md:p-8">
          {isSuperAdmin && (
            <div className="mb-6 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
                  <Crown size={20} className="fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      👑 Super Admin Conectado
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Você está no modo Gestão de Barbearia. Clique ao lado para voltar ao painel master.
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] shrink-0 border border-amber-400/30"
              >
                <ShieldAlert size={16} />
                👑 Acessar Painel Super Admin
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
