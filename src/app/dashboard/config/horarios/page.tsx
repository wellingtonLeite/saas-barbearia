import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Clock, Info, UserCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarberHoursForm } from "./barber-hours-form";

export const metadata = {
  title: "Meus Horários de Trabalho | 88Barber",
};

export default async function WorkingHoursConfigPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      contracts: {
        include: {
          unit: true
        }
      }
    }
  });

  if (!user || user.contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto mt-16 bg-surface border border-secondary rounded-2xl shadow-xl space-y-4">
        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
          <Clock size={36} />
        </div>
        <h2 className="text-xl font-display font-bold text-text-primary">
          Você não possui um contrato de barbeiro ativo
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          A aba <strong>"Meus Horários"</strong> serve para os barbeiros gerenciarem suas próprias agendas de atendimento.
        </p>
        <p className="text-text-secondary text-xs">
          Se você é o proprietário e também atende clientes na cadeira, vá até o menu{" "}
          <Link href="/dashboard/equipe" className="text-primary hover:underline font-bold">
            Equipe
          </Link>{" "}
          e vincule-se como barbeiro para habilitar sua agenda!
        </p>
      </div>
    );
  }

  const contract = user.contracts[0];
  const unit = contract.unit;
  const unitHours = (unit.working_hours as any) || {};
  const barberHours = (contract.working_hours as any) || {};

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <span className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Clock size={26} />
            </span>
            Meus Horários de Atendimento
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Configure os dias em que você trabalha, seus horários e pausas de almoço na unidade <strong>{unit.name}</strong>.
          </p>
        </div>
      </div>

      {/* Informativo */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-text-secondary text-sm flex items-start gap-3">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          A vitrine pública de agendamentos só exibirá horários para os clientes nos dias em que você estiver marcado como ativo e dentro do seu expediente.
        </p>
      </div>

      {/* Formulário Interativo do Barbeiro */}
      <BarberHoursForm 
        contractId={contract.id} 
        barberHours={barberHours} 
        unitHours={unitHours} 
      />
    </div>
  );
}
