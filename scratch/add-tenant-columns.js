require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Applying safe non-destructive ALTER TABLE for Tenant columns...");

  await pool.query(`
    ALTER TABLE "Tenant"
    ADD COLUMN IF NOT EXISTS "instagram_url" TEXT,
    ADD COLUMN IF NOT EXISTS "facebook_url" TEXT,
    ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT,
    ADD COLUMN IF NOT EXISTS "fixed_cost_monthly" DECIMAL(10,2) DEFAULT 0;
  `);

  console.log("Columns added successfully!");
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Tenant' AND column_name IN ('instagram_url', 'facebook_url', 'tiktok_url', 'fixed_cost_monthly');
  `);
  console.log("Verified Tenant columns in DB:", res.rows);
  await pool.end();
}

migrate().catch(console.error);
