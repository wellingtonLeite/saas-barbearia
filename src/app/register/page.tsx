"use client";

import Link from "next/link";
import { registerTenant } from "@/app/actions/auth";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-secondary shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-2">
          Crie sua Barbearia
        </h2>
        <p className="text-text-secondary text-center text-sm mb-6">
          Comece a gerenciar seus agendamentos hoje mesmo.
        </p>
        
        <form action={registerTenant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Barbearia (Marca)</label>
            <input 
              type="text" 
              name="tenantName"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Ex: Barbearia do João"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Seu Nome (Dono)</label>
            <input 
              type="text" 
              name="name"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="João Silva"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail de Acesso</label>
            <input 
              type="email" 
              name="email"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="joao@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Senha Segura</label>
            <input 
              type="password" 
              name="password"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-4"
          >
            Criar Conta e Barbearia
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Já possui uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Faça o login
          </Link>
        </div>
      </div>
    </div>
  );
}
