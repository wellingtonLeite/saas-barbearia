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
        has_loyalty_module: false
      },
      {
        name: "Plano Inicial",
        base_price: 49.90,
        max_units: 1,
        max_barbers: 2,
        has_whatsapp: false,
        has_financial_module: false,
        has_loyalty_module: true
      },
      {
        name: "Plano Intermediário",
        base_price: 89.90,
        max_units: 1,
        max_barbers: 5,
        has_whatsapp: true,
        has_financial_module: false,
        has_loyalty_module: true
      },
      {
        name: "Plano VIP",
        base_price: 149.90,
        max_units: 3,
        max_barbers: 999, // Ilimitado
        has_whatsapp: true,
        has_financial_module: true,
        has_loyalty_module: true
      }
    ];

    for (const plan of plans) {
      const existing = await db.plan.findFirst({ where: { name: plan.name } });
      if (!existing) {
        await db.plan.create({ data: plan });
      } else {
        await db.plan.update({
          where: { id: existing.id },
          data: plan
        });
      }
    }

    return NextResponse.json({ message: "Planos criados com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
