"use client";

import Link from "next/link";
import { authenticate } from "@/app/actions/auth";
import { useActionState } from "react";
import Image from "next/image";
import { ArrowLeft, Scissors } from "lucide-react";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado Esquerdo - Imagem (Escondido no mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image unoptimized={true} 
          src="/barber_interior.jpg" 
          alt="Interior de barbearia premium" 
          fill 
          className="object-cover"
          priority
        />
        <div className="relative z-20 p-12 flex flex-col items-center text-center text-white">
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-primary/30 shadow-2xl">
            <Scissors size={40} className="text-primary" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6">Eleve o nível da sua barbearia</h1>
          <p className="text-xl text-slate-300 max-w-lg">
            Gestão inteligente, agendamentos práticos e controle financeiro completo em um só lugar.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 text-text-secondary hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} />
          <span>Voltar ao início</span>
        </Link>

        <div className="w-full max-w-md animate-fade-in mt-12 lg:mt-0">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-4">
              <Image unoptimized={true} src="/logo_88barber.jpg" alt="88barber" width={300} height={90} className="w-auto h-20 object-contain mix-blend-lighten drop-shadow-2xl" />
            </div>
            <p className="text-text-secondary">Acesse o seu painel de controle</p>
          </div>
          
          <form action={formAction} className="space-y-5 bg-surface p-8 rounded-2xl border border-secondary shadow-2xl">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">E-mail</label>
              <input 
                type="email" 
                name="email"
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Senha</label>
              <input 
                type="password" 
                name="password"
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-fade-in">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all mt-4 flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-text-secondary">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Cadastre sua Barbearia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

