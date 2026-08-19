const { PrismaClient } = require('./src/generated/prisma');
const db = new PrismaClient();

async function testDelete() {
  const tenants = await db.tenant.findMany({ include: { units: true }});
  if (tenants.length === 0) {
    console.log("No tenants");
    return;
  }
  const tenantId = tenants[0].id;
  console.log("Deleting tenant:", tenantId);
  
  try {
    const units = await db.unit.findMany({ where: { tenantId } });
    const unitIds = units.map(u => u.id);
    const barberUnits = await db.barberUnit.findMany({ where: { unitId: { in: unitIds } } });
    const barberIds = [...new Set(barberUnits.map(b => b.barberId))];

    await db.comandaItem.deleteMany({ where: { comanda: { tenantId } } });
    await db.comanda.deleteMany({ where: { tenantId } });
    await db.clientSubscription.deleteMany({ where: { plan: { tenantId } } });
    await db.clientPlan.deleteMany({ where: { tenantId } });
    await db.clientLoyalty.deleteMany({ where: { tenantId } });
    await db.loyaltyProgram.deleteMany({ where: { tenantId } });
    await db.accountEntry.deleteMany({ where: { tenantId } });
    await db.review.deleteMany({ where: { tenantId } });
    await db.notification.deleteMany({ where: { tenantId } });
    await db.transaction.deleteMany({ where: { tenantId } });
    await db.sale.deleteMany({ where: { tenantId } });
    await db.stockMovement.deleteMany({ where: { product: { tenantId } } });
    await db.product.deleteMany({ where: { tenantId } });
    await db.appointment.deleteMany({ where: { tenantId } });
    await db.service.deleteMany({ where: { tenantId } });
    await db.serviceCategory.deleteMany({ where: { tenantId } });
    await db.scheduleBlock.deleteMany({ where: { tenantId } });
    await db.barberContract.deleteMany({ where: { unit: { tenantId } } });
    await db.barberUnit.deleteMany({ where: { unit: { tenantId } } });
    await db.unit.deleteMany({ where: { tenantId } });
    await db.subscription.deleteMany({ where: { tenantId } });
    await db.tenant.delete({ where: { id: tenantId } });

    for (const bId of barberIds) {
       const stillAttached = await db.barberUnit.findFirst({ where: { barberId: bId } });
       if (!stillAttached) {
         const u = await db.user.findUnique({ where: { id: bId } });
         if (u && u.role !== 'SUPER_ADMIN') {
           await db.user.delete({ where: { id: bId } });
         }
       }
    }
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await db.$disconnect();
  }
}

testDelete();
