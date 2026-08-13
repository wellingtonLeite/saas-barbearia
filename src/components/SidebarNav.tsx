"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Package,
  Settings,
  Scissors,
  Clock
} from "lucide-react";

export default function SidebarNav({ isOwnerOrAdmin }: { isOwnerOrAdmin: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Agenda", icon: Calendar },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
    { href: "/dashboard/config/horarios", label: "Meus Horários", icon: Clock },
  ];

  const adminItems = [
    { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
    { href: "/dashboard/produtos", label: "Produtos", icon: Package },
    { href: "/dashboard/equipe", label: "Equipe", icon: Users },
    { href: "/dashboard/config", label: "Configurações", icon: Settings },
  ];

  const allItems = isOwnerOrAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <nav className="flex-1 px-4 space-y-2 mt-4">
      {allItems.map(item => {
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? "text-white bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02]" 
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
