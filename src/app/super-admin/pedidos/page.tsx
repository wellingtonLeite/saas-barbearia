import { db } from "@/lib/db";
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Building, 
  Search, 
  ShieldCheck, 
  Zap,
  Filter
} from "lucide-react";
import { OrderStatusActions } from "./order-status-actions";

export const metadata = {
  title: "Pedidos & Assinaturas (Admin) | 88Barber",
};

export default async function AdminOrdersPage() {
  // Buscar todas as assinaturas com seus tenants, donos e planos
  const subscriptions = await db.subscription.findMany({
    include: {
      tenant: {
        include: {
          units: {
            include: {
              barbers: {
                where: { barber: { role: "OWNER" } },
                include: { barber: true }
              }
            }
          }
        }
      },
      plan: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Buscar todos os planos disponíveis para o seletor
  const allPlans = await db.plan.findMany({
    orderBy: { base_price: "asc" }
  });

  // Estatísticas Rápidas
  const totalOrders = subscriptions.length;
  const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;
  const pendingCount = subscriptions.filter(s => s.status === "PAST_DUE" || s.status === "TRIAL").length;
  const totalMRR = subscriptions
    .filter(s => s.status === "ACTIVE")
    .reduce((acc, s) => acc + Number(s.plan.base_price || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-secondary/40">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <ShoppingBag className="text-primary" size={26} /> Pedidos & Assinaturas
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Gerencie os pedidos, altere status manualmente e aprove acessos para testes (estilo WooCommerce).
          </p>
        </div>
      </div>

      {/* Banner Informativo de Homologação */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-text-secondary flex items-start gap-3 shadow-sm">
        <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-text-primary text-sm">Painel de Controle Manual de Pedidos</p>
          <p className="mt-0.5 leading-relaxed">
            Aqui você pode alterar o status do pedido (Pendente, Aprovado, Teste, Cancelado) ou mudar o plano da barbearia manualmente para homologação. 
            Em produção, a confirmação de pagamento e a renovação de 30 dias ocorrem de forma 100% automática via Webhook do Mercado Pago.
          </p>
        </div>
      </div>

      {/* Cards de Métricas em Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-secondary rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-text-secondary font-medium">Total de Pedidos</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{totalOrders}</p>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-text-secondary font-medium">Assinaturas Ativas</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-text-secondary font-medium">Aguardando Pagamento</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-surface border border-secondary rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-text-secondary font-medium">MRR Ativo (Mensalidade)</span>
          <p className="text-2xl font-bold text-primary mt-1">R$ {totalMRR.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-secondary/50 flex justify-between items-center">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <Filter size={16} className="text-primary" /> Lista de Pedidos & Assinaturas ({subscriptions.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/60 text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-secondary/50">
              <tr>
                <th className="py-3.5 px-4">Barbearia / Dono</th>
                <th className="py-3.5 px-4">Plano Atual</th>
                <th className="py-3.5 px-4">Valor</th>
                <th className="py-3.5 px-4">Data / Vencimento</th>
                <th className="py-3.5 px-4">Status & Ações Manuais (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/40">
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}

              {subscriptions.map((sub) => {
                const tenant = sub.tenant;
                const owner = tenant.units?.[0]?.barbers?.[0]?.barber;
                const plan = sub.plan;
                const price = Number(plan.base_price || 0);

                return (
                  <tr key={sub.id} className="hover:bg-surface-hover transition-colors">
                    
                    {/* Barbearia & Dono */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                          <Building size={14} className="text-primary" /> {tenant.name}
                        </div>
                        <p className="text-[11px] text-text-secondary font-mono">/{tenant.slug}</p>
                        
                        {owner && (
                          <div className="mt-1 text-[11px] text-text-secondary">
                            <span>Dono: <strong>{owner.name}</strong></span>
                            <span className="block text-[10px] opacity-80">{owner.email} {owner.phone ? `• ${owner.phone}` : ""}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Plano Atual */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-text-primary">
                        {plan.name}
                      </span>
                    </td>

                    {/* Valor */}
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {price === 0 ? "Grátis (R$ 0)" : `R$ ${price.toFixed(2)}/mês`}
                    </td>

                    {/* Datas */}
                    <td className="py-4 px-4 text-text-secondary">
                      <div>
                        <span>Criado: {new Date(sub.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="block text-[11px] font-medium text-text-primary mt-0.5">
                          Vence: {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>

                    {/* Ações WooCommerce */}
                    <td className="py-4 px-4">
                      <OrderStatusActions
                        subscriptionId={sub.id}
                        currentStatus={sub.status}
                        currentPlanId={sub.planId}
                        plans={allPlans}
                      />
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
