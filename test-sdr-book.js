const { Pool } = require('pg');
require('dotenv').config();

async function testBooking() {
  const payload = {
    instance: "barbearia-rico",
    barberName: "Bruno",
    serviceName: "Corte",
    clientPhone: "5511977252905",
    clientName: "Wellington Leite",
    date: "2026-08-20",
    time: "10:15"
  };

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Buscar tenant
  const tenantRes = await pool.query(`SELECT id, name, slug FROM "Tenant" WHERE slug = 'barbearia-rico'`);
  const tenant = tenantRes.rows[0];
  console.log("Tenant:", tenant);

  const barberRes = await pool.query(`SELECT u.id, u.name FROM "User" u JOIN "BarberUnit" bu ON bu."barberId" = u.id WHERE u.name ILIKE '%Bruno%'`);
  console.log("Barber Bruno:", barberRes.rows);

  const serviceRes = await pool.query(`SELECT id, name, price FROM "Service" WHERE "tenantId" = $1 LIMIT 1`, [tenant.id]);
  console.log("Service:", serviceRes.rows);

  await pool.end();
}

testBooking().catch(console.error);