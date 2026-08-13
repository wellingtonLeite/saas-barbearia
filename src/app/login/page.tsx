"use client";

import Link from "next/link";
import { authenticate } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-secondary shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <span className="text-3xl font-display font-bold text-primary">SaaS Barbearia</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-6">
          Acesse o seu Painel
        </h2>
        
        {/* Usando action form pro NextAuth */}
        <form action={authenticate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
            <input 
              type="email" 
              name="email"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
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
            className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-2"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Cadastre sua Barbearia
          </Link>
        </div>
      </div>
    </div>
  );
}
