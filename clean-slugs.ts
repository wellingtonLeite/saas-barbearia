import { db } from './src/lib/db';

async function main() {
  const tenants = await db.tenant.findMany();
  for (const t of tenants) {
    const cleanSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await db.tenant.update({
      where: { id: t.id },
      data: { slug: cleanSlug }
    });
    console.log(`Tenant ${t.name} atualizado para o slug: ${cleanSlug}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
