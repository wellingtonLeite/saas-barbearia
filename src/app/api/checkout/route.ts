import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, planId } = body;

    if (!tenantId || !planId) {
      return NextResponse.json({ error: "Faltando tenantId ou planId." }, { status: 400 });
    }

    // Buscar Plano
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    // Buscar Configuração do Gateway do Super Admin
    const config = await db.gatewayConfig.findUnique({ where: { gateway: 'MERCADO_PAGO' } });
    
    if (!config || !config.is_active || !config.access_token) {
      return NextResponse.json({ 
        error: "O módulo de pagamento do sistema não está configurado. Entre em contato com o suporte." 
      }, { status: 500 });
    }

    // Inicializar Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: config.access_token });
    const preference = new Preference(client);

    // O baseURL deveria vir de variável de ambiente, fallback para localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `Assinatura SaaS Barbearia - ${plan.name}`,
            quantity: 1,
            unit_price: Number(plan.base_price),
            currency_id: "BRL",
          }
        ],
        external_reference: tenantId,
        back_urls: {
          success: `${baseUrl}/dashboard/assinatura?status=success`,
          failure: `${baseUrl}/dashboard/assinatura?status=failure`,
          pending: `${baseUrl}/dashboard/assinatura?status=pending`
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" } // Desativa boleto se quiser apenas PIX/Cartão
          ],
          installments: 1
        }
      }
    });

    return NextResponse.json({ url: response.init_point });
  } catch (error: any) {
    console.error("Erro no checkout Mercado Pago:", error);
    return NextResponse.json({ error: "Erro interno ao gerar pagamento." }, { status: 500 });
  }
}
