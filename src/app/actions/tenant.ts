"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

import { auth } from "@/auth";

export async function updateTenantLogo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return { error: "Não autorizado" };

  const tenantId = tenant.id;
  const logoFile = formData.get("logoFile") as File;

  if (!logoFile || logoFile.size === 0) {
    return { error: "Arquivo da logo é obrigatório" };
  }

  try {
    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Gerar nome único e salvar arquivo
    const extension = logoFile.name.split('.').pop();
    const fileName = `tenant-${tenantId}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);

    // Salvar o caminho relativo no banco
    const logoUrl = `/uploads/${fileName}`;

    await db.tenant.update({
      where: { id: tenantId },
      data: { logo_url: logoUrl }
    });

    revalidatePath("/dashboard/config");
    revalidatePath("/dashboard", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar logo:", error);
    return { error: "Erro ao atualizar logotipo." };
  }
}
