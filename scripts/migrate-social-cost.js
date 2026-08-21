const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_FVB8jirt1JwG@ep-patient-wind-ay4dddoq.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const pool = new Pool({ connectionString });
  console.log("Conectando ao banco Neon...");
  const client = await pool.connect();
  try {
    console.log("Executando ALTER TABLE...");
    await client.query(`
      ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;
      ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "facebook_url" TEXT;
      ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT;
      ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "fixed_cost_monthly" DECIMAL(65, 30) DEFAULT 0;
    `);
    console.log("Migração de colunas concluída com sucesso no PostgreSQL Neon!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
