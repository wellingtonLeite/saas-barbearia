import { ReactNode } from "react";
import { 
  Building, 
  BarChart, 
  Settings,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuperAdminSidebarNav from "./SuperAdminSidebarNav";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  
  if (role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar do Super Admin */}
      <div className="w-64 bg-black flex flex-col shadow-2xl z-20 border-r border-secondary/20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
            <ShieldAlert size={20} />
          </div>
          <span className="text-xl font-display font-bold text-white truncate uppercase tracking-wider text-sm">
            Super Admin
          </span>
        </div>
        
        <SuperAdminSidebarNav />

        <div className="mt-auto p-4 border-t border-slate-800">
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({ redirectTo: "/" });
          }}>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all w-full text-left font-bold">
              <LogOut size={20} /> Sair
            </button>
          </form>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{session?.user?.name}</p>
              <p className="text-xs text-text-secondary uppercase">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-secondary">
              {session?.user?.name?.charAt(0)}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
