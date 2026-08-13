import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const dataId = url.searchParams.get("data.id");

    // O Mercado Pago envia o ID do pagamento via query params no formato ?data.id=123&action=payment.created
    if (!dataId) {
      return NextResponse.json({ success: true }, { status: 200 }); // Ignora pings e coisas sem dataId
    }

    // Buscar a config do gateway
    const config = await db.gatewayConfig.findUnique({ where: { gateway: 'MERCADO_PAGO' } });
    if (!config || !config.is_active || !config.access_token) {
      return NextResponse.json({ error: "Gateway não configurado" }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken: config.access_token });
    const paymentApi = new Payment(client);

    // Buscar os dados reais do pagamento na API
    const paymentData = await paymentApi.get({ id: dataId });

    if (!paymentData) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    const status = paymentData.status;
    const externalReference = paymentData.external_reference; // É o nosso tenantId

    if (externalReference && status === "approved") {
      // O pagamento foi aprovado!
      // Vamos encontrar a assinatura deste tenant e renovar
      const tenant = await db.tenant.findUnique({ 
        where: { id: externalReference },
        include: { subscription: true }
      });

      if (tenant && tenant.subscription) {
        // Renova por mais 30 dias
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);

        await db.subscription.update({
          where: { id: tenant.subscription.id },
          data: {
            status: 'ACTIVE',
            current_period_end: newEndDate
          }
        });
        
        // Garante que o tenant esteja ativo
        await db.tenant.update({
          where: { id: tenant.id },
          data: { active: true }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Mercado Pago Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
