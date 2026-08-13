"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const durationStr = formData.get("duration") as string;

  if (!name || !priceStr || !durationStr) return { error: "Preencha todos os campos" };

  const price = parseFloat(priceStr);
  const duration = parseInt(durationStr);

  try {
    const userWithTenants = await db.user.findUnique({
      where: { id: session.user.id },
      include: { units: { include: { unit: true } } }
    });

    const tenantId = userWithTenants?.units[0]?.unit.tenantId;

    if (!tenantId) {
      const fallbackTenant = await db.tenant.findFirst();
      if (!fallbackTenant) return { error: "Barbearia não encontrada" };
      await saveService(fallbackTenant.id, name, price, duration);
      return { success: true };
    }

    await saveService(tenantId, name, price, duration);
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar serviço" };
  }
}

async function saveService(tenantId: string, name: string, price: number, duration: number) {
  await db.service.create({
    data: {
      tenantId,
      name,
      price,
      duration_minutes: duration
    }
  });
  revalidatePath("/dashboard/servicos");
}

export async function deleteService(serviceId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  try {
    await db.service.delete({
      where: { id: serviceId }
    });
    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao deletar serviço" };
  }
}
