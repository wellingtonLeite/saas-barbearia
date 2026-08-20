const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const plans = await pool.query(`SELECT id, name, max_barbers, base_price FROM "Plan"`);
  console.log("=== PLANS ===");
  console.log(plans.rows);

  const sub = await pool.query(`SELECT s.*, p.name as plan_name, p.max_barbers FROM "Subscription" s LEFT JOIN "Plan" p ON s."planId" = p.id`);
  console.log("=== SUBSCRIPTIONS ===");
  console.log(sub.rows);

  await pool.end();
}
check().catch(console.error);