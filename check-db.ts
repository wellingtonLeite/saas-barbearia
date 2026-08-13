const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_FVB8jirt1JwG@ep-patient-wind-ay4dddoq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true'
    }
  }
});

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS IN DB:', users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
