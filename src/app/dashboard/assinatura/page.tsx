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
          Gerencie seu plano no SaaS Navalha88.
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

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-background/50 p-4 rounded-xl border border-secondary">
                <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                  <CalendarDays size={14} /> Ciclo Atual
                </p>
                <p className="text-lg font-medium text-text-primary">
                  Início: <span className="font-bold">{formatDate(subscription?.createdAt)}</span>
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl border border-secondary">
                <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} /> Vencimento
                </p>
                <p className="text-lg font-medium text-text-primary">
                  Termina em: <span className="font-bold text-primary">{formatDate(subscription?.current_period_end)}</span>
                </p>
              </div>
            </div>

            {Number(plan?.base_price) === 0 ? (
              <a 
                href={`https://wa.me/5511999999999?text=Olá, sou da barbearia ${tenant.name} e gostaria de consultar as condições do ${plan?.name}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle size={20} /> Falar com Consultor (Sob Consulta)
              </a>
            ) : (
              <form action={createCheckoutSession} className="flex flex-col sm:flex-row gap-4">
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="planId" value={plan?.id || ""} />
                <button 
                  type="submit"
                  disabled={!plan}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <CreditCard size={20} />
                  Pagar com Mercado Pago
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
                  Módulo Financeiro Avançado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

