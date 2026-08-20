"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type WorkingHoursActionState = {
  success?: boolean;
  message?: string;
  error?: string;
} | null;

export async function saveUnitWorkingHours(
  prevState: WorkingHoursActionState,
  formData: FormData
): Promise<WorkingHoursActionState> {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Não autorizado para alterar os horários da barbearia." };
    }

    const unitId = formData.get("unitId") as string;

    if (!unitId) {
      return { success: false, error: "Identificador da unidade não informado." };
    }

    // Verificar se o usuário realmente tem acesso a essa unidade
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        units: {
          where: { unitId },
          include: { unit: true }
        }
      }
    });

    if (session.user.role !== "SUPER_ADMIN" && (!user || user.units.length === 0)) {
      return { success: false, error: "Unidade não pertence à sua conta." };
    }

    const newHours: Record<string, {
      active: boolean;
      start: string;
      end: string;
      lunch_active: boolean;
      lunch_start: string;
      lunch_end: string;
    }> = {};

    for (let i = 0; i < 7; i++) {
      const active = formData.get(`day_${i}_active`) === "on";
      const start = (formData.get(`day_${i}_start`) as string) || "09:00";
      const end = (formData.get(`day_${i}_end`) as string) || "20:00";
      const lunch_active = formData.get(`day_${i}_lunch_active`) === "on";
      const lunch_start = (formData.get(`day_${i}_lunch_start`) as string) || "12:00";
      const lunch_end = (formData.get(`day_${i}_lunch_end`) as string) || "13:00";

      newHours[i.toString()] = {
        active,
        start,
        end,
        lunch_active,
        lunch_start,
        lunch_end
      };
    }

    await db.unit.update({
      where: { id: unitId },
      data: {
        working_hours: newHours
      }
    });

    revalidatePath("/dashboard/config/horarios-barbearia");
    revalidatePath("/dashboard/config/horarios");
    revalidatePath("/dashboard/config");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Horários de funcionamento da barbearia salvos com sucesso!"
    };
  } catch (error: any) {
    console.error("Erro ao salvar horários da unidade:", error);
    return {
      success: false,
      error: error.message || "Erro inesperado ao salvar os horários de funcionamento."
    };
  }
}

export async function saveBarberWorkingHours(
  prevState: WorkingHoursActionState,
  formData: FormData
): Promise<WorkingHoursActionState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const contractId = formData.get("contractId") as string;

    if (!contractId) {
      return { success: false, error: "Contrato de barbeiro não identificado." };
    }

    // Buscar o contrato e a unidade correspondente para garantir conformidade
    const contract = await db.barberContract.findUnique({
      where: { id: contractId },
      include: { unit: true }
    });

    if (!contract || (contract.barberId !== session.user.id && session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Não autorizado a alterar este horário de barbeiro." };
    }

    const unitHours = (contract.unit.working_hours as any) || {};

    const newHours: Record<string, {
      active: boolean;
      start: string;
      end: string;
      lunch_active: boolean;
      lunch_start: string;
      lunch_end: string;
    }> = {};

    for (let i = 0; i < 7; i++) {
      const uH = unitHours[i.toString()] || { active: true, start: "09:00", end: "20:00" };
      const active = formData.get(`day_${i}_active`) === "on";
      const start = (formData.get(`day_${i}_start`) as string) || uH.start || "09:00";
      const end = (formData.get(`day_${i}_end`) as string) || uH.end || "20:00";
      const lunch_active = formData.get(`day_${i}_lunch_active`) === "on";
      const lunch_start = (formData.get(`day_${i}_lunch_start`) as string) || "12:00";
      const lunch_end = (formData.get(`day_${i}_lunch_end`) as string) || "13:00";

      newHours[i.toString()] = {
        active,
        start,
        end,
        lunch_active,
        lunch_start,
        lunch_end
      };
    }

    await db.barberContract.update({
      where: { id: contractId },
      data: {
        working_hours: newHours
      }
    });

    revalidatePath("/dashboard/config/horarios");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Seus horários de trabalho foram salvos com sucesso!"
    };
  } catch (error: any) {
    console.error("Erro ao salvar horários do barbeiro:", error);
    return {
      success: false,
      error: error.message || "Erro inesperado ao salvar seus horários."
    };
  }
}
