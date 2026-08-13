import { db } from './src/lib/db';

async function main() {
  const users = await db.user.findMany();
  console.log('--- USERS IN DB ---');
  console.log(users);
  console.log('-------------------');
}

main().catch(console.error);
