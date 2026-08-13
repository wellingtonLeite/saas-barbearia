"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  // O tenant logado (como ainda não guardamos o tenantId na sessão, vamos buscar o primeiro do usuário se ele for OWNER)
  // Como simplificação para o MVP, vamos pegar a barbearia pelo tenant que o usuário é dono ou pelo tenantId passado
  const userWithTenants = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: { include: { unit: { include: { tenant: true } } } },
    }
  });

  // Hack do MVP: Pega o primeiro tenant que ele tem acesso
  const tenantId = userWithTenants?.units[0]?.unit.tenantId;

  if (!tenantId) {
    // Se ele não tiver tenant na BarberUnit, vamos checar se ele tem um Tenant direto
    const tenant = await db.tenant.findFirst(); // Fallback extremo para MVP
    if (!tenant) return { error: "Nenhuma barbearia encontrada" };
    return await createProductWithTenant(formData, tenant.id);
  }

  return await createProductWithTenant(formData, tenantId);
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
  if (!session?.user) return { error: "Não autorizado" };

  try {
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
  if (!session?.user) return { error: "Não autorizado" };

  try {
    const product = await db.product.findUnique({ where: { id: productId }});
    if (!product || product.stock_quantity < quantity) {
      return { error: "Estoque insuficiente" };
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
