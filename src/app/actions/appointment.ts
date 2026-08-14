"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatus(appointmentId: string, status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/financeiro"); // Se for completed, atualiza financeiro
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { error: "Falha ao atualizar status." };
  }
}

export async function processCheckout(appointmentId: string, productIds: string[]) {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        barber: {
          include: {
            contracts: true
          }
        }
      }
    });

    if (!appointment) throw new Error("Agendamento não encontrado");

    const tenantId = appointment.tenantId;
    const barberId = appointment.barberId;
    const clientId = appointment.clientId;
    
    // Contrato ativo do barbeiro (assumindo o primeiro por simplificação)
    const contract = appointment.barber.contracts[0];
    const serviceCommRate = contract ? Number(contract.service_commission_rate) : 0;
    const productCommRate = contract ? Number(contract.product_commission_rate) : 0;

    let totalAmount = Number(appointment.service.price);
    let totalCommission = totalAmount * (serviceCommRate / 100);

    // Calcular produtos
    let description = appointment.service.name;

    if (productIds.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: productIds } }
      });

      for (const product of products) {
        const pPrice = Number(product.price);
        totalAmount += pPrice;
        totalCommission += pPrice * (productCommRate / 100);

        description += ` + ${product.name}`;

        // Dar baixa no estoque e registrar movimento
        await db.product.update({
          where: { id: product.id },
          data: { stock_quantity: { decrement: 1 } }
        });

        await db.stockMovement.create({
          data: {
            productId: product.id,
            type: 'OUT',
            quantity: 1,
            reason: `Venda no Checkout do agendamento ${appointmentId}`
          }
        });
      }
    }

    // Criar Venda (Sale)
    await db.sale.create({
      data: {
        tenantId,
        barberId,
        clientId,
        total_amount: totalAmount,
        barber_commission: totalCommission,
        description: description,
      }
    });

    // Criar Transação de Entrada (Caixa)
    await db.transaction.create({
      data: {
        tenantId,
        type: 'INCOME',
        category: 'SERVICE',
        amount: totalAmount,
        description: `Recebimento Ref. Agendamento ${appointmentId}`,
      }
    });

    // Atualizar status do agendamento
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/financeiro");
    return { success: true };
  } catch (error) {
    console.error("Erro no Checkout:", error);
    return { error: "Falha ao processar checkout." };
  }
}

export async function startAppointmentAndOpenComanda(appointmentId: string) {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
      }
    });

    if (!appointment) throw new Error("Agendamento não encontrado");

    // 1. Atualizar status para IN_PROGRESS
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' }
    });

    // 2. Buscar ou criar Comanda para o cliente
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let comanda = await db.comanda.findFirst({
      where: {
        tenantId: appointment.tenantId,
        clientId: appointment.clientId,
        barberId: appointment.barberId,
        status: 'OPEN',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (!comanda) {
      comanda = await db.comanda.create({
        data: {
          tenantId: appointment.tenantId,
          clientId: appointment.clientId,
          barberId: appointment.barberId,
          status: 'OPEN',
          total_amount: 0
        }
      });
    }

    // 3. Adicionar o Serviço do Agendamento à Comanda
    const existingItem = await db.comandaItem.findFirst({
      where: {
        comandaId: comanda.id,
        serviceId: appointment.serviceId
      }
    });

    if (!existingItem) {
      await db.comandaItem.create({
        data: {
          comandaId: comanda.id,
          serviceId: appointment.serviceId,
          name: appointment.service.name,
          price: appointment.service.price,
          quantity: 1
        }
      });

      // Atualizar total da comanda
      await db.comanda.update({
        where: { id: comanda.id },
        data: { total_amount: { increment: appointment.service.price } }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/comandas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao iniciar corte e criar comanda:", error);
    return { error: "Falha ao iniciar corte." };
  }
}
