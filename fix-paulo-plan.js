const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function fixPauloPlan() {
  const freePlan = await pool.query(`SELECT id FROM "Plan" WHERE name ILIKE '%gratuito%' OR base_price = 0 LIMIT 1`);
  if (freePlan.rows.length > 0) {
    const freePlanId = freePlan.rows[0].id;
    const updated = await pool.query(`
      UPDATE "Subscription" 
      SET "planId" = $1, "status" = 'ACTIVE' 
      WHERE "tenantId" IN (SELECT id FROM "Tenant" WHERE slug ILIKE '%barbearia-do-paulo%' OR name ILIKE '%paulo%')
      RETURNING *
    `, [freePlanId]);
    console.log("Updated Barbearia do Paulo to Free Plan:", updated.rows);
  }
  await pool.end();
}
fixPauloPlan().catch(console.error);