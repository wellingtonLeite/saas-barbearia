const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function audit() {
  const tenants = await pool.query('SELECT id, name, slug, active, "createdAt" FROM "Tenant"');
  console.log('=== TENANTS ===');
  console.log(tenants.rows);

  const users = await pool.query('SELECT id, name, email, role FROM "User"');
  console.log('=== USERS ===');
  console.log(users.rows);

  await pool.end();
}

audit().catch(console.error);
