import { ReactNode } from "react";
import { 
  Building, 
  BarChart, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Scissors,
  Crown
} from "lucide-react";
import { auth } from "@/auth";
import { doLogout } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SuperAdminSidebarNav from "./SuperAdminSidebarNav";
import { MobileSidebarWrapper } from "@/components/layouts/MobileSidebarWrapper";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  
  if (role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      <MobileSidebarWrapper
        headerChildren={
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-700 shadow-sm"
            >
              <Scissors size={12} className="text-primary" />
              Barbearia
            </Link>
            <Image src="/logo_88barber.jpg" alt="88barber" width={110} height={32} className="w-auto h-7 object-contain mix-blend-lighten" />
            <span className="text-xs font-display font-bold text-red-500 uppercase tracking-wider">
              Admin
            </span>
          </div>
        }
      >
        {/* Sidebar do Super Admin */}
        <div className="w-full h-full bg-black flex flex-col shadow-2xl md:border-r md:border-secondary/20">
          <div className="p-6 hidden md:flex flex-col items-start gap-1">
            <Image src="/logo_88barber.jpg" alt="88barber" width={180} height={50} className="w-auto h-12 object-contain mix-blend-lighten" />
            <div className="flex items-center gap-1.5 mt-2">
              <Crown size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-display font-bold text-red-500 uppercase tracking-widest">
                Painel Super Admin
              </span>
            </div>
          </div>
          
          <SuperAdminSidebarNav />

          <div className="mt-auto p-4 border-t border-slate-800">
            <form action={doLogout}>
              <button type="submit" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all w-full text-left font-bold text-sm">
                <LogOut size={18} /> Sair
              </button>
            </form>
          </div>
        </div>
      </MobileSidebarWrapper>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
        {/* Header Superior Desktop */}
        <header className="hidden md:flex justify-between items-center px-8 py-5 border-b border-secondary/20 bg-surface/30 backdrop-blur-sm">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all hover:scale-[1.02] border border-slate-700 shadow-sm group"
            >
              <Scissors size={15} className="text-primary group-hover:rotate-45 transition-transform" />
              <span>Ver Painel da Barbearia</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{session?.user?.name}</p>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-end gap-1">
                <Crown size={11} className="fill-amber-400" /> Super Admin
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white font-bold border border-secondary shadow-md shadow-red-500/20">
              {session?.user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
