import { db } from './src/lib/db';

async function updateNavalha() {
  const plan = await db.plan.findFirst({ where: { name: 'Plano Navalha' } });
  if (plan) {
    await db.plan.update({
      where: { id: plan.id },
      data: { has_financial_module: true }
    });
    console.log("Plano Navalha atualizado com financeiro.");
  }
  process.exit(0);
}
updateNavalha();
