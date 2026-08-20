const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addOwnerContract() {
  const owner = await pool.query('SELECT id, name FROM "User" WHERE role = \ OR email = \', ['OWNER', 'wellington018@gmail.com']);
  const unit = await pool.query('SELECT id FROM "Unit" LIMIT 1');

  if (owner.rows[0] && unit.rows[0]) {
    const ownerId = owner.rows[0].id;
    const unitId = unit.rows[0].id;

    // Check if contract already exists
    const existing = await pool.query('SELECT id FROM "BarberContract" WHERE "barberId" = \ AND "unitId" = \', [ownerId, unitId]);
    if (existing.rows.length === 0) {
      const res = await pool.query(
        INSERT INTO "BarberContract" ("id", "barberId", "unitId", "employment_type", "fixed_salary", "service_commission_rate", "product_commission_rate", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), \, \, 'COMMISSION_ONLY', 0, 100, 100, NOW(), NOW())
        RETURNING *
      , [ownerId, unitId]);
      console.log('? Contrato criado para o Dono / Barbeiro Bruno Silva:', res.rows[0]);
    } else {
      console.log('Contrato já existe!');
    }
  }

  await pool.end();
}

addOwnerContract().catch(console.error);
