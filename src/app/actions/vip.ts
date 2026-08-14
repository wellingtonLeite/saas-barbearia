"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createClientPlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  
  if (!tenant) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const interval = formData.get("interval") as string || "MONTHLY";
  const is_active = formData.get("is_active") === "true";

  await db.clientPlan.create({
    data: {
      tenantId: tenant.id,
      name,
      price,
      description,
      interval,
      is_active,
    },
  });

  revalidatePath("/dashboard/assinatura");
}

export async function deleteClientPlan(planId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  
  if (!tenant) return { error: "Não autorizado" };

  const result = await db.clientPlan.deleteMany({
    where: { id: planId, tenantId: tenant.id },
  });

  if (result.count === 0) {
    return { error: "Plano não encontrado ou sem permissão" };
  }

  revalidatePath("/dashboard/assinatura");
}
