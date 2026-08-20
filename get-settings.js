const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();
prisma.systemSetting.findMany().then(r => {
  console.log('SETTINGS:', JSON.stringify(r, null, 2));
}).catch(console.error).finally(() => prisma.$disconnect());
