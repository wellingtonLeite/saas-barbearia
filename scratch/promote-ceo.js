require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const emails = [
    'wellington.leite@criativamarketing.com',
    'wellington018@gmail.com'
  ];

  for (const email of emails) {
    const res = await pool.query(
      'UPDATE "User" SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
      ['SUPER_ADMIN', email]
    );
    console.log(`Updated ${email}:`, res.rows);
  }

  const allUsers = await pool.query('SELECT id, name, email, role FROM "User"');
  console.log("Current Users in DB:", allUsers.rows);
  await pool.end();
}

run().catch(console.error);
