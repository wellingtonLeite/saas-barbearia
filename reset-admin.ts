import { PrismaClient } from './src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' }
  });
  
  if (users.length === 0) {
    console.log("No SUPER_ADMIN found! Creating one...");
    const hash = await bcrypt.hash('123456', 10);
    const newAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@88barber.com',
        password: hash,
        role: 'SUPER_ADMIN',
      }
    });
    console.log("Created admin@88barber.com / 123456");
  } else {
    console.log("Found admins:");
    for (const u of users) {
      console.log(`- ${u.email} (Role: ${u.role})`);
      // Update password to 123456 to be sure
      const hash = await bcrypt.hash('123456', 10);
      await prisma.user.update({
        where: { id: u.id },
        data: { password: hash }
      });
      console.log(`  -> Reset password to '123456'`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
