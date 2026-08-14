"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return { error: "Não autorizado" };

  return await createProductWithTenant(formData, tenant.id);
}

async function createProductWithTenant(formData: FormData, tenantId: string) {
  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const stockStr = formData.get("stock_quantity") as string;

  if (!name || !priceStr) return { error: "Preencha todos os campos obrigatórios" };

  const price = parseFloat(priceStr);
  const stock = parseInt(stockStr || "0");

  try {
    const product = await db.product.create({
      data: {
        tenantId,
        name,
        price,
        stock_quantity: stock,
      }
    });

    if (stock > 0) {
      // Registrar movimento inicial
      await db.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: stock,
          reason: "Estoque Inicial (Cadastro)"
        }
      });
    }

    revalidatePath("/dashboard/produtos");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar produto" };
  }
}

export async function addStock(productId: string, quantity: number, reason: string = "Entrada Manual") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    const product = await db.product.findFirst({ where: { id: productId, tenantId: tenant.id } });
    if (!product) return { error: "Não autorizado" };

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock_quantity: { increment: quantity } }
      });

      await tx.stockMovement.create({
        data: {
          productId,
          type: "IN",
          quantity,
          reason
        }
      });
    });

    revalidatePath("/dashboard/produtos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao adicionar estoque" };
  }
}

export async function removeStock(productId: string, quantity: number, reason: string = "Saída Manual / Ajuste") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(session.user.id);
    if (!tenant) return { error: "Não autorizado" };

    const product = await db.product.findFirst({ where: { id: productId, tenantId: tenant.id } });
    if (!product || product.stock_quantity < quantity) {
      return { error: "Estoque insuficiente ou não autorizado" };
    }

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock_quantity: { decrement: quantity } }
      });

      await tx.stockMovement.create({
        data: {
          productId,
          type: "OUT",
          quantity,
          reason
        }
      });
    });

    revalidatePath("/dashboard/produtos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao remover estoque" };
  }
}
