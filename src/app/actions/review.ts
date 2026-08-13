"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string;
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment") as string;

  if (!appointmentId || !rating || rating < 1 || rating > 5) {
    return { error: "Avaliação inválida." };
  }

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { review: true }
    });

    if (!appointment) return { error: "Agendamento não encontrado." };
    if (appointment.status !== 'COMPLETED') return { error: "Apenas cortes finalizados podem ser avaliados." };
    if (appointment.review) return { error: "Este corte já foi avaliado." };

    await db.review.create({
      data: {
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        barberId: appointment.barberId,
        clientId: appointment.clientId,
        rating,
        comment
      }
    });

    revalidatePath(`/avaliar/${appointmentId}`);
    revalidatePath("/dashboard/equipe");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    return { error: "Falha ao salvar a avaliação." };
  }
}
