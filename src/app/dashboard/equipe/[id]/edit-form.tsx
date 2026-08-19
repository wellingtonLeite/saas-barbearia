"use client";

import { useState } from "react";
import { updateTeamMember, deleteTeamMember } from "@/app/actions/team";
import { Save, Trash2, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditBarberFormProps {
  barber: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  contract: {
    employment_type: string;
    fixed_salary: number;
    service_commission_rate: number;
    product_commission_rate: number;
  };
}

export function EditBarberForm({ barber, contract }: EditBarberFormProps) {
  const router = useRouter();
  const [employmentType, setEmploymentType] = useState<string>(contract.employment_type || "COMMISSION_ONLY");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setMessage({ type: "success", text: "Informações do barbeiro atualizadas com sucesso!" });
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
    <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">Editar Dados do Profissional</h2>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-danger hover:text-red-400 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
          Excluir Barbeiro
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
          <input
            type="text"
            name="name"
            defaultValue={barber.name}
            required
            className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail (Login de Acesso)</label>
            <input
              type="email"
              name="email"
              defaultValue={barber.email}
              required
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Telefone / WhatsApp</label>
            <input
              type="text"
              name="phone"
              defaultValue={barber.phone || ""}
              placeholder="(11) 99999-9999"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nova Senha de Acesso <span className="text-xs font-normal text-text-secondary/70">(deixe em branco para não alterar)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Digite apenas se quiser redefinir a senha"
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <hr className="border-secondary my-6" />

        <h3 className="text-lg font-bold text-text-primary mb-4">Contrato e Comissionamento</h3>

        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
              employmentType === "COMMISSION_ONLY"
                ? "bg-primary/10 border-primary text-text-primary"
                : "bg-background border-secondary text-text-secondary hover:border-secondary-hover"
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
            <span className="font-bold">Apenas Comissão</span>
            <span className="text-xs opacity-75 mt-1">Ganha % por corte/serviço</span>
          </label>

          <label
            className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
              employmentType === "CLT"
                ? "bg-primary/10 border-primary text-text-primary"
                : "bg-background border-secondary text-text-secondary hover:border-secondary-hover"
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
            <span className="font-bold">CLT / Salário Fixo</span>
            <span className="text-xs opacity-75 mt-1">Fixo mensal (+ comissão opcional)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employmentType === "CLT" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Salário Fixo (R$)</label>
              <input
                type="number"
                step="0.01"
                name="fixed_salary"
                defaultValue={contract.fixed_salary || 0}
                className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Comissão sobre Serviços (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              name="service_commission_rate"
              defaultValue={contract.service_commission_rate || 50}
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Comissão sobre Produtos (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              name="product_commission_rate"
              defaultValue={contract.product_commission_rate || 10}
              className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-6 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
