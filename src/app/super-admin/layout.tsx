import { ReactNode } from "react";
import { 
  Building, 
  BarChart, 
  Settings,
  LogOut,
  ShieldAlert
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
            <Image src="/logo_navalha88.jpg" alt="Navalha88" width={140} height={40} className="w-auto h-10 object-contain mix-blend-lighten" />
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider text-primary">
              Admin
            </span>
          </div>
        }
      >
        {/* Sidebar do Super Admin */}
        <div className="w-full h-full bg-black flex flex-col shadow-2xl md:border-r md:border-secondary/20">
          <div className="p-6 hidden md:flex flex-col items-start gap-2">
            <Image src="/logo_navalha88.jpg" alt="Navalha88" width={180} height={50} className="w-auto h-14 object-contain mix-blend-lighten" />
            <span className="text-xs font-display font-bold text-primary uppercase tracking-wider mt-1 ml-1">
              Painel Admin
            </span>
          </div>
          
          <SuperAdminSidebarNav />

          <div className="mt-auto p-4 border-t border-slate-800">
            <form action={doLogout}>
              <button type="submit" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all w-full text-left font-bold">
                <LogOut size={20} /> Sair
              </button>
            </form>
          </div>
        </div>
      </MobileSidebarWrapper>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
        {/* Header Superior Desktop */}
        <header className="hidden md:flex justify-end items-center p-6 border-b border-secondary/20">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{session?.user?.name}</p>
              <p className="text-xs text-text-secondary uppercase">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-secondary">
              {session?.user?.name?.charAt(0)}
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
