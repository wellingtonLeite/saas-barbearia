require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query('SELECT id, name, email, role FROM "User"');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

run().catch(console.error);
