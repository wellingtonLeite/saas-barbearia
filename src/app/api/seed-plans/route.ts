import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = [
      {
        name: "Plano Gratuito",
        base_price: 0,
        max_units: 1,
        max_barbers: 1,
        has_whatsapp: false,
        has_financial_module: false,
        has_loyalty_module: false,
        has_clients_module: false,
        has_products_module: false
      },
      {
        name: "Barber Pro",
        base_price: 89.90,
        max_units: 2,
        max_barbers: 15,
        has_whatsapp: true,
        has_financial_module: true,
        has_loyalty_module: true,
        has_clients_module: true,
        has_products_module: true
      },
      {
        name: "Barber VIP",
        base_price: 189.90,
        max_units: 4,
        max_barbers: 50,
        has_whatsapp: true,
        has_financial_module: true,
        has_loyalty_module: true,
        has_clients_module: true,
        has_products_module: true
      }
    ];

    for (const plan of plans) {
      // Procurar pelo nome OU pelo preço base (para atualizar os antigos "Navalha", "Tesoura de Ouro", etc)
      const existingByName = await db.plan.findFirst({ where: { name: plan.name } });
      const existingByPrice = await db.plan.findFirst({ where: { base_price: plan.base_price } });
      
      const existing = existingByName || existingByPrice;

      if (!existing) {
        await db.plan.create({ data: plan });
      } else {
        await db.plan.update({
          where: { id: existing.id },
          data: plan
        });
      }
    }

    // Opcional: Deletar planos extras que ficaram sobrando e não têm assinaturas
    const allPlans = await db.plan.findMany({ include: { subscriptions: true } });
    const validNames = plans.map(p => p.name);
    for (const oldPlan of allPlans) {
      if (!validNames.includes(oldPlan.name) && oldPlan.subscriptions.length === 0) {
        await db.plan.delete({ where: { id: oldPlan.id } });
      }
    }

    return NextResponse.json({ message: "Planos criados com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
