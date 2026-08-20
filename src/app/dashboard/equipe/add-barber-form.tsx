"use client";

import { useState, useRef } from "react";
import { addTeamMember } from "@/app/actions/team";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, ArrowUpRight, Zap, Users, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BARBER_AVATAR_PRESETS } from "@/lib/catalog-presets";

interface AddBarberFormProps {
  isQuotaFull?: boolean;
  activeCount?: number;
  maxBarbers?: number;
  planName?: string;
}

export function AddBarberForm({ 
  isQuotaFull = false, 
  activeCount = 0, 
  maxBarbers = 0,
  planName = "Plano Gratuito"
}: AddBarberFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (avatarUrl) {
      formData.set("avatar_url", avatarUrl);
    }

    try {
      const res = await addTeamMember(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Profissional cadastrado com sucesso!" });
        formRef.current?.reset();
        setAvatarUrl("");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro inesperado ao cadastrar profissional." });
    } finally {
      setIsLoading(false);
    }
  };

  // CASO 1: LIMITE ATINGIDO (Design Limpo e Focado em Conversão)
  if (isQuotaFull) {
    return (
      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Capacidade Máxima</h3>
            <p className="text-xs text-text-secondary mt-0.5">{planName} ({activeCount}/{maxBarbers} vagas)</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Você atingiu o limite de profissionais cadastrados no seu plano atual. Faça o upgrade para adicionar mais barbeiros à sua equipe.
        </p>

        <div className="p-3.5 rounded-xl bg-background border border-secondary space-y-2 text-xs">
          <div className="flex items-center justify-between text-text-primary font-medium">
            <span>Barber Pro</span>
            <span className="text-primary font-bold">R$ 89,90/mês</span>
          </div>
          <p className="text-[11px] text-text-secondary">
            • Até 15 barbeiros na equipe<br />
            • Robô IA no WhatsApp incluso
          </p>
        </div>

        <Link
          href="/dashboard/assinatura"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Zap size={14} /> Fazer Upgrade da Assinatura
        </Link>
      </div>
    );
  }

  // CASO 2: FORMULÁRIO DISPONÍVEL
  return (
    <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
          <UserPlus size={18} className="text-primary" /> Novo Profissional
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Cadastre um novo barbeiro para atender na barbearia.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de Foto do Barbeiro */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">
            Foto / Avatar do Profissional
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {BARBER_AVATAR_PRESETS.slice(0, 5).map((preset) => {
              const isSelected = avatarUrl === preset.image_url;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setAvatarUrl(isSelected ? "" : preset.image_url)}
                  className={`relative w-10 h-10 rounded-xl overflow-hidden border transition-all shrink-0 ${
                    isSelected 
                      ? "border-primary ring-2 ring-primary/30 scale-105" 
                      : "border-secondary hover:border-text-secondary opacity-70 hover:opacity-100"
                  }`}
                  title={preset.name}
                >
                  <img src={preset.image_url} alt={preset.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                      <Check size={12} className="text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nome Completo */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Ex: Carlos Silva"
            className="w-full bg-background border border-secondary rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {/* E-mail de Login */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            E-mail de Acesso
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="carlos@barbearia.com"
            className="w-full bg-background border border-secondary rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Telefone / WhatsApp */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            WhatsApp
          </label>
          <input
            type="text"
            name="phone"
            placeholder="(11) 99999-9999"
            className="w-full bg-background border border-secondary rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Senha Provisória
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-background border border-secondary rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Tipo de Contrato & Comissão */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Contrato
            </label>
            <select
              name="employment_type"
              className="w-full bg-background border border-secondary rounded-xl px-2.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="COMMISSION">Comissão</option>
              <option value="CLT">CLT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Comissão (%)
            </label>
            <input
              type="number"
              name="service_commission_rate"
              defaultValue={50}
              min={0}
              max={100}
              className="w-full bg-background border border-secondary rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Cadastrando...
            </>
          ) : (
            "Cadastrar Barbeiro"
          )}
        </button>
      </form>
    </div>
  );
}
