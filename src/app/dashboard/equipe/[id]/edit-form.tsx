"use client";

import { useState } from "react";
import { updateTeamMember, deleteTeamMember, toggleBarberActive } from "@/app/actions/team";
import { Save, Trash2, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Scissors, ShieldAlert, Crown, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditBarberFormProps {
  barber: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: string;
  };
  contract: {
    employment_type: string;
    fixed_salary: number;
    service_commission_rate: number;
    product_commission_rate: number;
  };
  unitId: string;
  initialActive: boolean;
  isOwner?: boolean;
}

export function EditBarberForm({ 
  barber, 
  contract, 
  unitId, 
  initialActive, 
  isOwner 
}: EditBarberFormProps) {
  const router = useRouter();
  const [employmentType, setEmploymentType] = useState<string>(contract.employment_type || "COMMISSION_ONLY");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(initialActive);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleActive = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    setIsToggling(true);
    try {
      const res = await toggleBarberActive(barber.id, unitId, nextState);
      if (res?.error) {
        setIsActive(!nextState);
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: nextState 
            ? `${barber.name} agora está ATIVO na agenda e será oferecido pelo SDR no WhatsApp!` 
            : `${barber.name} agora está como APENAS ADMINISTRADOR (ocultado da agenda e do SDR).`
        });
        router.refresh();
      }
    } catch (e: any) {
      setIsActive(!nextState);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("barberId", barber.id);

    try {
      const res = await updateTeamMember(formData);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Informações atualizadas com sucesso!" });
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro inesperado ao salvar alterações." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover ${barber.name} da equipe?`)) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await deleteTeamMember(barber.id);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        setIsDeleting(false);
      } else {
        router.push("/dashboard/equipe");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro ao excluir barbeiro." });
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* CARD DO SWITCHER DE ATENDIMENTO */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isActive 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-amber-500/10 border-amber-500/30"
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${isActive ? "text-emerald-400" : "text-amber-400"}`}>
              {isActive ? <Scissors size={16} /> : <ShieldAlert size={16} />}
              {isActive ? "Atende na Agenda & SDR Ativo" : "Apenas Administrador (Não Corta Cabelo)"}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {isActive 
              ? "Este profissional aparece na página de agendamento online e o Robô SDR no WhatsApp oferece os horários dele." 
              : "Este profissional NÃO recebe agendamentos de clientes e o Robô SDR NÃO cita o nome dele no WhatsApp."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={isToggling}
          onClick={handleToggleActive}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
            isActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isActive ? "translate-x-7" : "translate-x-0"
            }`}
          >
            {isToggling && <Loader2 size={12} className="animate-spin text-slate-800" />}
          </span>
        </button>
      </div>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-xl font-bold text-text-primary">Dados Cadastrais</h2>
        {!isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-danger hover:text-red-400 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Excluir Barbeiro
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex flex-col gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-danger/15 border-2 border-danger/40 text-danger"
          }`}
        >
          <div className="flex items-start gap-2">
            {message.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <span className="text-xs leading-relaxed">{message.text}</span>
          </div>

          {message.type === "error" && message.text.toLowerCase().includes("plano") && (
            <div className="pt-2 border-t border-danger/20 flex justify-end">
              <a
                href="/dashboard/assinatura"
                className="inline-flex items-center gap-1 text-xs font-bold bg-danger text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Fazer Upgrade do Plano
              </a>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
          <input
            type="text"
            name="name"
            defaultValue={barber.name}
            required
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail (Login de Acesso)</label>
            <input
              type="email"
              name="email"
              defaultValue={barber.email}
              required
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Telefone / WhatsApp</label>
            <input
              type="tel"
              name="phone"
              defaultValue={barber.phone || ""}
              placeholder="(11) 99999-9999"
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nova Senha de Acesso <span className="text-xs text-text-secondary font-normal">(deixe em branco para não alterar)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Digite apenas se quiser redefinir a senha"
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 pr-12 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-secondary">
          <h3 className="text-md font-bold text-text-primary mb-4">Contrato e Comissionamento</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                employmentType === "COMMISSION_ONLY"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-secondary bg-background text-text-secondary hover:border-text-secondary"
              }`}
            >
              <input
                type="radio"
                name="employment_type"
                value="COMMISSION_ONLY"
                checked={employmentType === "COMMISSION_ONLY"}
                onChange={() => setEmploymentType("COMMISSION_ONLY")}
                className="sr-only"
              />
              <div className="font-bold text-sm">Apenas Comissão</div>
              <div className="text-xs text-text-secondary mt-1">Ganha % por corte/serviço</div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                employmentType === "CLT"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-secondary bg-background text-text-secondary hover:border-text-secondary"
              }`}
            >
              <input
                type="radio"
                name="employment_type"
                value="CLT"
                checked={employmentType === "CLT"}
                onChange={() => setEmploymentType("CLT")}
                className="sr-only"
              />
              <div className="font-bold text-sm">CLT / Salário Fixo</div>
              <div className="text-xs text-text-secondary mt-1">Fixo mensal (+ comissão opcional)</div>
            </label>
          </div>

          {employmentType === "CLT" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Salário Fixo (R$)</label>
              <input
                type="number"
                step="0.01"
                name="fixed_salary"
                defaultValue={contract.fixed_salary || 0}
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Comissão sobre Serviços (%)</label>
              <input
                type="number"
                name="service_commission_rate"
                defaultValue={contract.service_commission_rate || 50}
                min="0"
                max="100"
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Comissão sobre Produtos (%)</label>
              <input
                type="number"
                name="product_commission_rate"
                defaultValue={contract.product_commission_rate || 10}
                min="0"
                max="100"
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
