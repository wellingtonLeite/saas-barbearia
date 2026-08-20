const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function fix() {
  const users = await pool.query(`SELECT id, name, role FROM "User" WHERE role = 'OWNER'`);
  for (const user of users.rows) {
    const unit = await pool.query(`SELECT "unitId" FROM "BarberUnit" WHERE "barberId" = $1 LIMIT 1`, [user.id]);
    if (unit.rows[0]) {
      const unitId = unit.rows[0].unitId;
      const contract = await pool.query(`SELECT id FROM "BarberContract" WHERE "barberId" = $1 AND "unitId" = $2`, [user.id, unitId]);
      if (contract.rows.length === 0) {
        await pool.query(`
          INSERT INTO "BarberContract" (id, "barberId", "unitId", employment_type, fixed_salary, service_commission_rate, product_commission_rate, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, 'COMMISSION_ONLY', 0, 100, 100, NOW(), NOW())
        `, [user.id, unitId]);
        console.log(`✅ Contrato criado para o Proprietário: ${user.name}`);
      }
    }
  }
  await pool.end();
}
fix().catch(console.error);