import { db } from './src/lib/db';

async function main() {
  const users = await db.user.findMany();
  console.log(users.map(u => ({ id: u.id, name: u.name, role: u.role })));
}

main().catch(console.error).finally(() => process.exit(0));
