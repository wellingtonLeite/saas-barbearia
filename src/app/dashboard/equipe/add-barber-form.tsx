"use client";

import { useState, useRef } from "react";
import { addTeamMember } from "@/app/actions/team";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, ArrowUpRight, Camera, Sparkles, Check, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BARBER_AVATAR_PRESETS } from "@/lib/catalog-presets";

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nameInput, setNameInput] = useState("");

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
        setMessage({ type: "success", text: "Barbeiro cadastrado com sucesso!" });
        formRef.current?.reset();
        setAvatarUrl("");
        setNameInput("");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro inesperado ao cadastrar barbeiro." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-xl p-6 sticky top-6 shadow-sm">
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
          Após cadastrar, passe o E-mail e a Senha para o barbeiro. Ele utilizará a <strong>mesma tela de login do sistema</strong> (<span className="text-primary font-medium">/login</span>) para acessar sua agenda.
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
        {/* SELETOR VISUAL DE FOTO / AVATAR DO BARBEIRO */}
        <div className="p-4 bg-background/60 border border-secondary rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Camera size={14} className="text-primary" /> Foto / Avatar do Barbeiro
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-[11px] text-text-secondary hover:text-danger transition-colors"
              >
                Remover foto
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Preview do Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-primary/60 overflow-hidden bg-surface flex items-center justify-center shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl("")}
                  />
                ) : (
                  <span className="text-xl font-bold text-text-secondary uppercase">
                    {nameInput ? nameInput.charAt(0) : <Camera size={20} />}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-text-secondary">Escolha uma foto da galeria rápida ou cole a URL:</p>
              <input
                type="url"
                name="avatar_url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full bg-background border border-secondary rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Galeria de Avatares Rápidos */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-text-secondary mb-2 font-medium">
              <Sparkles size={12} className="text-primary" /> Modelos profissionais recomendados:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BARBER_AVATAR_PRESETS.map((preset) => {
                const isSelected = avatarUrl === preset.image_url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.image_url)}
                    title={`${preset.name} - ${preset.roleTitle}`}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 scale-95"
                        : "border-secondary/60 hover:border-primary/60"
                    }`}
                  >
                    <img
                      src={preset.image_url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="bg-primary text-black rounded-full p-0.5 shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
          <input 
            type="text" 
            name="name"
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
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
          className="w-full bg-primary text-black font-bold py-3.5 rounded-lg hover:bg-primary-hover transition-colors mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          Cadastrar Barbeiro
        </button>
      </form>
    </div>
  );
}
