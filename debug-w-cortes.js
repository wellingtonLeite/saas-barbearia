const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const tenants = await pool.query(`SELECT id, name, slug FROM "Tenant"`);
  console.log("=== TENANTS ===");
  console.log(tenants.rows);

  const units = await pool.query(`SELECT id, name, "tenantId" FROM "Unit"`);
  console.log("=== UNITS ===");
  console.log(units.rows);

  const users = await pool.query(`SELECT id, name, email, role FROM "User"`);
  console.log("=== USERS ===");
  console.log(users.rows);

  const barberUnits = await pool.query(`SELECT * FROM "BarberUnit"`);
  console.log("=== BARBER UNITS ===");
  console.log(barberUnits.rows);

  const barberContracts = await pool.query(`SELECT * FROM "BarberContract"`);
  console.log("=== BARBER CONTRACTS ===");
  console.log(barberContracts.rows);

  await pool.end();
}
check().catch(console.error);