import { db } from './src/lib/db';

async function updatePlans() {
  console.log("Atualizando planos no banco de dados...");
  
  const plans = await db.plan.findMany({ orderBy: { base_price: 'asc' } });
  
  if (plans.length >= 3) {
    await db.plan.update({
      where: { id: plans[0].id },
      data: { name: "Plano Navalha", max_barbers: 2, base_price: 49.90 }
    });
    console.log("Plano 1 atualizado -> Navalha");

    await db.plan.update({
      where: { id: plans[1].id },
      data: { name: "Plano Máquina de Corte", max_barbers: 10, base_price: 89.90 }
    });
    console.log("Plano 2 atualizado -> Máquina de Corte");

    await db.plan.update({
      where: { id: plans[2].id },
      data: { name: "Plano Tesoura de Ouro", max_barbers: 50, base_price: 149.90 }
    });
    console.log("Plano 3 atualizado -> Tesoura de Ouro");
  }

  const franquiaPlan = await db.plan.findFirst({ where: { name: "Plano Franquia" } });
  if (!franquiaPlan) {
    await db.plan.create({
      data: {
        name: "Plano Franquia",
        base_price: 0,
        max_units: 999,
        max_barbers: 9999,
        has_whatsapp: true,
        has_financial_module: true
      }
    });
    console.log("Plano 4 criado -> Franquia (Sob Consulta)");
  } else {
    await db.plan.update({
      where: { id: franquiaPlan.id },
      data: { base_price: 0, max_barbers: 9999 }
    });
    console.log("Plano 4 atualizado -> Franquia");
  }

  console.log("Tudo pronto!");
  process.exit(0);
}

updatePlans();
