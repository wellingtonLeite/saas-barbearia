import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Building2, Power, PowerOff, Trash2, AlertTriangle, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { 
  toggleTenantStatusAction, 
  updateSubscriptionAction, 
  deleteTenantPermanentAction 
} from "./actions";

export default async function TenantsPage({ searchParams }: { searchParams: Promise<{ editPlanFor?: string, deleteTenantFor?: string }> }) {
  const resolvedParams = await searchParams;
  const editPlanFor = resolvedParams.editPlanFor;
  const deleteTenantFor = resolvedParams.deleteTenantFor;

  const settings = await db.systemSetting.findUnique({ where: { key: "WHATSAPP_TEMPLATES" } });
  const b2b_billing = (settings?.value as any)?.b2b_billing || "Fala {dono}! Tudo bem? A assinatura do {plano} da {barbearia} está próxima do vencimento. Renove aqui: {link_pagamento}";
  
  const tenants = await db.tenant.findMany({
    include: {
      subscription: {
        include: { plan: true }
      },
      units: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const plans = await db.plan.findMany({ orderBy: { base_price: 'asc' } });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <Building2 className="text-primary" /> Barbearias (Tenants)
        </h1>
        <p className="text-text-secondary mt-2">
          Gerencie o acesso, assinaturas e instâncias de todas as barbearias na sua plataforma.
        </p>
      </div>

      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary bg-surface-hover/50 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Barbearia / Slug</th>
                <th className="py-4 px-6">Plano Atual</th>
                <th className="py-4 px-6">Status Assinatura</th>
                <th className="py-4 px-6">Vencimento</th>
                <th className="py-4 px-6">Acesso</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary text-sm">
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    Nenhuma barbearia cadastrada no sistema.
                  </td>
                </tr>
              )}
              {tenants.map(tenant => {
                const sub = tenant.subscription;
                const plan = sub?.plan;
                const isOverdue = sub?.status === 'PAST_DUE' || (sub?.current_period_end && new Date(sub.current_period_end) < new Date());
                const primaryUnit = tenant.units[0];
                const cleanPhone = primaryUnit?.phone?.replace(/\D/g, "") || "";
                
                // Mensagem de cobrança WhatsApp
                const msg = encodeURIComponent(
                  b2b_billing
                    .replace("{dono}", tenant.name)
                    .replace("{barbearia}", tenant.name)
                    .replace("{plano}", plan?.name || "Plano")
                    .replace("{link_pagamento}", `https://88barber.top/dashboard/assinatura`)
                );
                const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${msg}` : null;

                return (
                  <tr key={tenant.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-text-primary">
                      <div className="flex items-center gap-2">
                        {tenant.name}
                      </div>
                      <span className="text-xs font-normal text-text-secondary font-mono">
                        /{tenant.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
                        {plan?.name || "Sem Plano"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {sub?.status === 'ACTIVE' && <span className="text-success font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Ativo</span>}
                      {sub?.status === 'TRIAL' && <span className="text-primary font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Teste (Trial)</span>}
                      {sub?.status === 'PAST_DUE' && <span className="text-danger font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" /> Em Atraso</span>}
                      {sub?.status === 'CANCELED' && <span className="text-text-secondary font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Cancelado</span>}
                      {!sub && <span className="text-text-secondary">Nenhum</span>}
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {sub?.current_period_end ? (
                        <span className={isOverdue ? "text-danger font-bold" : ""}>
                          {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <form action={toggleTenantStatusAction}>
                        <input type="hidden" name="tenantId" value={tenant.id} />
                        <input type="hidden" name="currentStatus" value={String(tenant.active)} />
                        <button 
                          type="submit" 
                          title={tenant.active ? "Bloquear Acesso" : "Desbloquear Acesso"}
                          className={`p-2 rounded-xl border transition-all ${
                            tenant.active 
                              ? "bg-success/10 text-success border-success/30 hover:bg-danger/20 hover:text-danger hover:border-danger/30" 
                              : "bg-danger/10 text-danger border-danger/30 hover:bg-success/20 hover:text-success hover:border-success/30"
                          }`}
                        >
                          {tenant.active ? <Power size={18} /> : <PowerOff size={18} />}
                        </button>
                      </form>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {waLink && isOverdue && (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Cobrar via WhatsApp"
                            className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                          >
                            <MessageCircle size={16} /> Cobrar
                          </a>
                        )}
                        <Link 
                          href={`/super-admin/tenants?editPlanFor=${tenant.id}`}
                          className="px-3 py-1.5 bg-secondary text-text-primary hover:text-primary rounded-xl text-xs font-bold transition-colors border border-secondary"
                        >
                          Editar Assinatura
                        </Link>
                        <Link 
                          href={`/super-admin/tenants?deleteTenantFor=${tenant.id}`}
                          title="Excluir Definitivamente"
                          className="p-2 bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Atribuir Plano */}
      {editPlanFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-secondary p-6 rounded-2xl shadow-xl max-w-md w-full relative">
            <Link href="/super-admin/tenants" className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              ✕
            </Link>
            
            <h2 className="text-xl font-bold text-text-primary mb-4">Atribuir Plano</h2>
            
            <form action={updateSubscriptionAction} className="space-y-4">
              <input type="hidden" name="tenantId" value={editPlanFor} />
              
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Selecione o Plano</label>
                <select name="planId" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" required>
                  <option value="">Escolha um plano...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} - R$ {Number(plan.base_price).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Status da Assinatura</label>
                <select name="status" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" required>
                  <option value="TRIAL">Trial (Teste)</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="PAST_DUE">Em Atraso (Past Due)</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Data de Vencimento</label>
                <input type="date" name="endDate" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" required />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Link href="/super-admin/tenants" className="px-4 py-2 rounded-lg font-bold text-text-secondary hover:bg-secondary transition-colors">
                  Cancelar
                </Link>
                <button type="submit" className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-hover transition-colors">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar Barbearia Total */}
      {deleteTenantFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-surface border border-red-500/50 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={32} />
              <h2 className="text-xl font-bold">Atenção! Ação Irreversível</h2>
            </div>
            
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Você está prestes a deletar uma barbearia. Isso irá <strong>APAGAR PERMANENTEMENTE</strong>:
              <br/><br/>
              • A barbearia e todas as suas unidades<br/>
              • <strong>Todas as instâncias do WhatsApp na Evolution API</strong><br/>
              • Todos os serviços, produtos e estoque<br/>
              • Todo o histórico de agendamentos e avaliações<br/>
              • Todas as comandas e movimentações financeiras<br/>
              • Usuários donos e barbeiros exclusivos desta conta
            </p>
            
            <form action={deleteTenantPermanentAction} className="space-y-4">
              <input type="hidden" name="tenantId" value={deleteTenantFor} />
              <div className="pt-2 flex justify-end gap-3">
                <Link href="/super-admin/tenants" className="px-4 py-2 rounded-xl font-bold text-text-secondary hover:bg-secondary transition-colors">
                  Cancelar
                </Link>
                <button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20"
                >
                  Sim, Deletar Tudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
