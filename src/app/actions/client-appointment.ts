"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function cancelAppointment(formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string;

  if (!appointmentId) return;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return;

    // Apenas PENDING ou CONFIRMED podem ser cancelados pelo cliente
    if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
      return { error: "Este agendamento não pode mais ser cancelado." };
    }

    // Apenas se faltar mais de 2 horas (Regra de Negócio)
    const now = new Date();
    const hoursUntil = (appointment.start_time.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntil <= 2) {
      return { error: "Cancelamento não permitido com menos de 2 horas de antecedência." };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    });

    revalidatePath(`/agendamento/${appointmentId}`);
    revalidatePath("/dashboard"); // Atualiza a timeline do barbeiro
  } catch (error) {
    console.error("Erro ao cancelar agendamento pelo cliente:", error);
  }
}
