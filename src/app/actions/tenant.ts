"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export interface UpdateTenantSocialAndFixedCostInput {
  instagram_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  fixed_cost_monthly?: number | null;
  address?: string | null;
  phone?: string | null;
}

export async function updateTenantSocialAndFixedCost(
  data: UpdateTenantSocialAndFixedCostInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado" };

  const { getUserTenant } = await import("@/lib/tenant");
  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return { success: false, error: "Barbearia não encontrada" };

  try {
    const tenantUpdateData: Record<string, any> = {};
    if (data.instagram_url !== undefined) {
      tenantUpdateData.instagram_url = data.instagram_url ? data.instagram_url.trim() : null;
    }
    if (data.facebook_url !== undefined) {
      tenantUpdateData.facebook_url = data.facebook_url ? data.facebook_url.trim() : null;
    }
    if (data.tiktok_url !== undefined) {
      tenantUpdateData.tiktok_url = data.tiktok_url ? data.tiktok_url.trim() : null;
    }
    if (data.fixed_cost_monthly !== undefined) {
      tenantUpdateData.fixed_cost_monthly =
        data.fixed_cost_monthly !== null && !isNaN(Number(data.fixed_cost_monthly))
          ? Math.max(0, Number(data.fixed_cost_monthly))
          : 0;
    }

    if (Object.keys(tenantUpdateData).length > 0) {
      await db.tenant.update({
        where: { id: tenant.id },
        data: tenantUpdateData,
      });
    }

    if (data.address !== undefined || data.phone !== undefined) {
      const unit = await db.unit.findFirst({
        where: { tenantId: tenant.id },
      });
      if (unit) {
        await db.unit.update({
          where: { id: unit.id },
          data: {
            ...(data.address !== undefined ? { address: data.address ? data.address.trim() : null } : {}),
            ...(data.phone !== undefined ? { phone: data.phone ? data.phone.trim() : null } : {}),
          },
        });
      }
    }

    revalidatePath("/dashboard/config");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/financeiro");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar dados do tenant:", error);
    return { success: false, error: error?.message || "Erro ao atualizar informações." };
  }
}

export async function updateTenantGeneralSettings(formData: FormData) {
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const instagram_url = formData.get("instagram_url") as string;
  const facebook_url = formData.get("facebook_url") as string;
  const tiktok_url = formData.get("tiktok_url") as string;
  const fixed_cost_raw = formData.get("fixed_cost_monthly") as string;

  let fixed_cost_monthly = 0;
  if (fixed_cost_raw) {
    const cleaned = fixed_cost_raw.replace(/[R$\s.]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      fixed_cost_monthly = parsed;
    }
  }

  return await updateTenantSocialAndFixedCost({
    address,
    phone,
    instagram_url,
    facebook_url,
    tiktok_url,
    fixed_cost_monthly,
  });
}


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
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar logo:", error);
    return { error: "Erro ao atualizar logotipo." };
  }
}
