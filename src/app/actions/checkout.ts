"use server";

import { db } from "@/lib/db";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) throw new Error("Não autorizado");

  const tenantId = formData.get("tenantId") as string;
  const planId = formData.get("planId") as string;

  if (!tenantId || !planId) throw new Error("Faltando tenant ou plan");

  // Buscar Plano
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Plano não encontrado");

  // Buscar Configuração do Gateway do Super Admin
  const config = await db.gatewayConfig.findUnique({ where: { gateway: 'MERCADO_PAGO' } });
  
  if (!config || !config.is_active || !config.access_token) {
    throw new Error("O módulo de pagamento (Mercado Pago) não foi configurado pelo dono do sistema.");
  }

  // Inicializar Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: config.access_token });
  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // O Mercado Pago recusa back_urls com http:// (retornando erro invalid_auto_return)
  // Portanto, forçamos https para evitar erro em desenvolvimento local.
  const mpBaseUrl = baseUrl.replace("http://", "https://");

  let initPoint = "";

  try {
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
          success: `${mpBaseUrl}/dashboard/assinatura?status=success`,
          failure: `${mpBaseUrl}/dashboard/assinatura?status=failure`,
          pending: `${mpBaseUrl}/dashboard/assinatura?status=pending`
        },
        auto_return: "approved",
        payment_methods: {
          installments: 1
        }
      }
    });

    initPoint = response.init_point!;
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    throw new Error("Erro ao gerar link de pagamento.");
  }

  if (initPoint) {
    redirect(initPoint);
  }
}
