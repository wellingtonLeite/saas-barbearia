import { PrismaClient } from './src/generated/prisma/client/index.js';
const prisma = new PrismaClient();

async function run() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'barbearia-do-paulo' }
  });

  if (!tenant) {
    console.log("Tenant not found.");
    process.exit(1);
  }

  // Find the owner/admin user
  const user = await prisma.user.findFirst({
    where: {
      role: 'OWNER',
      units: { some: { unit: { tenantId: tenant.id } } }
    }
  });

  if (!user) {
    console.log("Owner not found for this tenant.");
    process.exit(1);
  }

  // Insert two test notifications (one general, one appointment)
  await prisma.notification.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Teste: Novo Agendamento',
      message: 'Um cliente teste acabou de agendar um Corte de Cabelo para amanhã às 15:00.'
    }
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      type: 'SYSTEM_ALERT',
      title: 'Teste: Vencimento',
      message: 'Sua conta de Luz vence em 2 dias.'
    }
  });

  console.log("Notifications created for user:", user.name);
}

run().finally(() => prisma.$disconnect());
