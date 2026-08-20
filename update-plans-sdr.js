const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function checkPlans() {
  const plans = await pool.query(`SELECT id, name, max_barbers, base_price, has_whatsapp_sdr FROM "Plan"`);
  console.log("=== CURRENT PLANS ===");
  console.log(plans.rows);

  // Update Barber Pro to have has_whatsapp_sdr = true
  await pool.query(`UPDATE "Plan" SET has_whatsapp_sdr = true WHERE name ILIKE '%Pro%' OR name ILIKE '%VIP%'`);
  await pool.query(`UPDATE "Plan" SET has_whatsapp_sdr = false WHERE name ILIKE '%Gratuito%'`);

  const updated = await pool.query(`SELECT id, name, max_barbers, base_price, has_whatsapp_sdr FROM "Plan"`);
  console.log("=== UPDATED PLANS ===");
  console.log(updated.rows);

  await pool.end();
}
checkPlans().catch(console.error);