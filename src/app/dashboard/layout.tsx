import { ReactNode } from "react";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Package,
  Settings,
  LogOut,
  Scissors
} from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { doLogout } from "@/app/actions/auth";
import SidebarNav from "@/components/SidebarNav";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileSidebarWrapper } from "@/components/layouts/MobileSidebarWrapper";

export default async function BarberLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

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
  const hasAccountsPayable = (plan?.max_barbers ?? 0) >= 10;
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
            <div className="flex items-center gap-3">
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
            
            <SidebarNav isOwnerOrAdmin={isOwnerOrAdmin} hasAccountsPayable={hasAccountsPayable} hasGrowthDashboard={hasGrowthDashboard} />

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
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
