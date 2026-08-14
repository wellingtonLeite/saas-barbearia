import { db as prisma } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const email = "wellington.leite@criativamarketing.com";
  const password = "123456";
  const password_hash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { 
        role: 'SUPER_ADMIN',
        password_hash
      }
    });
    console.log("Usuário existente atualizado para SUPER_ADMIN e senha redefinida.");
  } else {
    await prisma.user.create({
      data: {
        name: "Wellington Leite",
        email,
        password_hash,
        role: 'SUPER_ADMIN'
      }
    });
    console.log("Novo usuário SUPER_ADMIN criado com sucesso.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
