"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// Server action para Cadastro de Nova Barbearia
export async function registerTenant(formData: FormData) {
  const tenantName = formData.get("tenantName") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!tenantName || !name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  try {
    // Verificar se e-mail já existe
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: "E-mail já cadastrado." };

    // Criar Slug único baseado no nome
    let slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Garantir que o slug seja único
    let slugExists = await db.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${counter}`;
      slugExists = await db.tenant.findUnique({ where: { slug } });
      counter++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação para criar tudo junto de forma segura
    await db.$transaction(async (tx) => {
      // 1. Criar o Tenant (Marca)
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
          active: true,
        }
      });

      // 2. Criar o Usuário Dono (OWNER)
      const owner = await tx.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          role: "OWNER",
        }
      });

      // 3. Criar a primeira Unidade (Filial Matriz)
      const unit = await tx.unit.create({
        data: {
          tenantId: tenant.id,
          name: "Matriz",
        }
      });

      // 4. Vincular o Dono à Unidade
      await tx.barberUnit.create({
        data: {
          barberId: owner.id,
          unitId: unit.id,
          is_active: true,
        }
      });

      // 5. Criar Contrato de Trabalho para o Proprietário
      await tx.barberContract.create({
        data: {
          barberId: owner.id,
          unitId: unit.id,
          employment_type: "COMMISSION_ONLY",
          service_commission_rate: 100,
          product_commission_rate: 100,
        }
      });
      
      // 6. Vincular um plano inicial
      const defaultPlan = await tx.plan.findFirst({ where: { name: "Plano VIP" } }) || await tx.plan.findFirst();
      if (defaultPlan) {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: defaultPlan.id,
            status: "ACTIVE",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });
      }
    });

    // Login automático pós-registro
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (e) {
      console.log("Auto-login post register:", e);
    }

  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return { error: error.message || "Erro ao criar conta." };
  }

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas." };
        default:
          return { error: "Algo deu errado no login." };
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
