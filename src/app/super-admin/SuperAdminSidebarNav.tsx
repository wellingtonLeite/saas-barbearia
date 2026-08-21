"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart, 
  Building, 
  Settings, 
  CreditCard, 
  Server, 
  ShoppingBag,
  Scissors,
  Crown,
  ChevronRight
} from "lucide-react";
import { useMobileSidebar } from "@/components/layouts/MobileSidebarWrapper";

export default function SuperAdminSidebarNav() {
  const { closeSidebar } = useMobileSidebar();
  const pathname = usePathname();

  const navItems = [
    { href: "/super-admin", label: "Visão Geral", icon: BarChart },
    { href: "/super-admin/pedidos", label: "Pedidos & Assinaturas", icon: ShoppingBag },
    { href: "/super-admin/tenants", label: "Barbearias", icon: Building },
    { href: "/super-admin/planos", label: "Planos", icon: Settings },
    { href: "/super-admin/pagamentos", label: "Pagamentos", icon: CreditCard },
    { href: "/super-admin/infraestrutura", label: "Infraestrutura", icon: Server },
    { href: "/super-admin/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <nav className="flex-1 px-4 space-y-2 mt-4 flex flex-col">
      {/* Indicador de Modo Master */}
      <div className="mb-2 p-3 rounded-2xl bg-gradient-to-br from-red-950/50 via-slate-900 to-black border border-red-500/30 shadow-inner">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crown size={13} className="text-amber-400 fill-amber-400" />
            Controle Master
          </span>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white tracking-widest">
            ATIVO
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Você tem controle total da plataforma SaaS 88Barber.
        </div>
      </div>

      <div className="space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? "text-white bg-red-600 shadow-lg shadow-red-600/25 hover:scale-[1.01]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          );
        })}
      </div>

      {/* Botão de Alternância Rápida para Painel da Barbearia */}
      <div className="mt-auto pt-4 pb-2">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Alternar visualização:</span>
          </div>
          <Link
            href="/dashboard"
            onClick={closeSidebar}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all group border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <Scissors size={15} className="text-primary group-hover:rotate-45 transition-transform" />
              <span>Painel Barbearia</span>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
