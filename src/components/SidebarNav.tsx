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
  Lock
} from "lucide-react";

type Props = {
  isOwnerOrAdmin: boolean;
  hasAccountsPayable?: boolean;
  hasGrowthDashboard?: boolean;
};

export default function SidebarNav({ isOwnerOrAdmin, hasAccountsPayable = false, hasGrowthDashboard = false }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const abaParam = searchParams.get("aba");
  const isFinanceiroActive = pathname.startsWith("/dashboard/financeiro");

  const navItems = [
    { href: "/dashboard", label: "Agenda", icon: Calendar },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/config/horarios", label: "Meus Horários", icon: Clock },
  ];

  const adminItems = [
    { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
    { href: "/dashboard/produtos", label: "Produtos", icon: Package },
    { href: "/dashboard/equipe", label: "Equipe", icon: Users },
    { href: "/dashboard/assinatura", label: "Minha Assinatura", icon: CreditCard },
    { href: "/dashboard/config", label: "Configurações", icon: Settings },
  ];

  const allItems = isOwnerOrAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
      {/* Agenda sempre primeiro */}
      {allItems.filter(i => i.href === "/dashboard").map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/financeiro"
                  ? "text-white font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BarChart2 size={15} /> Extrato / Visão Geral
            </Link>

            {hasAccountsPayable ? (
              <>
                <Link
                  href="/dashboard/financeiro/contas?aba=pagar"
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 cursor-not-allowed select-none" title="Disponível no Plano Máquina de Corte">
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === "/dashboard/visao-negocio"
                ? "text-white bg-primary shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart2 size={20} /> Visão do Negócio
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed select-none" title="Disponível no Plano Tesoura de Ouro">
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
    </nav>
  );
}
