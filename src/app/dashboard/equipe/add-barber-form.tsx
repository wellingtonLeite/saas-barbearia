"use client";

import { useState, useRef } from "react";
import { addTeamMember } from "@/app/actions/team";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AddBarberFormProps {
  isQuotaFull?: boolean;
  activeCount?: number;
  maxBarbers?: number;
}

export function AddBarberForm({ isQuotaFull = false, activeCount = 0, maxBarbers = 0 }: AddBarberFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await addTeamMember(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Barbeiro cadastrado com sucesso!" });
        formRef.current?.reset();
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro inesperado ao cadastrar barbeiro." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-xl p-6 sticky top-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-primary">
        <UserPlus className="text-primary" /> Adicionar Barbeiro
      </h2>

      {/* Alerta prévio caso o limite do plano já esteja atingido */}
      {isQuotaFull && (
        <div className="bg-danger/15 border-2 border-danger/50 p-4 rounded-xl mb-6 text-sm text-danger flex flex-col gap-2 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-danger text-sm">Limite do Plano Atingido</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Você atingiu o limite de <strong>{maxBarbers} {maxBarbers === 1 ? "membro" : "membros"}</strong> ({activeCount}/{maxBarbers}). Faça upgrade da sua assinatura para adicionar mais profissionais.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/assinatura"
            className="mt-1 inline-flex items-center justify-center gap-1.5 w-full bg-danger hover:bg-red-600 text-white font-bold py-2.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
          >
            Fazer Upgrade de Plano <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-6 text-sm text-text-secondary">
        <p><strong>Acesso do Funcionário:</strong></p>
        <p className="mt-1 text-xs">
          Após cadastrar, passe o E-mail e a Senha para o barbeiro. Ele utilizará a <strong>mesma tela de login do sistema</strong> (<span className="text-primary font-medium">/login</span>) para acessar sua própria agenda restrita.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex flex-col gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success font-medium"
              : "bg-danger/15 border-2 border-danger/40 text-danger font-medium"
          }`}
        >
          <div className="flex items-start gap-2">
            {message.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-danger" />
            )}
            <span className="text-xs leading-relaxed">{message.text}</span>
          </div>

          {message.type === "error" && message.text.toLowerCase().includes("plano") && (
            <div className="pt-2 border-t border-danger/20 flex justify-end">
              <Link
                href="/dashboard/assinatura"
                className="inline-flex items-center gap-1 text-xs font-bold bg-danger text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Fazer Upgrade Agora <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
          <input 
            type="text" 
            name="name"
            required
            placeholder="Ex: Carlos Oliveira"
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">E-mail (Login)</label>
          <input 
            type="email" 
            name="email"
            required
            placeholder="carlos@barbearia.com"
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Telefone / WhatsApp</label>
          <input 
            type="tel" 
            name="phone"
            placeholder="(11) 99999-9999"
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Senha de Acesso</label>
          <input 
            type="password" 
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo Contrato</label>
            <select 
              name="employment_type"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="COMMISSION_ONLY">Comissão</option>
              <option value="CLT">CLT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Comissão Serviços (%)</label>
            <input 
              type="number" 
              name="service_commission_rate"
              defaultValue="50"
              min="0"
              max="100"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primary-hover transition-colors mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          Cadastrar Barbeiro
        </button>
      </form>
    </div>
  );
}
