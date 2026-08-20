"use client";

import { useState } from "react";
import { registerAndCheckout } from "@/app/actions/checkout";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Bot, 
  ArrowLeft, 
  Loader2, 
  CreditCard, 
  QrCode, 
  Sparkles,
  Users,
  Building2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PlanInfo {
  id: string;
  key: string;
  name: string;
  priceFormatted: string;
  priceNumber: number;
  description: string;
  features: string[];
  hasSdr: boolean;
  maxBarbers: number;
  badge?: string;
}

const PLANS: PlanInfo[] = [
  {
    id: "free",
    key: "gratuito",
    name: "Plano Gratuito",
    priceFormatted: "R$ 0",
    priceNumber: 0,
    description: "Para começar a gerenciar sua cadeira.",
    features: [
      "1 Barbeiro na equipe",
      "1 Unidade Matriz",
      "Agendamento Online dos Clientes",
      "WhatsApp Manual",
    ],
    hasSdr: false,
    maxBarbers: 1
  },
  {
    id: "pro",
    key: "barber-pro",
    name: "Barber Pro",
    priceFormatted: "R$ 89,90/mês",
    priceNumber: 89.9,
    description: "Para barbearias com robô IA e equipe.",
    features: [
      "Agente SDR (IA WhatsApp) Incluso",
      "Até 15 Barbeiros na Equipe",
      "Gestão Financeira & DRE Completa",
      "Comandas, PDV e Estoque",
      "Relatórios e Comissões Automáticas"
    ],
    hasSdr: true,
    maxBarbers: 15,
    badge: "Mais Popular"
  },
  {
    id: "vip",
    key: "barber-vip",
    name: "Barber VIP",
    priceFormatted: "R$ 189,90/mês",
    priceNumber: 189.9,
    description: "Para redes de barbearias e alto fluxo.",
    features: [
      "Agente SDR (IA WhatsApp) Prioritário",
      "Até 50 Barbeiros na Equipe",
      "Multi-Unidades (Filiais Ilimitadas)",
      "Programa de Fidelidade e VIP",
      "Suporte Prioritário 24/7"
    ],
    hasSdr: true,
    maxBarbers: 50,
    badge: "Mais Completo"
  }
];

export function CheckoutClient({ initialPlanKey = "barber-pro" }: { initialPlanKey?: string }) {
  const [selectedPlanKey, setSelectedPlanKey] = useState(() => {
    const found = PLANS.find(p => p.key === initialPlanKey || p.id === initialPlanKey);
    return found ? found.key : "barber-pro";
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlan = PLANS.find(p => p.key === selectedPlanKey) || PLANS[1];
  const isFree = selectedPlan.priceNumber === 0;

  const handleFormAction = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await registerAndCheckout(formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header do Checkout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-secondary">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-xs transition-colors">
            <ArrowLeft size={16} /> Voltar à página inicial
          </Link>
          
          <div className="flex items-center gap-2">
            <Image 
              unoptimized={true} 
              src="/logo_88barber.jpg" 
              alt="88Barber" 
              width={160} 
              height={45} 
              className="h-9 w-auto object-contain mix-blend-lighten"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck size={16} /> Checkout Seguro SSL 256-bit
          </div>
        </div>

        {/* Grid Principal: Seletor de Planos & Formulário Hostinger Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Esquerda: Formulário de Criação da Conta e Checkout (7 Colunas) */}
          <div className="lg:col-span-7 bg-surface border border-secondary rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Seletor de Plano em Abas Horizontais */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                1. Escolha o Plano da sua Barbearia
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanKey === plan.key;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanKey(plan.key)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md" 
                          : "bg-background/60 border-secondary hover:border-text-secondary opacity-75 hover:opacity-100"
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2 right-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary text-white shadow">
                          {plan.badge}
                        </span>
                      )}
                      <h4 className="font-bold text-xs text-text-primary">{plan.name}</h4>
                      <p className="font-extrabold text-sm text-primary mt-1">{plan.priceFormatted}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">{plan.maxBarbers} barbeiro(s)</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulário de Criação da Conta */}
            <form action={handleFormAction} className="space-y-4 pt-4 border-t border-secondary/60">
              <input type="hidden" name="plan" value={selectedPlanKey} />

              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                2. Seus Dados de Acesso
              </label>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Nome da Barbearia */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Nome da sua Barbearia (Marca) *
                </label>
                <input
                  type="text"
                  name="tenantName"
                  required
                  placeholder="Ex: Barbearia Viking"
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Nome do Dono e WhatsApp lado a lado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Seu Nome Completo (Dono) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    WhatsApp para Contato
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* E-mail de Login */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  E-mail de Acesso ao Painel *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="carlos@suabarbearia.com"
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Crie uma Senha Segura *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Botão de Ação Dinâmico */}
              <div className="pt-3">
                {isFree ? (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl text-sm shadow-xl shadow-primary/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Criando Barbearia...
                      </>
                    ) : (
                      <>
                        <Zap size={18} /> Criar Conta Gratuita e Acessar Painel
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 text-white font-extrabold py-4 rounded-2xl text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Gerando Pagamento Seguro...
                      </>
                    ) : (
                      <>
                        <Lock size={18} /> Criar Conta & Pagar {selectedPlan.priceFormatted} (Mercado Pago)
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-text-secondary pt-2">
                <span className="flex items-center gap-1"><Lock size={12}/> Pagamento Seguro</span>
                <span>•</span>
                <span className="flex items-center gap-1"><QrCode size={12}/> PIX & Cartão</span>
                <span>•</span>
                <span>Cancele a qualquer momento</span>
              </div>
            </form>
          </div>

          {/* Coluna Direita: Resumo do Pedido e Benefícios (5 Colunas) */}
          <div className="lg:col-span-5 bg-surface border border-secondary rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-secondary pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Resumo do Pedido
              </span>
              <h3 className="text-2xl font-extrabold text-text-primary mt-2.5">{selectedPlan.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{selectedPlan.description}</p>
            </div>

            <div className="bg-background/80 border border-secondary/60 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs text-text-secondary">Total a Pagar Hoje:</span>
              <span className="text-xl font-extrabold text-primary">{selectedPlan.priceFormatted}</span>
            </div>

            {/* Lista de Recursos Inclusos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Recursos Inclusos:</h4>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                {selectedPlan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span className={feat.includes("IA") || feat.includes("SDR") ? "text-emerald-300 font-bold" : "text-text-primary"}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Depoimento / Garantia */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Sparkles size={14} /> Ativação Imediata
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Assim que seu pagamento for confirmado via PIX ou Cartão no Mercado Pago, sua conta será ativada automaticamente e você já poderá configurar seus barbeiros e conectar o robô no WhatsApp.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
