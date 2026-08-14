"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function addTeamMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const employment_type = formData.get("employment_type") as "CLT" | "COMMISSION_ONLY";
  const fixed_salary = parseFloat((formData.get("fixed_salary") as string) || "0");
  const service_commission_rate = parseFloat((formData.get("service_commission_rate") as string) || "0");

  if (!name || !email || !password) return { error: "Preencha os campos obrigatórios" };

  try {
    const { getUserTenant } = await import("@/lib/tenant");
    const currentTenant = await getUserTenant(session.user.id);
    if (!currentTenant) return { error: "Não autorizado" };

    const userWithTenants = await db.user.findUnique({
      where: { id: session.user.id },
      include: { units: { include: { unit: true } } }
    });

    const unitId = userWithTenants?.units[0]?.unitId;
    const tenantId = userWithTenants?.units[0]?.unit?.tenantId;
    if (!unitId || !tenantId || tenantId !== currentTenant.id) return { error: "Unidade não encontrada ou acesso negado" };

    // Verificar se email já existe
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { error: "Email já cadastrado" };

    // Validar limites do plano
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        units: {
          include: {
            barbers: true
          }
        }
      }
    });

    if (tenant?.subscription?.plan) {
      const plan = tenant.subscription.plan;
      const totalBarbers = tenant.units.reduce((acc, unit) => acc + unit.barbers.length, 0);
      if (totalBarbers >= plan.max_barbers) {
        return { error: `Limite atingido: O seu plano (${plan.name}) permite no máximo ${plan.max_barbers} barbeiros. Faça um upgrade para adicionar mais profissionais.` };
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.$transaction(async (tx) => {
      const newBarber = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          role: "BARBER"
        }
      });

      await tx.barberUnit.create({
        data: {
          barberId: newBarber.id,
          unitId
        }
      });

      await tx.barberContract.create({
        data: {
          barberId: newBarber.id,
          unitId,
          employment_type,
          fixed_salary,
          service_commission_rate
        }
      });
    });

    revalidatePath("/dashboard/equipe");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao adicionar membro" };
  }
}
