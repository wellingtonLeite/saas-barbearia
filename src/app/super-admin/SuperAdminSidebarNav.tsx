"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart, 
  Building,
  Settings
} from "lucide-react";

export default function SuperAdminSidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/super-admin", label: "Visão Geral", icon: BarChart },
    { href: "/super-admin/tenants", label: "Barbearias", icon: Building },
    { href: "/super-admin/planos", label: "Planos", icon: Settings },
  ];

  return (
    <nav className="flex-1 px-4 space-y-2 mt-4">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href));
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? "text-white bg-red-600 shadow-lg shadow-red-600/20 hover:scale-[1.02]" 
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
