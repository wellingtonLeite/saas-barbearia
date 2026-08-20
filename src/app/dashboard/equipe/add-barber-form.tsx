"use client";

import { useState, useRef } from "react";
import { addTeamMember } from "@/app/actions/team";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddBarberForm() {
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

      <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-6 text-sm text-text-secondary">
        <p><strong>Acesso do Funcionário:</strong></p>
        <p className="mt-1 text-xs">
          Após cadastrar, passe o E-mail e a Senha para o barbeiro. Ele utilizará a <strong>mesma tela de login do sistema</strong> (<span className="text-primary font-medium">/login</span>) para acessar sua própria agenda restrita.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success font-medium"
              : "bg-danger/10 border border-danger/20 text-danger font-medium"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
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
