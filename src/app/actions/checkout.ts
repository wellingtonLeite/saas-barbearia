"use server";

import { db } from "@/lib/db";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// Ação de Checkout para Tenants Já Logados (Upgrade no Dashboard)
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://88barber.top";
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

// Ação de Checkout Unificado no Estilo Hostinger/HostGator (Cria Conta + Redireciona para Pagamento)
export async function registerAndCheckout(formData: FormData) {
  const tenantName = formData.get("tenantName") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string) || "";
  const planParam = (formData.get("plan") as string) || "gratuito";

  if (!tenantName || !name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  // 1. Verificar se o e-mail já existe
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está cadastrado. Faça login para assinar." };
  }

  // 2. Determinar o plano escolhido
  let plan = null;
  const lowerPlan = planParam.toLowerCase();
  
  if (lowerPlan.includes("vip")) {
    plan = await db.plan.findFirst({ where: { name: { contains: "VIP", mode: "insensitive" } } });
  } else if (lowerPlan.includes("pro") || lowerPlan.includes("intermediario")) {
    plan = await db.plan.findFirst({ where: { name: { contains: "Pro", mode: "insensitive" } } });
  } else {
    plan = await db.plan.findFirst({ 
      where: { 
        OR: [
          { name: { contains: "Gratuito", mode: "insensitive" } },
          { base_price: 0 }
        ]
      },
      orderBy: { base_price: 'asc' }
    });
  }

  if (!plan) {
    plan = await db.plan.findFirst({ orderBy: { base_price: 'asc' } });
  }

  const isFreePlan = Number(plan?.base_price || 0) === 0;

  // 3. Criar Slug único
  let slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slugExists = await db.tenant.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) {
    slug = `${tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${counter}`;
    slugExists = await db.tenant.findUnique({ where: { slug } });
    counter++;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let newTenantId = "";

  // 4. Criar tudo atomicamente
  try {
    await db.$transaction(async (tx) => {
      // Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
          active: true,
        }
      });
      newTenantId = tenant.id;

      // Dono (Owner)
      const owner = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password_hash: hashedPassword,
          role: "OWNER",
        }
      });

      // Unidade Matriz
      const unit = await tx.unit.create({
        data: {
          tenantId: tenant.id,
          name: "Matriz",
        }
      });

      // Barbeiro na Unidade
      await tx.barberUnit.create({
        data: {
          barberId: owner.id,
          unitId: unit.id,
          is_active: true,
        }
      });

      // Contrato de Trabalho
      await tx.barberContract.create({
        data: {
          barberId: owner.id,
          unitId: unit.id,
          employment_type: "COMMISSION_ONLY",
          service_commission_rate: 100,
          product_commission_rate: 100,
        }
      });

      // Assinatura:
      // Se for Gratuito: ACTIVE imediatamente
      // Se for Pago: PAST_DUE (aguardando aprovação do gateway para virar ACTIVE)
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan!.id,
          status: isFreePlan ? "ACTIVE" : "PAST_DUE",
          current_period_end: isFreePlan 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
            : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        }
      });
    });

    // Login automático da nova conta
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (e) {
      console.log("Auto-login pós cadastro:", e);
    }
  } catch (err: any) {
    console.error("Erro no cadastro:", err);
    return { error: err.message || "Falha ao criar conta." };
  }

  // 5. Se for Gratuito, entra direto no painel
  if (isFreePlan) {
    redirect("/dashboard");
  }

  // 6. Se for Plano Pago, gera a sessão de pagamento no Mercado Pago
  const config = await db.gatewayConfig.findUnique({ where: { gateway: 'MERCADO_PAGO' } });
  
  if (!config || !config.is_active || !config.access_token) {
    // Gateway não configurado, redireciona para o painel avisando
    redirect("/dashboard/assinatura?notice=gateway_not_configured");
  }

  const client = new MercadoPagoConfig({ accessToken: config.access_token });
  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://88barber.top";
  const mpBaseUrl = baseUrl.replace("http://", "https://");

  let initPoint = "";
  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: plan!.id,
            title: `Assinatura 88Barber - ${plan!.name}`,
            quantity: 1,
            unit_price: Number(plan!.base_price),
            currency_id: "BRL",
          }
        ],
        external_reference: newTenantId,
        payer: {
          email,
          name,
        },
        back_urls: {
          success: `${mpBaseUrl}/dashboard?payment=approved`,
          failure: `${mpBaseUrl}/dashboard/assinatura?payment=failed`,
          pending: `${mpBaseUrl}/dashboard?payment=pending`
        },
        auto_return: "approved",
      }
    });

    initPoint = response.init_point!;
  } catch (error) {
    console.error("Erro Mercado Pago no Checkout:", error);
    redirect("/dashboard/assinatura?error=checkout_error");
  }

  if (initPoint) {
    redirect(initPoint);
  }
}
