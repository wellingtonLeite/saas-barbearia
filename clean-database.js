const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanDatabase() {
  console.log('--- INICIANDO AUDITORIA E LIMPEZA ---');

  // 1. Identificar o ID da Barbearia do Rico
  const tenantRes = await pool.query('SELECT id, name, slug FROM "Tenant" WHERE slug = \ OR name ILIKE \', ['barbearia-rico', '%Rico%']);
  const ricoTenant = tenantRes.rows[0];
  console.log('Barbearia do Rico encontrada:', ricoTenant);

  if (!ricoTenant) {
    console.error('Barbearia do Rico não encontrada!');
    await pool.end();
    return;
  }

  // 2. Identificar membros permitidos da Barbearia do Rico + Super Admin
  // Donos, Barbeiros vinculados e Super Admins
  const allowedUsersRes = await pool.query(
    SELECT DISTINCT u.id, u.name, u.email, u.role 
    FROM "User" u
    LEFT JOIN "BarberUnit" bu ON bu."barberId" = u.id
    LEFT JOIN "Unit" un ON un.id = bu."unitId"
    WHERE u.role = 'SUPER_ADMIN' 
       OR un."tenantId" = \
       OR u.email IN ('wellington.leite@criativamarketing.com', 'wellington018@gmail.com', 'teste@teste.com')
  , [ricoTenant.id]);

  const allowedIds = allowedUsersRes.rows.map(u => u.id);
  console.log('Usuários mantidos:', allowedUsersRes.rows);

  // 3. Deletar agendamentos, comandas, etc que não sejam da Barbearia do Rico
  await pool.query('DELETE FROM "ComandaItem" WHERE "comandaId" IN (SELECT id FROM "Comanda" WHERE "tenantId" != \)', [ricoTenant.id]);
  await pool.query('DELETE FROM "Comanda" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Appointment" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Review" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Notification" WHERE "tenantId" != \ AND "tenantId" IS NOT NULL', [ricoTenant.id]);
  await pool.query('DELETE FROM "Transaction" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Sale" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "StockMovement" WHERE "productId" IN (SELECT id FROM "Product" WHERE "tenantId" != \)', [ricoTenant.id]);
  await pool.query('DELETE FROM "Product" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "ScheduleBlock" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "BarberContract" WHERE "unitId" NOT IN (SELECT id FROM "Unit" WHERE "tenantId" = \)', [ricoTenant.id]);
  await pool.query('DELETE FROM "BarberUnit" WHERE "unitId" NOT IN (SELECT id FROM "Unit" WHERE "tenantId" = \)', [ricoTenant.id]);
  await pool.query('DELETE FROM "Unit" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Subscription" WHERE "tenantId" != \', [ricoTenant.id]);
  await pool.query('DELETE FROM "Tenant" WHERE id != \', [ricoTenant.id]);

  // 4. Deletar todos os usuários que não estão na lista de permitidos
  const deleteUsersRes = await pool.query(
    DELETE FROM "User" 
    WHERE id NOT IN ()
  , allowedIds);
  console.log(Usuários temporários / não autorizados deletados: );

  // 5. Relatório Final
  const finalTenants = await pool.query('SELECT id, name, slug FROM "Tenant"');
  const finalUsers = await pool.query('SELECT id, name, email, role FROM "User"');

  console.log('=== BANCO AUDITADO E LIMPO ===');
  console.log('Tenants restantes:', finalTenants.rows);
  console.log('Usuários restantes:', finalUsers.rows);

  await pool.end();
}

cleanDatabase().catch(console.error);
