const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: "postgresql://neondb_owner:npg_FVB8jirt1JwG@ep-patient-wind-ay4dddoq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require" 
});

async function main() {
  const plans = [
    {
      id: "plan-1",
      name: "Plano Inicial",
      base_price: 49.90,
      max_units: 1,
      max_barbers: 2,
      has_whatsapp: false,
      has_financial_module: false
    },
    {
      id: "plan-2",
      name: "Plano Intermediário",
      base_price: 89.90,
      max_units: 1,
      max_barbers: 5,
      has_whatsapp: true,
      has_financial_module: false
    },
    {
      id: "plan-3",
      name: "Plano VIP",
      base_price: 149.90,
      max_units: 3,
      max_barbers: 999,
      has_whatsapp: true,
      has_financial_module: true
    }
  ];

  for (const p of plans) {
    const res = await pool.query('SELECT id FROM "Plan" WHERE name = $1', [p.name]);
    if (res.rows.length === 0) {
      await pool.query(
        'INSERT INTO "Plan" (id, name, base_price, max_units, max_barbers, has_whatsapp, has_financial_module, extra_unit_price, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW(), NOW())',
        [p.id, p.name, p.base_price, p.max_units, p.max_barbers, p.has_whatsapp, p.has_financial_module]
      );
      console.log(`Plan ${p.name} inserted via SQL.`);
    } else {
      await pool.query(
        'UPDATE "Plan" SET base_price = $1, max_units = $2, max_barbers = $3, has_whatsapp = $4, has_financial_module = $5, "updatedAt" = NOW() WHERE name = $6',
        [p.base_price, p.max_units, p.max_barbers, p.has_whatsapp, p.has_financial_module, p.name]
      );
      console.log(`Plan ${p.name} updated via SQL.`);
    }
  }
}

main().catch(console.error).finally(() => pool.end());
