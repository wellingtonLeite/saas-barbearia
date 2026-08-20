"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Verificar se é SUPER_ADMIN
async function checkSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Acesso negado: apenas o Super Admin pode gerenciar pedidos.");
  }
}

// Alterar Status do Pedido / Assinatura (WooCommerce Style)
export async function updateSubscriptionStatus(
  subscriptionId: string, 
  newStatus: "ACTIVE" | "PAST_DUE" | "TRIAL" | "CANCELED"
) {
  await checkSuperAdmin();

  try {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { tenant: true }
    });

    if (!subscription) return { error: "Assinatura não encontrada." };

    // Se estiver aprovando (ACTIVE), garantir 30 dias de validade e tenant ativo
    let newEndDate = subscription.current_period_end;
    if (newStatus === "ACTIVE") {
      newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.tenant.update({
        where: { id: subscription.tenantId },
        data: { active: true }
      });
    }

    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: newStatus,
        current_period_end: newEndDate
      }
    });

    revalidatePath("/super-admin/pedidos");
    revalidatePath("/super-admin/tenants");
    return { success: true, message: `Status alterado para ${newStatus} com sucesso!` };
  } catch (error: any) {
    console.error("Erro ao alterar status da assinatura:", error);
    return { error: error?.message || "Erro ao atualizar status." };
  }
}

// Alterar Plano da Assinatura Manualmente (Para Testes)
export async function updateSubscriptionPlan(subscriptionId: string, newPlanId: string) {
  await checkSuperAdmin();

  try {
    const plan = await db.plan.findUnique({ where: { id: newPlanId } });
    if (!plan) return { error: "Plano não encontrado." };

    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        status: "ACTIVE", // Ao mudar manualmente, já ativa para testes
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    revalidatePath("/super-admin/pedidos");
    revalidatePath("/super-admin/tenants");
    return { success: true, message: `Plano alterado para ${plan.name} e liberado!` };
  } catch (error: any) {
    console.error("Erro ao alterar plano da assinatura:", error);
    return { error: error?.message || "Erro ao atualizar plano." };
  }
}

// Aprovação Rápida Manual de Pedido
export async function manualApproveOrder(subscriptionId: string) {
  return updateSubscriptionStatus(subscriptionId, "ACTIVE");
}
