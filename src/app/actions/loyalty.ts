"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveLoyaltyProgram(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  
  if (!tenant) return { error: "Não autorizado" };

  const points_per_brl = Number(formData.get("points_per_brl"));
  const reward_points = Number(formData.get("reward_points"));
  const reward_value = Number(formData.get("reward_value"));
  const is_active = formData.get("is_active") === "true";

  await db.loyaltyProgram.upsert({
    where: { tenantId: tenant.id },
    update: {
      points_per_brl,
      reward_points,
      reward_value,
      is_active,
    },
    create: {
      tenantId: tenant.id,
      points_per_brl,
      reward_points,
      reward_value,
      is_active,
    },
  });

  revalidatePath("/dashboard/assinatura");
}
