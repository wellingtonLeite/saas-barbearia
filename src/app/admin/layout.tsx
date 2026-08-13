import { ReactNode } from "react";
import { 
  BarChart3, 
  Store, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Super Admin Sidebar */}
      <div className="w-64 bg-black border-r border-secondary flex flex-col">
        <div className="p-6">
          <span className="text-xl font-display font-bold text-danger">SuperAdmin SaaS</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/10 text-danger font-medium">
            <BarChart3 size={20} /> Visão Geral
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-secondary/50 transition-colors">
            <Store size={20} /> Barbearias
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-secondary/50 transition-colors">
            <Users size={20} /> Usuários
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-secondary/50 transition-colors">
            <Settings size={20} /> Planos
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
