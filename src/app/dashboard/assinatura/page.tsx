import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, AlertTriangle, MessageCircle, CalendarDays, Users, Zap, Crown, Gift, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "@/app/actions/checkout";
import { saveLoyaltyProgram } from "@/app/actions/loyalty";
import { createClientPlan, deleteClientPlan } from "@/app/actions/vip";

export const metadata = {
  title: "Minha Assinatura | SaaS Barbearia",
};

export default async function AssinaturaPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Apenas OWNER e SUPER_ADMIN devem acessar
  if (session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Buscar o Tenant do usuário logado e dados de loyalty/vip
  const userWithTenant = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: {
        include: {
          unit: { 
            include: { 
              tenant: {
                include: {
                  subscription: {
                    include: { plan: true }
                  },
                  loyaltyPrograms: true,
                  clientPlans: true
                }
              } 
            } 
          }
        }
      }
    }
  });

  const tenant = userWithTenant?.units[0]?.unit?.tenant;

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Barbearia não encontrada.</h2>
      </div>
    );
  }

  const { tab = "saas" } = await searchParams;

  const subscription = tenant.subscription;
  const plan = subscription?.plan;
  const loyaltyProgram = tenant.loyaltyPrograms?.[0] || null;
  const clientPlans = tenant.clientPlans || [];

  const plans = await db.plan.findMany({
    orderBy: { base_price: 'asc' }
  });

  // Função para mapear status da assinatura para cores
  const getStatusDisplay = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativa', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
      case 'TRIAL': return { label: 'Em Período de Teste', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Zap };
      case 'PAST_DUE': return { label: 'Atrasada', color: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle };
      case 'CANCELED': return { label: 'Cancelada', color: 'text-text-secondary', bg: 'bg-secondary/30', icon: AlertTriangle };
      default: return { label: 'Sem Assinatura', color: 'text-text-secondary', bg: 'bg-secondary/30', icon: AlertTriangle };
    }
  };

  const statusInfo = getStatusDisplay(subscription?.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in p-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <CreditCard className="text-primary" /> Minha Assinatura
        </h1>
        <p className="text-text-secondary mt-2">
          Gerencie seu plano no SaaS 88barber.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {/* Card Principal: Status da Assinatura */}
        <div className="md:col-span-2 bg-surface border border-secondary rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-glow rounded-full blur-3xl opacity-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-text-secondary text-sm font-medium mb-1">Plano Atual</p>
                <h2 className="text-4xl font-display font-bold text-text-primary">
                  {plan?.name || "Nenhum Plano"}
                </h2>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                <StatusIcon size={18} />
                <span className="font-bold text-sm">{statusInfo.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="bg-background/50 p-4 rounded-xl border border-secondary">
                <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                  <CalendarDays size={14} /> Ciclo da Assinatura
                </p>
                <p className="text-base sm:text-lg font-medium text-text-primary">
                  Início: <span className="font-bold">{formatDate(subscription?.createdAt)}</span>
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl border border-secondary">
                <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} /> Vencimento / Renovação
                </p>
                <p className="text-base sm:text-lg font-medium text-text-primary">
                  {Number(plan?.base_price || 0) === 0 ? (
                    <span className="font-bold text-emerald-400">Gratuito Permanente</span>
                  ) : (
                    <span>Termina em: <strong className="text-primary">{formatDate(subscription?.current_period_end)}</strong></span>
                  )}
                </p>
              </div>
            </div>

            {Number(plan?.base_price) === 0 ? (
              <a 
                href="#opcoes-upgrade"
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-sm"
              >
                <Zap size={18} /> Ver Opções de Upgrade para Barber Pro & VIP
              </a>
            ) : (
              <form action={createCheckoutSession} className="flex flex-col sm:flex-row gap-4">
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="planId" value={plan?.id || ""} />
                <button 
                  type="submit"
                  disabled={!plan}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer text-sm"
                >
                  <CreditCard size={18} />
                  Renovar / Pagar Mensalidade com Mercado Pago
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Card Lateral: Limites do Plano */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-secondary pb-4">
            <Zap size={20} className="text-primary" /> Limites do Plano
          </h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-text-secondary text-sm">Barbeiros</span>
                <span className="text-text-primary font-bold">
                  Até {plan?.max_barbers && plan.max_barbers >= 999 ? 'Ilimitado' : plan?.max_barbers || 0}
                </span>
              </div>
              <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-text-secondary text-sm">Unidades (Filiais)</span>
                <span className="text-text-primary font-bold">
                  Até {plan?.max_units || 1}
                </span>
              </div>
              <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-full" />
              </div>
            </div>

            <div className="pt-4 border-t border-secondary space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan?.has_whatsapp ? 'bg-success/20 text-success' : 'bg-secondary text-text-secondary'}`}>
                  {plan?.has_whatsapp ? <CheckCircle2 size={14} /> : <span className="text-xs">✕</span>}
                </div>
                <span className={`text-sm ${plan?.has_whatsapp ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                  Mensagens via WhatsApp
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan?.has_financial_module ? 'bg-success/20 text-success' : 'bg-secondary text-text-secondary'}`}>
                  {plan?.has_financial_module ? <CheckCircle2 size={14} /> : <span className="text-xs">✕</span>}
                </div>
                <span className={`text-sm ${plan?.has_financial_module ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                  Contas a Pagar / Receber
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="opcoes-upgrade" className="mt-16 mb-8 scroll-mt-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Opções de Upgrade</h2>
        <p className="text-text-secondary">Faça o upgrade para liberar mais recursos e expandir sua barbearia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {plans.filter(p => p.id !== plan?.id).map((p) => (
          <div key={p.id} className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl flex flex-col hover:border-primary/50 transition-colors">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-primary">{p.name}</h3>
              <div className="flex items-end gap-1 mt-2">
                {Number(p.base_price) === 0 ? (
                  <span className="text-3xl font-display font-bold text-primary">Gratuito</span>
                ) : (
                  <>
                    <span className="text-3xl font-display font-bold text-primary">R$ {Number(p.base_price).toFixed(2)}</span>
                    <span className="text-text-secondary text-sm mb-1">/mês</span>
                  </>
                )}
              </div>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={16} className="text-success" />
                  <strong>{p.max_barbers >= 999 ? 'Ilimitados' : p.max_barbers}</strong> Barbeiros na equipe
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={16} className="text-success" />
                  Gestão de Ganhos e Extrato
                </li>
                <li className={`flex items-center gap-2 text-sm ${(p as any).has_whatsapp_sdr ? 'text-emerald-400 font-bold' : 'text-text-secondary'}`}>
                  <CheckCircle2 size={16} className={(p as any).has_whatsapp_sdr ? "text-emerald-400" : "text-success"} />
                  {(p as any).has_whatsapp_sdr ? "Agente IA SDR no WhatsApp (Robô Automático)" : "WhatsApp (Notificações Manuais)"}
                </li>
                <li className={`flex items-center gap-2 text-sm ${p.has_financial_module ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                  <CheckCircle2 size={16} className={p.has_financial_module ? "text-success" : "text-secondary"} />
                  Contas a Pagar / Receber
                </li>
                <li className={`flex items-center gap-2 text-sm ${p.has_loyalty_module ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                  <CheckCircle2 size={16} className={p.has_loyalty_module ? "text-success" : "text-secondary"} />
                  Fidelidade e VIP
                </li>
                <li className={`flex items-center gap-2 text-sm ${p.has_clients_module ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                  <CheckCircle2 size={16} className={p.has_clients_module ? "text-success" : "text-secondary"} />
                  Gestão de Clientes
                </li>
                <li className={`flex items-center gap-2 text-sm ${p.has_products_module ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                  <CheckCircle2 size={16} className={p.has_products_module ? "text-success" : "text-secondary"} />
                  Estoque de Produtos
                </li>
              </ul>
            </div>
            
            <div className="mt-8">
              {Number(p.base_price) === 0 ? (
                <button disabled className="w-full bg-secondary/30 text-text-secondary font-bold py-3 rounded-xl cursor-not-allowed">
                  Plano Gratuito
                </button>
              ) : (
                <form action={createCheckoutSession}>
                  <input type="hidden" name="tenantId" value={tenant.id} />
                  <input type="hidden" name="planId" value={p.id} />
                  <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                    Fazer Upgrade
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

