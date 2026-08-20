const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDetails() {
  const appointments = await pool.query('SELECT count(*) FROM "Appointment"');
  const transactions = await pool.query('SELECT count(*) FROM "Transaction"');
  const sales = await pool.query('SELECT count(*) FROM "Sale"');
  const comandas = await pool.query('SELECT count(*) FROM "Comanda"');
  const blocks = await pool.query('SELECT count(*) FROM "ScheduleBlock"');
  const services = await pool.query('SELECT count(*) FROM "Service"');
  const units = await pool.query('SELECT id, name, "tenantId" FROM "Unit"');
  const subscriptions = await pool.query('SELECT id, "tenantId", "planId", status FROM "Subscription"');

  console.log('Appointments:', appointments.rows[0].count);
  console.log('Transactions:', transactions.rows[0].count);
  console.log('Sales:', sales.rows[0].count);
  console.log('Comandas:', comandas.rows[0].count);
  console.log('Blocks:', blocks.rows[0].count);
  console.log('Services:', services.rows[0].count);
  console.log('Units:', units.rows);
  console.log('Subscriptions:', subscriptions.rows);

  await pool.end();
}

checkDetails().catch(console.error);
