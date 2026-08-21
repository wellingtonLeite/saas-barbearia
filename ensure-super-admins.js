const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setupSuperAdmins() {
  console.log("Iniciando verificação e atualização dos Super Admins...");
  
  const superAdminEmails = [
    { email: "wellington.leite@criativamarketing.com", name: "Wellington Leite" },
    { email: "wellington018@gmail.com", name: "Wellington Leite" },
    { email: "wellington@88barber.com", name: "Wellington Leite" },
    { email: "admin@88barber.com", name: "Super Admin" }
  ];

  const defaultPassword = "123456";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const adminData of superAdminEmails) {
    const existing = await pool.query('SELECT id, email, role, name FROM "User" WHERE LOWER(email) = LOWER($1)', [adminData.email]);

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      await pool.query(
        'UPDATE "User" SET role = $1, name = $2, password_hash = $3, "updatedAt" = NOW() WHERE id = $4',
        ['SUPER_ADMIN', user.name || adminData.name, passwordHash, user.id]
      );
      console.log(`✅ Usuário atualizado para SUPER_ADMIN: ${user.email} (ID: ${user.id})`);
    } else {
      const inserted = await pool.query(
        `INSERT INTO "User" (id, name, email, password_hash, role, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'SUPER_ADMIN', NOW(), NOW())
         RETURNING id, email, role`,
        [adminData.name, adminData.email.toLowerCase(), passwordHash]
      );
      console.log(`✨ Novo SUPER_ADMIN criado: ${inserted.rows[0].email} (ID: ${inserted.rows[0].id})`);
    }
  }

  // Conferir todos os usuários e suas roles
  const allUsers = await pool.query('SELECT id, name, email, role FROM "User" ORDER BY role ASC, name ASC');
  console.log("\n=== LISTA COMPLETA DE USUÁRIOS NO BANCO ===");
  console.table(allUsers.rows);

  await pool.end();
}

setupSuperAdmins().catch((err) => {
  console.error("Erro ao configurar Super Admins:", err);
  process.exit(1);
});
