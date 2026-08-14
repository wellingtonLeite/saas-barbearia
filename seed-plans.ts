import { db as prisma } from './src/lib/db';

async function main() {
  // Remover planos antigos se houver (opcional, mas como pode haver lixo, vamos criar novos e deixar os antigos)
  
  const plans = [
    {
      name: "Plano Inicial",
      base_price: 49.90,
      max_units: 1,
      max_barbers: 2,
      has_whatsapp: false,
      has_financial_module: false
    },
    {
      name: "Plano Intermediário",
      base_price: 89.90,
      max_units: 1,
      max_barbers: 5,
      has_whatsapp: true,
      has_financial_module: false
    },
    {
      name: "Plano VIP",
      base_price: 149.90,
      max_units: 3,
      max_barbers: 999, // Ilimitado
      has_whatsapp: true,
      has_financial_module: true
    }
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: plan });
      console.log(`Plano ${plan.name} criado com sucesso.`);
    } else {
      await prisma.plan.update({
        where: { id: existing.id },
        data: plan
      });
      console.log(`Plano ${plan.name} atualizado.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
