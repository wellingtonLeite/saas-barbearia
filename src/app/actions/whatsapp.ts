"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveWhatsappTemplates(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    
    if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'SUPER_ADMIN') {
      return { error: "Não autorizado", success: false };
    }

    const tenantId = formData.get("tenantId") as string;
    const reminder = formData.get("reminder") as string;
    const review = formData.get("review") as string;
    const cancellation = formData.get("cancellation") as string;

    if (!tenantId) {
      return { error: "Identificador da barbearia não fornecido", success: false };
    }

    const payload = {
      reminder: reminder || "",
      review: review || "",
      cancellation: cancellation || ""
    };

    await db.tenant.update({
      where: { id: tenantId },
      data: {
        whatsapp_templates: payload
      }
    });

    revalidatePath("/dashboard/config/whatsapp");
    return { success: true, message: "Mensagens salvas com sucesso!" };
  } catch (error) {
    console.error("Error saving whatsapp templates:", error);
    return { error: "Ocorreu um erro ao salvar as mensagens", success: false };
  }
}
