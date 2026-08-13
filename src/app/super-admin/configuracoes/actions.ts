"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveSystemSettings(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Não autorizado");
  }

  const reminder = formData.get("reminder") as string;
  const review = formData.get("review") as string;
  const cancellation = formData.get("cancellation") as string;
  const b2b_welcome = formData.get("b2b_welcome") as string;
  const b2b_billing = formData.get("b2b_billing") as string;

  const templates = {
    reminder,
    review,
    cancellation,
    b2b_welcome,
    b2b_billing
  };

  await db.systemSetting.upsert({
    where: { key: "WHATSAPP_TEMPLATES" },
    update: { value: templates },
    create: { key: "WHATSAPP_TEMPLATES", value: templates }
  });

  revalidatePath("/super-admin/configuracoes");
  return { success: true };
}
