"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SubscriptionStatus } from "@/generated/prisma/enums";

export async function toggleTenantStatusAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Não autorizado");

  const tenantId = formData.get("tenantId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  await db.tenant.update({
    where: { id: tenantId },
    data: { active: !currentStatus }
  });

  revalidatePath("/super-admin/tenants");
  return { success: true };
}

export async function updateSubscriptionAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Não autorizado");

  const tenantId = formData.get("tenantId") as string;
  const planId = formData.get("planId") as string;
  const status = formData.get("status") as SubscriptionStatus;
  const dateStr = formData.get("endDate") as string;
  const current_period_end = new Date(dateStr + "T23:59:59");

  await db.subscription.upsert({
    where: { tenantId },
    create: { tenantId, planId, status, current_period_end },
    update: { planId, status, current_period_end }
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/tenants");
  redirect("/super-admin/tenants");
}

export async function deleteTenantPermanentAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Não autorizado");

  const tenantId = formData.get("tenantId") as string;
  if (!tenantId) throw new Error("ID da barbearia não fornecido");

  console.log(`[DELETE TENANT] Iniciando exclusão total da barbearia ${tenantId}...`);

  // 1. Obter dados da barbearia e suas instâncias
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      units: {
        include: {
          barbers: true
        }
      }
    }
  });

  if (!tenant) {
    revalidatePath("/super-admin/tenants");
    redirect("/super-admin/tenants");
    return;
  }

  // 2. EXCLUIR INSTÂNCIAS DO WHATSAPP NA EVOLUTION API
  const evoUrl = process.env.EVOLUTION_API_URL || "https://evolution.88barber.top";
  const evoKey = process.env.EVOLUTION_API_KEY || "88barber-evolution-pbzJxGX3Ih2OHMKo";

  const instanceNamesToDelete = new Set<string>();
  if (tenant.slug) instanceNamesToDelete.add(tenant.slug);
  tenant.units.forEach(u => {
    if (u.phone) {
      instanceNamesToDelete.add(u.phone.replace(/\D/g, ''));
      instanceNamesToDelete.add(u.phone);
    }
  });

  for (const inst of instanceNamesToDelete) {
    try {
      console.log(`[DELETE TENANT] Excluindo instância WhatsApp na Evolution API: ${inst}...`);
      await fetch(`${evoUrl}/instance/logout/${inst}`, {
        method: "DELETE",
        headers: { apikey: evoKey }
      }).catch(() => null);

      await fetch(`${evoUrl}/instance/delete/${inst}`, {
        method: "DELETE",
        headers: { apikey: evoKey }
      }).catch(() => null);
    } catch (e: any) {
      console.warn(`[DELETE TENANT] Não foi possível excluir instância ${inst} na Evolution:`, e?.message);
    }
  }

  // 3. COLETAR IDs DE USUÁRIOS VINCULADOS
  const unitIds = tenant.units.map(u => u.id);
  const barberUnits = await db.barberUnit.findMany({ where: { unitId: { in: unitIds } } });
  const associatedUserIds = [...new Set(barberUnits.map(b => b.barberId))];

  // 4. PURGA EM CASCATA NO BANCO DE DADOS (ORDEM SEGURA)
  try {
    // Comandas e Itens
    await db.comandaItem.deleteMany({ where: { comanda: { tenantId } } }).catch(() => null);
    await db.comanda.deleteMany({ where: { tenantId } }).catch(() => null);

    // Planos de clientes e assinaturas
    await db.clientSubscription.deleteMany({ where: { plan: { tenantId } } }).catch(() => null);
    await db.clientPlan.deleteMany({ where: { tenantId } }).catch(() => null);

    // Fidelidade e Pontos
    await db.clientLoyalty.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.loyaltyProgram.deleteMany({ where: { tenantId } }).catch(() => null);

    // Financeiro, Entradas e Vendas
    await db.accountEntry.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.review.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.notification.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.transaction.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.sale.deleteMany({ where: { tenantId } }).catch(() => null);

    // Estoque e Produtos
    await db.stockMovement.deleteMany({ where: { product: { tenantId } } }).catch(() => null);
    await db.product.deleteMany({ where: { tenantId } }).catch(() => null);

    // Agendamentos e Bloqueios
    await db.appointment.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.scheduleBlock.deleteMany({ where: { tenantId } }).catch(() => null);

    // Serviços e Categorias
    await db.service.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.serviceCategory.deleteMany({ where: { tenantId } }).catch(() => null);

    // Contratos e Vínculos de Barbeiros
    await db.barberContract.deleteMany({ where: { unit: { tenantId } } }).catch(() => null);
    await db.barberUnit.deleteMany({ where: { unit: { tenantId } } }).catch(() => null);

    // Unidades e Assinatura do SaaS
    await db.unit.deleteMany({ where: { tenantId } }).catch(() => null);
    await db.subscription.deleteMany({ where: { tenantId } }).catch(() => null);

    // Excluir a Barbearia (Tenant)
    await db.tenant.delete({ where: { id: tenantId } });
    console.log(`[DELETE TENANT] Barbearia ${tenant.name} (${tenantId}) excluída com sucesso!`);

    // 5. LIMPAR USUÁRIOS ÓRFÃOS (Donos e Barbeiros que não estão em nenhuma outra barbearia)
    for (const userId of associatedUserIds) {
      const isLinkedElsewhere = await db.barberUnit.findFirst({ where: { barberId: userId } });
      if (!isLinkedElsewhere) {
        const u = await db.user.findUnique({ where: { id: userId } });
        if (u && u.role !== "SUPER_ADMIN") {
          try {
            // Limpar vínculos residuais antes de deletar o usuário
            await db.notification.deleteMany({ where: { userId } }).catch(() => null);
            await db.review.deleteMany({ where: { OR: [{ barberId: userId }, { clientId: userId }] } }).catch(() => null);
            await db.clientSubscription.deleteMany({ where: { clientId: userId } }).catch(() => null);
            await db.clientLoyalty.deleteMany({ where: { clientId: userId } }).catch(() => null);
            await db.appointment.deleteMany({ where: { OR: [{ barberId: userId }, { clientId: userId }] } }).catch(() => null);
            await db.sale.deleteMany({ where: { OR: [{ barberId: userId }, { clientId: userId }] } }).catch(() => null);
            await db.comanda.deleteMany({ where: { OR: [{ barberId: userId }, { clientId: userId }] } }).catch(() => null);
            await db.user.delete({ where: { id: userId } });
            console.log(`[DELETE TENANT] Usuário órfão excluído: ${u.name} (${u.email})`);
          } catch (e: any) {
            console.warn(`[DELETE TENANT] Não foi possível deletar usuário ${userId}:`, e?.message);
          }
        }
      }
    }

  } catch (error: any) {
    console.error("[DELETE TENANT ERROR]", error);
    throw new Error(`Erro ao excluir barbearia: ${error.message}`);
  }

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/tenants");
  redirect("/super-admin/tenants");
}
