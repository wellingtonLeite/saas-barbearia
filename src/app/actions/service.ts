"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const priceStr = formData.get("price") as string;
  const durationStr = formData.get("duration") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const image_url = (formData.get("image_url") as string) || null;

  if (!name || !priceStr || !durationStr) return { error: "Preencha todos os campos" };

  const price = parseFloat(priceStr);
  const duration = parseInt(durationStr);

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    await db.service.create({
      data: {
        tenantId: tenant.id,
        name,
        description,
        price,
        duration_minutes: duration,
        image_url,
        categoryId: categoryId || null
      }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar serviço" };
  }
}

export async function updateService(serviceId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const priceStr = formData.get("price") as string;
  const durationStr = formData.get("duration") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const image_url = (formData.get("image_url") as string) || null;

  if (!name || !priceStr || !durationStr) return { error: "Preencha todos os campos" };

  const price = parseFloat(priceStr);
  const duration = parseInt(durationStr);

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    await db.service.updateMany({
      where: { id: serviceId, tenantId: tenant.id },
      data: {
        name,
        description,
        price,
        duration_minutes: duration,
        image_url,
        categoryId: categoryId || null
      }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar serviço" };
  }
}

export async function deleteService(serviceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    const result = await db.service.deleteMany({
      where: { id: serviceId, tenantId: tenant.id }
    });

    if (result.count === 0) {
      return { error: "Serviço não encontrado ou não autorizado" };
    }

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao deletar serviço" };
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  if (!name) return { error: "Nome obrigatório" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    await db.serviceCategory.create({
      data: {
        tenantId: tenant.id,
        name
      }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar categoria" };
  }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    const result = await db.serviceCategory.deleteMany({
      where: { id: categoryId, tenantId: tenant.id }
    });

    if (result.count === 0) {
      return { error: "Categoria não encontrada ou não autorizada" };
    }

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao deletar categoria" };
  }
}
