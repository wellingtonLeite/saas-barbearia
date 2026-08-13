"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePaymentSettings(prevState: any, formData: FormData) {
  const access_token = formData.get("access_token") as string;
  const is_active = formData.get("is_active") === "on";

  if (!access_token) {
    return { error: "Access Token is obrigatório", success: false };
  }

  try {
    await db.gatewayConfig.upsert({
      where: { gateway: "MERCADO_PAGO" },
      update: {
        access_token,
        is_active,
      },
      create: {
        gateway: "MERCADO_PAGO",
        access_token,
        is_active,
      },
    });

    revalidatePath("/super-admin/pagamentos");
    return { success: true, message: "Configurações salvas com sucesso!" };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar configurações", success: false };
  }
}
