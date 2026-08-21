import { ReactNode } from "react";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Package, 
  Settings, 
  LogOut, 
  Scissors,
  Crown,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { doLogout } from "@/app/actions/auth";
import SidebarNav from "@/components/SidebarNav";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileSidebarWrapper } from "@/components/layouts/MobileSidebarWrapper";

export default async function BarberLayout({ children }: { children: ReactNode }) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isOwnerOrAdmin = role === 'OWNER' || isSuperAdmin;

    if (!session?.user?.id) {
      throw new Error("Sessão inválida ou sem ID de usuário.");
    }

    // Buscar o Tenant (Barbearia) para pegar a logo e plano
    const userWithTenant = await db.user.findUnique({
      where: { id: session?.user?.id },
      include: {
        units: {
          include: {
            unit: { 
              include: { 
                tenant: {
                  include: {
                    subscription: { include: { plan: true } }
                  }
                } 
              }
            }
          }
        }
      }
    });
    
    const tenant = userWithTenant?.units[0]?.unit?.tenant;
    const plan = tenant?.subscription?.plan;
    const hasAccountsPayable = plan?.has_financial_module ?? false;
    const hasGrowthDashboard = (plan?.max_barbers ?? 0) >= 50;

    if (tenant && !tenant.active) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary p-8 rounded-2xl shadow-xl max-w-md text-center animate-fade-in">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Acesso Suspenso</h1>
            <p className="text-text-secondary text-sm mb-6">
              O acesso da barbearia <strong>{tenant.name}</strong> ao sistema foi temporariamente suspenso. Por favor, entre em contato com o suporte para regularizar a assinatura.
            </p>
            <form action={doLogout}>
              <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover w-full transition-colors">
                Sair da Conta
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <NotificationProvider>
        <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
          
          <MobileSidebarWrapper 
            headerChildren={
              <div className="flex items-center gap-2.5">
                {isSuperAdmin && (
                  <Link 
                    href="/super-admin"
                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-600/30"
                  >
                    👑 Admin
                  </Link>
                )}
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-white p-0.5" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                    <Scissors size={14} />
                  </div>
                )}
                <span className="text-sm font-display font-bold text-white truncate max-w-[120px]">
                  {tenant?.name || 'Painel'}
                </span>
                <NotificationBell />
              </div>
            }
          >
            {/* Sidebar do Barbeiro */}
            <div className="w-full h-full bg-[#0F172A] flex flex-col shadow-2xl md:border-r md:border-slate-800 relative z-[60]">
              <div className="p-6 hidden md:flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  {tenant?.logo_url ? (
                    <img src={tenant.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white p-1" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                      <Scissors size={20} />
                    </div>
                  )}
                  <span className="text-xl font-display font-bold text-white truncate">
                    {tenant?.name || 'Painel'}
                  </span>
                </div>
                <NotificationBell />
              </div>
              
              <SidebarNav 
                isOwnerOrAdmin={isOwnerOrAdmin} 
                isSuperAdmin={isSuperAdmin}
                hasAccountsPayable={hasAccountsPayable} 
                hasGrowthDashboard={hasGrowthDashboard} 
              />

              <div className="p-4 border-t border-slate-800 mt-auto">
                <form action={doLogout}>
                  <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors">
                    <LogOut size={20} /> Sair
                  </button>
                </form>
              </div>
            </div>
          </MobileSidebarWrapper>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0 w-full">
            {/* Banner Superior Destaque para Super Admin */}
            {isSuperAdmin && (
              <div className="mb-6 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md animate-fade-in">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
                    <Crown size={22} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Modo Super Admin Ativo
                      </span>
                      <span className="text-xs text-slate-400 hidden md:inline">• Visualizando Barbearia</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Você está visualizando a barbearia como Administrador Master da Plataforma.
                    </p>
                  </div>
                </div>
                <Link
                  href="/super-admin"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all hover:scale-[1.03] active:scale-[0.98] shrink-0 border border-amber-400/40 group"
                >
                  <ShieldAlert size={16} className="group-hover:rotate-12 transition-transform" />
                  <span>👑 Acessar Painel Super Admin</span>
                </Link>
              </div>
            )}
            {children}
          </main>
        </div>
      </NotificationProvider>
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-danger bg-danger/10 rounded-lg border border-danger/20 font-mono text-sm max-w-5xl mx-auto overflow-auto">
        <h1 className="text-xl font-bold mb-4">CRASH NO LAYOUT</h1>
        <pre>{error.message}</pre>
        <pre className="mt-4 opacity-70">{error.stack}</pre>
      </div>
    );
  }
}
