import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Building2, Power, PowerOff, Trash2, AlertTriangle } from "lucide-react";
import { revalidatePath } from "next/cache";

import Link from "next/link";
import { SubscriptionStatus } from "@/generated/prisma/enums";

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

  async function toggleTenantStatus(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') return;

    const tenantId = formData.get("tenantId") as string;
    const currentStatus = formData.get("currentStatus") === "true";

    const { db } = await import("@/lib/db");
    await db.tenant.update({
      where: { id: tenantId },
      data: { active: !currentStatus }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/super-admin/tenants");
  }

  async function updateSubscription(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') return;

    const tenantId = formData.get("tenantId") as string;
    const planId = formData.get("planId") as string;
    const status = formData.get("status") as SubscriptionStatus;
    const dateStr = formData.get("endDate") as string;
    const current_period_end = new Date(dateStr + "T23:59:59");

    const { db } = await import("@/lib/db");
    
    await db.subscription.upsert({
      where: { tenantId },
      create: { tenantId, planId, status, current_period_end },
      update: { planId, status, current_period_end }
    });

    const { revalidatePath } = await import("next/cache");
    const { redirect } = await import("next/navigation");
    revalidatePath("/super-admin");
    redirect("/super-admin/tenants");
  }

  async function deleteTenant(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') return;

    const tenantId = formData.get("tenantId") as string;
    const { db } = await import("@/lib/db");

    // 1. Encontrar todos os barbeiros/donos associados para limpá-los também se não estiverem em outro tenant
    const units = await db.unit.findMany({ where: { tenantId } });
    const unitIds = units.map(u => u.id);
    const barberUnits = await db.barberUnit.findMany({ where: { unitId: { in: unitIds } } });
    const barberIds = [...new Set(barberUnits.map(b => b.barberId))];

    // 2. Deletar a barbearia e absolutamente TUDO atrelado a ela
    // Fazemos isso manualmente ordem reversa para garantir que não dê erro de Foreign Key (Cascade)
    await db.comandaItem.deleteMany({ where: { comanda: { tenantId } } });
    await db.comanda.deleteMany({ where: { tenantId } });
    await db.clientSubscription.deleteMany({ where: { plan: { tenantId } } });
    await db.clientPlan.deleteMany({ where: { tenantId } });
    await db.clientLoyalty.deleteMany({ where: { tenantId } });
    await db.loyaltyProgram.deleteMany({ where: { tenantId } });
    await db.accountEntry.deleteMany({ where: { tenantId } });
    await db.review.deleteMany({ where: { tenantId } });
    await db.notification.deleteMany({ where: { tenantId } });
    await db.transaction.deleteMany({ where: { tenantId } });
    await db.sale.deleteMany({ where: { tenantId } });
    await db.stockMovement.deleteMany({ where: { product: { tenantId } } });
    await db.product.deleteMany({ where: { tenantId } });
    await db.appointment.deleteMany({ where: { tenantId } });
    await db.service.deleteMany({ where: { tenantId } });
    await db.serviceCategory.deleteMany({ where: { tenantId } });
    await db.scheduleBlock.deleteMany({ where: { tenantId } });
    await db.barberContract.deleteMany({ where: { unit: { tenantId } } });
    await db.barberUnit.deleteMany({ where: { unit: { tenantId } } });
    await db.unit.deleteMany({ where: { tenantId } });
    await db.subscription.deleteMany({ where: { tenantId } });
    await db.tenant.delete({ where: { id: tenantId } });

    // 3. Deletar usuários (donos/barbeiros) que ficaram órfãos
    for (const bId of barberIds) {
       const stillAttached = await db.barberUnit.findFirst({ where: { barberId: bId } });
       if (!stillAttached) {
         const u = await db.user.findUnique({ where: { id: bId } });
         if (u && u.role !== 'SUPER_ADMIN') {
           try {
             await db.user.delete({ where: { id: bId } });
           } catch (error) {
             console.error(`Não foi possível deletar o usuário ${bId} (pode ter histórico em outras barbearias):`, error);
           }
         }
       }
    }

    const { revalidatePath } = await import("next/cache");
    const { redirect } = await import("next/navigation");
    revalidatePath("/super-admin");
    redirect("/super-admin/tenants");
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <Building2 className="text-primary" /> Barbearias (Tenants)
        </h1>
        <p className="text-text-secondary mt-2">
          Gerencie o acesso de todas as barbearias na sua plataforma.
        </p>
      </div>

      <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-secondary text-text-secondary text-sm uppercase tracking-wider">
                <th className="p-4 font-bold">Barbearia</th>
                <th className="p-4 font-bold">Plano</th>
                <th className="p-4 font-bold">Unidades</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {tenants.map(tenant => {
                const sub = tenant.subscription;
                const statusColor = tenant.active ? "text-success bg-success/10" : "text-danger bg-danger/10";

                return (
                  <tr key={tenant.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {tenant.logo_url ? (
                          <img src={tenant.logo_url} alt="Logo" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {tenant.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-text-primary">{tenant.name}</p>
                          <p className="text-xs text-text-secondary">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-secondary">
                      {sub?.plan?.name || "Sem Plano"}
                    </td>
                    <td className="p-4 text-sm font-medium text-text-secondary">
                      {tenant.units.length}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${statusColor}`}>
                        {tenant.active ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`https://wa.me/?text=${encodeURIComponent(
                            b2b_billing
                              .replace("{dono}", "Dono")
                              .replace("{barbearia}", tenant.name)
                              .replace("{plano}", sub?.plan?.name || "Sem Plano")
                              .replace("{link_pagamento}", "Seu painel > Assinatura")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-green-500 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                          title="Cobrar via WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                        </a>
                        <Link 
                          href={`/super-admin/tenants?editPlanFor=${tenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Plano
                        </Link>
                        <form action={toggleTenantStatus}>
                          <input type="hidden" name="tenantId" value={tenant.id} />
                          <input type="hidden" name="currentStatus" value={String(tenant.active)} />
                          
                          <button 
                            type="submit" 
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                              tenant.active 
                                ? "bg-danger/10 text-danger hover:bg-danger/20" 
                                : "bg-success/10 text-success hover:bg-success/20"
                            }`}
                          >
                            {tenant.active ? (
                              <><PowerOff size={16} /> Suspender</>
                            ) : (
                              <><Power size={16} /> Reativar</>
                            )}
                          </button>
                        </form>
                        <Link 
                          href={`/super-admin/tenants?deleteTenantFor=${tenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Deletar Tudo"
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

      {editPlanFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-secondary p-6 rounded-2xl shadow-xl max-w-md w-full relative">
            <Link href="/super-admin/tenants" className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              X
            </Link>
            
            <h2 className="text-xl font-bold text-text-primary mb-4">Atribuir Plano</h2>
            
            <form action={updateSubscription} className="space-y-4">
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

      {deleteTenantFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-red-500/50 p-6 rounded-2xl shadow-xl max-w-md w-full relative">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={32} />
              <h2 className="text-xl font-bold">Atenção! Ação Irreversível</h2>
            </div>
            
            <p className="text-text-secondary mb-6">
              Você está prestes a deletar uma barbearia. Isso irá <strong>APAGAR PERMANENTEMENTE</strong> do banco de dados:
              <br/><br/>
              - O cadastro da barbearia<br/>
              - Todos os serviços e categorias<br/>
              - Todo o histórico de agendamentos<br/>
              - Todas as comandas e dados financeiros<br/>
              - Os usuários (donos e barbeiros) se não estiverem em outra unidade
            </p>
            
            <form action={deleteTenant} className="space-y-4">
              <input type="hidden" name="tenantId" value={deleteTenantFor} />
              <div className="pt-2 flex justify-end gap-2">
                <Link href="/super-admin/tenants" className="px-4 py-2 rounded-lg font-bold text-text-secondary hover:bg-secondary transition-colors">
                  Cancelar
                </Link>
                <button type="submit" className="bg-red-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors">
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
