import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Building2, ChevronLeft, CalendarClock, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UnitHoursForm } from "./unit-hours-form";

export const metadata = {
  title: "Horários da Barbearia | 88Barber",
};

export default async function UnitWorkingHoursPage() {
  const session = await auth();
  
  if (!session?.user?.id || (session.user.role !== 'OWNER' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: { include: { unit: true } }
    }
  });

  const unit = user?.units?.[0]?.unit;

  if (!unit) {
    return (
      <div className="p-8 text-center bg-surface border border-secondary rounded-2xl max-w-md mx-auto mt-20">
        <h2 className="text-xl font-bold text-text-primary mb-2">Unidade não encontrada</h2>
        <p className="text-text-secondary text-sm">Não foi possível carregar os dados da unidade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config" 
          className="p-2.5 bg-surface border border-secondary rounded-xl text-text-secondary hover:text-primary hover:border-primary/50 transition-colors"
          title="Voltar para Configurações"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
              <span className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Building2 size={26} />
              </span>
              Horários de Funcionamento da Barbearia
            </h1>
          </div>
          <p className="text-text-secondary mt-1 text-sm">
            Defina os dias de abertura, fechamento e janelas de atendimento da barbearia ({unit.name}).
          </p>
        </div>
      </div>

      {/* Card Informativo */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-text-secondary text-sm flex items-start gap-3">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          Os horários configurados aqui definem a janela máxima em que o estabelecimento aceita clientes. Os horários individuais dos barbeiros e do Agente IA SDR respeitarão estas janelas.
        </p>
      </div>

      {/* Formulário Interativo com Switchers e Intervalos */}
      <UnitHoursForm unitId={unit.id} initialHours={unit.working_hours} />
    </div>
  );
}
