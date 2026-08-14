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

      // 4. Vincular o Dono à Unidade (Ele também atua como barbeiro inicialmente)
      await tx.barberUnit.create({
        data: {
          barberId: owner.id,
          unitId: unit.id,
        }
      });
      
      // 5. Vincular um plano grátis / trial temporário
      const trialPlan = await tx.plan.findFirst({ where: { name: "Starter" } });
      if (trialPlan) {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: trialPlan.id,
            status: "TRIAL",
            current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias de Trial
          }
        });
      }
    });

    // Se chegou até aqui, sucesso total! Redireciona de forma segura
  } catch (error) {
    console.error("ERRO NO CADASTRO:", error);
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // Redireciona fora do try-catch para evitar engolir o NEXT_REDIRECT
  redirect("/login");
}

// Server action para Login
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const user = await db.user.findUnique({ where: { email } });
    const redirectTo = user?.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";

    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'E-mail ou senha inválidos.';
        default:
          return 'Algo deu errado no login.';
      }
    }
    throw error;
  }
}

export async function doLogout() {
  await signOut({ redirectTo: "/" });
}
