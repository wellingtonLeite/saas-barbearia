const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function fix() {
  const vip = await pool.query(`SELECT id FROM "Plan" WHERE name ILIKE '%VIP%' LIMIT 1`);
  if (vip.rows[0]) {
    await pool.query(`UPDATE "Subscription" SET "planId" = $1`, [vip.rows[0].id]);
    console.log("✅ Todas as assinaturas atualizadas para o Plano Barber VIP!");
  }
  await pool.end();
}
fix().catch(console.error);