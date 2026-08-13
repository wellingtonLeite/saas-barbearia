import { db } from './src/lib/db';

async function main() {
  const users = await db.user.findMany();
  if (users.length === 0) {
    console.log("No users found to promote.");
    return;
  }
  
  // Promote the first user (which should be the one just registered)
  const user = users[0];
  await db.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' }
  });
  console.log(`Promoted user ${user.email} to SUPER_ADMIN`);
}

main().catch(console.error).finally(() => process.exit(0));
