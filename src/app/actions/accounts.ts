"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getTenantId(userId: string) {
  // Tenta achar via BarberUnit
  const barberUnit = await db.barberUnit.findFirst({
    where: { barberId: userId },
    include: { unit: true }
  });
  if (barberUnit) return barberUnit.unit.tenantId;
  
  // Fallback para o primeiro tenant
  const tenant = await db.tenant.findFirst();
  return tenant?.id;
}

export async function createAccountEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const tenantId = await getTenantId(session.user.id);
  if (!tenantId) throw new Error("Tenant not found");

  const type = formData.get("type") as "PAYABLE" | "RECEIVABLE";
  const description = formData.get("description") as string;
  const amount = Number(formData.get("amount"));
  const dueDateStr = formData.get("due_date") as string;
  
  await db.accountEntry.create({
    data: {
      tenantId,
      type,
      description,
      amount,
      due_date: new Date(dueDateStr),
      status: "PENDING",
    }
  });

  revalidatePath("/dashboard/financeiro/contas");
  revalidatePath("/dashboard/financeiro");
}

export async function markAsPaid(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await db.accountEntry.update({
    where: { id },
    data: {
      status: "PAID",
      paid_at: new Date()
    }
  });

  revalidatePath("/dashboard/financeiro/contas");
  revalidatePath("/dashboard/financeiro");
}

export async function deleteAccountEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await db.accountEntry.delete({
    where: { id }
  });

  revalidatePath("/dashboard/financeiro/contas");
  revalidatePath("/dashboard/financeiro");
}
