import { db } from './src/lib/db';

async function main() {
  const apps = await db.appointment.findMany({ include: { barber: true } });
  console.log(apps);
}

main().catch(console.error).finally(() => process.exit(0));
