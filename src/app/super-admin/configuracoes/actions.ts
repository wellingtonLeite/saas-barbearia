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

export async function saveGroqSettings(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Não autorizado");
  }

  const api_key = formData.get("groq_api_key") as string;
  const model = formData.get("groq_model") as string;

  // Só atualiza a chave se o usuário preencheu (evita apagar com ****)
  const existing = await db.systemSetting.findUnique({ where: { key: "GROQ_CONFIG" } });
  const existingKey = (existing?.value as any)?.api_key || "";

  const groqConfig = {
    api_key: api_key && !api_key.startsWith("****") ? api_key : existingKey,
    model: model || "llama-3.3-70b-versatile",
  };

  await db.systemSetting.upsert({
    where: { key: "GROQ_CONFIG" },
    update: { value: groqConfig },
    create: { key: "GROQ_CONFIG", value: groqConfig }
  });

  revalidatePath("/super-admin/configuracoes");
  return { success: true };
}
