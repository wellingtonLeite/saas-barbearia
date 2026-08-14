import { db } from "@/lib/db";

export async function getUserTenant(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      units: {
        include: {
          unit: true
        }
      }
    }
  });

  if (!user || user.units.length === 0) {
    // Para simplificar no desenvolvimento (se houver apenas 1 tenant e o dev nÃ£o se atrelar a ele)
    // Isso evita travar o dono se ele for apagado por engano.
    const fallbackTenant = await db.tenant.findFirst();
    return fallbackTenant;
  }

  const tenant = await db.tenant.findUnique({
    where: { id: user.units[0].unit.tenantId }
  });

  return tenant;
}
