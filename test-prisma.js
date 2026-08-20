
const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const whereClause = {
      tenantId: undefined,
      start_time: { gte: new Date(), lt: new Date() }
    };
    const dbAppointments = await prisma.appointment.findMany({ where: whereClause });
    console.log('Success!', dbAppointments.length);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

