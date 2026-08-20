const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function fixTenantPlan() {
  const plans = await pool.query(`SELECT id, name, base_price FROM "Plan" ORDER BY base_price ASC`);
  console.log("Plans available:", plans.rows);

  const freePlan = plans.rows.find(p => p.name.toLowerCase().includes('gratuito') || Number(p.base_price) === 0);
  console.log("Free plan is:", freePlan);

  if (freePlan) {
    // Update W-Cortes tenant subscription to free plan
    const updated = await pool.query(`
      UPDATE "Subscription" 
      SET "planId" = $1, "status" = 'ACTIVE' 
      WHERE "tenantId" IN (SELECT id FROM "Tenant" WHERE slug = 'w-cortes')
      RETURNING *
    `, [freePlan.id]);
    console.log("Updated W-Cortes to Free Plan:", updated.rows);
  }

  await pool.end();
}
fixTenantPlan().catch(console.error);