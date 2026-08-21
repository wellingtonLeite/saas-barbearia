require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanup() {
  console.log("=== EXECUTANDO LIMPEZA ESTRITA DE SUPER ADMINS NO NEON POSTGRESQL ===");

  // 1. Garantir que wellington.leite@criativamarketing.com é SUPER_ADMIN
  await pool.query(`
    UPDATE "User"
    SET role = 'SUPER_ADMIN', "updatedAt" = NOW()
    WHERE LOWER(email) = 'wellington.leite@criativamarketing.com'
  `);
  console.log("✅ wellington.leite@criativamarketing.com confirmado como SUPER_ADMIN.");

  // 2. Reverter wellington018@gmail.com para OWNER
  await pool.query(`
    UPDATE "User"
    SET role = 'OWNER', "updatedAt" = NOW()
    WHERE LOWER(email) = 'wellington018@gmail.com'
  `);
  console.log("✅ wellington018@gmail.com ajustado para OWNER.");

  // 3. Deletar contas extras criadas indevidamente (admin@88barber.com e wellington@88barber.com)
  const deleted = await pool.query(`
    DELETE FROM "User"
    WHERE LOWER(email) IN ('admin@88barber.com', 'wellington@88barber.com')
    RETURNING email, role
  `);
  console.log("🗑️ Contas indevidas removidas:", deleted.rows);

  // 4. Garantir que NENHUM outro usuário no banco além de wellington.leite@criativamarketing.com seja SUPER_ADMIN
  await pool.query(`
    UPDATE "User"
    SET role = 'OWNER', "updatedAt" = NOW()
    WHERE role = 'SUPER_ADMIN' AND LOWER(email) != 'wellington.leite@criativamarketing.com'
  `);

  // 5. Exibir a lista final de todos os usuários no banco
  const users = await pool.query(`
    SELECT email, name, role, "createdAt"
    FROM "User"
    ORDER BY role ASC, email ASC
  `);

  console.log("\n=== SNAPSHOT ATUALIZADO DO BANCO DE DADOS (TABELA User) ===");
  console.table(users.rows);

  await pool.end();
}

cleanup().catch(console.error);
