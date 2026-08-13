import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Clock, Save, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const defaultHours = {
  "0": { active: false, start: "09:00", end: "18:00" },
  "1": { active: true, start: "09:00", end: "18:00" },
  "2": { active: true, start: "09:00", end: "18:00" },
  "3": { active: true, start: "09:00", end: "18:00" },
  "4": { active: true, start: "09:00", end: "18:00" },
  "5": { active: true, start: "09:00", end: "18:00" },
  "6": { active: true, start: "09:00", end: "14:00" }
};

const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

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
    return <div>Unidade não encontrada.</div>;
  }

  const workingHours = (unit.working_hours as any) || defaultHours;

  async function updateUnitHours(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    
    const newHours: any = {};
    
    for (let i = 0; i < 7; i++) {
      newHours[i.toString()] = {
        active: formData.get(`day_${i}_active`) === "on",
        start: formData.get(`day_${i}_start`) || "09:00",
        end: formData.get(`day_${i}_end`) || "18:00"
      };
    }

    const { db } = await import("@/lib/db");
    await db.unit.update({
      where: { id: unit.id },
      data: { working_hours: newHours }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/config/horarios-barbearia");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <Link href="/dashboard/config" className="text-text-secondary hover:text-primary flex items-center gap-2 w-fit transition-colors">
        <ArrowLeft size={18} /> Voltar para Configurações
      </Link>

      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <Building2 className="text-primary" /> Horário de Funcionamento
        </h1>
        <p className="text-text-secondary mt-2">
          Defina o horário geral em que a barbearia está aberta. Os horários dos barbeiros respeitarão esta janela global.
        </p>
      </div>

      <form action={updateUnitHours} className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
        <div className="space-y-6">
          {daysOfWeek.map((dayName, index) => {
            const dayData = workingHours[index.toString()] || defaultHours[index.toString() as keyof typeof defaultHours];
            
            return (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-secondary rounded-xl hover:bg-surface-hover transition-colors gap-4">
                <div className="flex items-center gap-3 w-56">
                  <label className="relative flex items-center cursor-pointer gap-3">
                    <input type="checkbox" name={`day_${index}_active`} defaultChecked={dayData.active} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary peer-checked:text-success after:content-['Fechado'] peer-checked:after:content-['Aberto'] w-20"></span>
                  </label>
                  <span className="font-bold text-text-primary w-28">{dayName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-text-secondary" />
                  <input 
                    type="time" 
                    name={`day_${index}_start`} 
                    defaultValue={dayData.start}
                    className="bg-background border border-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <span className="text-text-secondary text-sm">até</span>
                  <input 
                    type="time" 
                    name={`day_${index}_end`} 
                    defaultValue={dayData.end}
                    className="bg-background border border-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Save size={20} /> Salvar Horários Gerais
          </button>
        </div>
      </form>
    </div>
  );
}
