"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function updateTenantLogo(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const logoFile = formData.get("logoFile") as File;

  if (!tenantId || !logoFile || logoFile.size === 0) {
    return { error: "ID e Arquivo da logo são obrigatórios" };
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
