"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getUserTenant } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

// Função utilitária para verificar sessão e tenant
async function getAuthAndTenant() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: Usuário não autenticado.");

  const tenant = await getUserTenant(session.user.id);
  if (!tenant) throw new Error("Unauthorized: Barbearia não encontrada.");

  return { session, tenant };
}

export async function createComanda() {
  const { tenant } = await getAuthAndTenant();

  const novaComanda = await db.comanda.create({
    data: {
      tenantId: tenant.id,
      status: 'OPEN',
      total_amount: 0
    }
  });

  return novaComanda.id;
}

export async function closeComanda(comandaId: string) {
  const { tenant } = await getAuthAndTenant();

  const comanda = await db.comanda.findFirst({
    where: { id: comandaId, tenantId: tenant.id },
    include: {
      items: true,
      barber: {
        include: {
          contracts: true
        }
      }
    }
  });

  if (!comanda) throw new Error("Comanda não encontrada ou não pertence a esta barbearia.");
  
  if (comanda.status === 'CLOSED') throw new Error("A comanda já está fechada.");

  let totalAmount = 0;
  let totalCommission = 0;

  const serviceCommRate = comanda.barber?.contracts[0] ? Number(comanda.barber.contracts[0].service_commission_rate) : 0;
  const productCommRate = comanda.barber?.contracts[0] ? Number(comanda.barber.contracts[0].product_commission_rate) : 0;

  let descriptionParts: string[] = [];

  for (const item of comanda.items) {
    const itemPrice = Number(item.price);
    totalAmount += itemPrice;
    descriptionParts.push(item.name);

    if (item.serviceId) {
      totalCommission += itemPrice * (serviceCommRate / 100);
    } else if (item.productId) {
      totalCommission += itemPrice * (productCommRate / 100);
      
      // Baixa de estoque
      await db.product.update({
        where: { id: item.productId },
        data: { stock_quantity: { decrement: 1 } }
      });

      await db.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: 1,
          reason: `Venda na Comanda ${comandaId}`
        }
      });
    }
  }

  if (totalAmount > 0) {
    await db.sale.create({
      data: {
        tenantId: tenant.id,
        barberId: comanda.barberId, // Pode ser null se for venda de balcão
        clientId: comanda.clientId,
        total_amount: totalAmount,
        barber_commission: totalCommission,
        description: `Comanda: ${descriptionParts.join(' + ')}`.substring(0, 255), // Limita tamanho da string
      }
    });

    await db.transaction.create({
      data: {
        tenantId: tenant.id,
        type: 'INCOME',
        category: 'OTHER',
        amount: totalAmount,
        description: `Recebimento Ref. Comanda ${comandaId}`,
      }
    });
  }

  await db.comanda.update({
    where: { id: comandaId },
    data: { status: 'CLOSED', total_amount: totalAmount }
  });

  revalidatePath(`/dashboard/comandas/${comandaId}`);
  revalidatePath(`/dashboard/comandas`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/financeiro`);
}

export async function deleteComanda(comandaId: string) {
  const { tenant } = await getAuthAndTenant();

  const comanda = await db.comanda.findFirst({
    where: { id: comandaId, tenantId: tenant.id }
  });

  if (!comanda) throw new Error("Comanda não encontrada ou não pertence a esta barbearia.");

  await db.comanda.delete({
    where: { id: comandaId }
  });

  revalidatePath(`/dashboard/comandas`);
}

export async function addComandaItem(formData: FormData) {
  try {
    const comandaId = formData.get("comandaId") as string;
    const serviceId = formData.get("serviceId") as string | null;
    const productId = formData.get("productId") as string | null;
    
    if (!comandaId || (!serviceId && !productId)) {
      return { success: false, error: "Dados inválidos." };
    }

    const { tenant } = await getAuthAndTenant();
    const comanda = await db.comanda.findFirst({ where: { id: comandaId, tenantId: tenant.id } });
    if (!comanda) return { success: false, error: "Comanda não encontrada." };

    let name = "";
    let price = 0;

    if (serviceId) {
      const service = await db.service.findFirst({ where: { id: serviceId, tenantId: tenant.id } });
      if (!service) return { success: false, error: "Serviço não encontrado." };
      name = service.name;
      price = Number(service.price);
    } else if (productId) {
      const product = await db.product.findFirst({ where: { id: productId, tenantId: tenant.id } });
      if (!product) return { success: false, error: "Produto não encontrado." };
      name = product.name;
      price = Number(product.price);
    }

    await db.comandaItem.create({
      data: {
        comandaId: comanda.id,
        serviceId: serviceId || null,
        productId: productId || null,
        name,
        price,
        quantity: 1
      }
    });

    await db.comanda.update({
      where: { id: comanda.id },
      data: { total_amount: { increment: price } }
    });

    revalidatePath(`/dashboard/comandas/${comanda.id}`);
    return { success: true };
  } catch (err: any) {
    console.error("Erro interno no addComandaItem:", err);
    return { success: false, error: err.message || "Erro interno no servidor." };
  }
}
