"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Package,
  Settings,
  Scissors,
  Clock,
  CreditCard,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  BarChart2,
  Lock,
  ShoppingBag,
  Gift,
  Bot,
  MessageSquare,
  Calculator,
  Target,
  Crown,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useMobileSidebar } from "./layouts/MobileSidebarWrapper";

type Props = {
  isOwnerOrAdmin: boolean;
  isSuperAdmin?: boolean;
  hasAccountsPayable?: boolean;
  hasGrowthDashboard?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: any;
  badge?: string;
};

export default function SidebarNav({ 
  isOwnerOrAdmin, 
  isSuperAdmin = false, 
  hasAccountsPayable = false, 
  hasGrowthDashboard = false 
}: Props) {
  const { closeSidebar } = useMobileSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const abaParam = searchParams.get("aba");
  const isFinanceiroActive = pathname.startsWith("/dashboard/financeiro");

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Agenda", icon: Calendar },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/config/horarios", label: "Meus Horários", icon: Clock },
  ];

  const adminItems: NavItem[] = [
    { href: "/dashboard/config/whatsapp", label: "WhatsApp", icon: MessageSquare, badge: "SDR" },
    { href: "/dashboard/comandas", label: "Comandas / PDV", icon: ShoppingBag },
    { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
    { href: "/dashboard/produtos", label: "Produtos", icon: Package },
    { href: "/dashboard/fidelidade", label: "Fidelidade e VIP", icon: Gift },
    { href: "/dashboard/equipe", label: "Equipe", icon: Users },
    { href: "/dashboard/assinatura", label: "Minha Assinatura", icon: CreditCard },
    { href: "/dashboard/config", label: "Configurações", icon: Settings },
  ];

  const allItems: NavItem[] = isOwnerOrAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
      {/* SEÇÃO SUPER ADMIN - Destaque Máximo */}
      {isSuperAdmin && (
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-red-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 shadow-lg shadow-red-950/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Crown size={13} className="text-amber-400 fill-amber-400" />
              SaaS Master
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white tracking-widest shadow-sm border border-amber-400/40">
              SUPER ADMIN
            </span>
          </div>

          <Link
            href="/super-admin"
            onClick={closeSidebar}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert size={16} className="text-white shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="truncate">Painel Super Admin</span>
            </div>
            <ChevronRight size={14} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Ambiente:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gestão Barbearia
            </span>
          </div>
        </div>
      )}

      {/* Agenda sempre primeiro */}
      {allItems.filter(i => i.href === "/dashboard").map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? "text-white bg-primary shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <item.icon size={20} /> {item.label}
          </Link>
        );
      })}

      {/* MENU FINANCEIRO com submenu */}
      <div>
        <Link
          href="/dashboard/financeiro"
          onClick={closeSidebar}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
            isFinanceiroActive
              ? "text-white bg-primary shadow-lg shadow-primary/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <DollarSign size={20} />
          <span className="flex-1">Financeiro</span>
          {isOwnerOrAdmin && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isFinanceiroActive ? "rotate-180" : ""}`}
            />
          )}
        </Link>

        {/* Submenu — expansível quando em /dashboard/financeiro */}
        {isOwnerOrAdmin && isFinanceiroActive && (
          <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
            <Link
              href="/dashboard/financeiro"
              onClick={closeSidebar}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/financeiro"
                  ? "text-white font-medium bg-slate-800"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BarChart2 size={15} /> Extrato / Visão Geral
            </Link>

            <Link
              href="/dashboard/financeiro/projecao"
              onClick={closeSidebar}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/financeiro/projecao"
                  ? "text-emerald-400 font-medium bg-slate-800"
                  : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
              }`}
            >
              <TrendingUp size={15} className="text-emerald-400" /> Projeção de Caixa
            </Link>

            <Link
              href="/dashboard/financeiro/rentabilidade"
              onClick={closeSidebar}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/financeiro/rentabilidade"
                  ? "text-amber-400 font-medium bg-slate-800"
                  : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
              }`}
            >
              <Target size={15} className="text-amber-400" /> Rentabilidade / BCG
            </Link>

            <Link
              href="/dashboard/financeiro/dre"
              onClick={closeSidebar}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/financeiro/dre"
                  ? "text-primary font-medium bg-slate-800"
                  : "text-slate-400 hover:text-primary hover:bg-slate-800"
              }`}
            >
              <Calculator size={15} className="text-primary" /> DRE Gerencial
            </Link>

            {hasAccountsPayable ? (
              <>
                <Link
                  href="/dashboard/financeiro/contas?aba=pagar"
                  onClick={closeSidebar}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    pathname === "/dashboard/financeiro/contas" && abaParam !== "receber"
                      ? "text-red-400 font-medium bg-slate-800"
                      : "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                  }`}
                >
                  <TrendingDown size={15} className="text-red-400" /> Contas a Pagar
                </Link>
                <Link
                  href="/dashboard/financeiro/contas?aba=receber"
                  onClick={closeSidebar}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    pathname === "/dashboard/financeiro/contas" && abaParam === "receber"
                      ? "text-green-400 font-medium bg-slate-800"
                      : "text-slate-400 hover:text-green-400 hover:bg-slate-800"
                  }`}
                >
                  <TrendingUp size={15} className="text-green-400" /> Contas a Receber
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 cursor-not-allowed select-none" title="Disponível no Plano VIP">
                <Lock size={13} className="text-slate-600" />
                <span>Contas a Pagar/Receber</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visão do Negócio */}
      {isOwnerOrAdmin && (
        hasGrowthDashboard ? (
          <Link
            href="/dashboard/visao-negocio"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === "/dashboard/visao-negocio"
                ? "text-white bg-primary shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart2 size={20} /> Visão do Negócio
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed select-none" title="Disponível apenas em planos superiores">
            <Lock size={16} className="text-slate-600" />
            <div className="flex-1 flex items-center justify-between">
              <span>Visão do Negócio</span>
            </div>
          </div>
        )
      )}

      {/* Demais itens */}
      {allItems
        .filter(i => i.href !== "/dashboard" && i.href !== "/dashboard/financeiro")
        .map(item => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "text-white bg-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} className={item.badge ? "text-emerald-400 shrink-0" : "shrink-0"} /> 
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.25)] flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
