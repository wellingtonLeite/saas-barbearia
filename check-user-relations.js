const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const users = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, 
           bu."unitId", bu.is_active as "unit_active",
           un.name as "unit_name", un."tenantId",
           t.name as "tenant_name", t.slug as "tenant_slug"
    FROM "User" u
    LEFT JOIN "BarberUnit" bu ON u.id = bu."barberId"
    LEFT JOIN "Unit" un ON bu."unitId" = un.id
    LEFT JOIN "Tenant" t ON un."tenantId" = t.id
  `);
  console.log(JSON.stringify(users.rows, null, 2));
  await pool.end();
}

inspect().catch(console.error);
