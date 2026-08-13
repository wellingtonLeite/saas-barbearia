import { db } from './src/lib/db';

async function main() {
  const tenants = await db.tenant.findMany();
  console.log("Tenants cadastrados:");
  tenants.forEach(t => {
    console.log(`- Nome: ${t.name} | Slug: ${t.slug} | Rota Pública: http://localhost:3000/${t.slug}`);
  });
}

main().catch(console.error).finally(() => process.exit(0));
