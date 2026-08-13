import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Clock, Save } from "lucide-react";
import { revalidatePath } from "next/cache";

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

export default async function WorkingHoursConfigPage() {
  const session = await auth();
  
  if (!session?.user?.id) return <div>Não autorizado</div>;

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
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto mt-20 bg-surface border border-secondary rounded-2xl">
        <h2 className="text-xl font-bold text-text-primary mb-2">Você não possui um contrato de barbeiro</h2>
        <p className="text-text-secondary text-sm">
          A aba "Meus Horários" serve para os barbeiros gerenciarem suas próprias agendas. 
          Se você (Dono) também atende clientes e corta cabelo, vá até a aba <strong>Equipe</strong> e adicione a si mesmo como membro da equipe para criar sua agenda!
        </p>
      </div>
    );
  }

  const contract = user.contracts[0];
  const unit = contract.unit;
  const unitHours = (unit.working_hours as any) || defaultHours;
  const workingHours = (contract.working_hours as any) || defaultHours;

  async function updateWorkingHours(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    
    // Ler o banco de dados de novo para ter a fonte verdadeira
    const { db } = await import("@/lib/db");
    const freshUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { contracts: { include: { unit: true } } }
    });
    
    const freshUnit = freshUser?.contracts?.[0]?.unit;
    if (!freshUnit) return;

    const freshUnitHours = (freshUnit.working_hours as any) || defaultHours;
    const newHours: any = {};
    
    for (let i = 0; i < 7; i++) {
      const uH = freshUnitHours[i.toString()] || defaultHours[i.toString() as keyof typeof defaultHours];
      
      // O funcionário só decide se está ativo no dia ou não. O horário é OBRIGATORIAMENTE o da barbearia.
      newHours[i.toString()] = {
        active: formData.get(`day_${i}_active`) === "on",
        start: uH.start,
        end: uH.end,
        lunch_active: formData.get(`day_${i}_lunch_active`) === "on",
        lunch_start: formData.get(`day_${i}_lunch_start`) || "12:00",
        lunch_end: formData.get(`day_${i}_lunch_end`) || "13:00"
      };
    }

    await db.barberContract.update({
      where: { id: contract.id },
      data: { working_hours: newHours }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/config/horarios");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Meus Horários</h1>
        <p className="text-text-secondary mt-2">
          Defina os dias e horários em que você trabalha. A agenda pública só mostrará os horários dentro desta janela.
        </p>
      </div>

      <form action={updateWorkingHours} className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
        <div className="space-y-6">
          {daysOfWeek.map((dayName, index) => {
            const dayData = workingHours[index.toString()] || defaultHours[index.toString() as keyof typeof defaultHours];
            const uH = unitHours[index.toString()] || defaultHours[index.toString() as keyof typeof defaultHours];
            
            return (
              <div key={index} className={`flex flex-col p-4 border rounded-xl transition-colors gap-4 ${!uH.active ? 'bg-background border-secondary/20 opacity-60' : 'border-secondary hover:bg-surface-hover'}`}>
                {/* Linha Principal (Dia) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <label className="relative flex items-center cursor-pointer gap-3">
                      <input type="checkbox" name={`day_${index}_active`} defaultChecked={dayData.active && uH.active} disabled={!uH.active} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success peer-disabled:opacity-50"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary peer-checked:text-success peer-disabled:opacity-50 after:content-['Folga'] peer-checked:after:content-['Ativo'] w-16"></span>
                    </label>
                    <span className={`font-bold w-28 ${!uH.active ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{dayName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-text-secondary" />
                    {!uH.active ? (
                      <span className="text-text-secondary text-sm font-medium">Barbearia Fechada</span>
                    ) : (
                      <span className="text-text-primary text-sm font-medium bg-background border border-secondary px-4 py-2 rounded-lg">
                        Das {uH.start} às {uH.end}
                      </span>
                    )}
                  </div>
                </div>

                {/* Linha Secundária (Almoço) - só renderiza se a unidade abrir */}
                {uH.active && (
                  <div className="ml-0 md:ml-[3.25rem] pl-4 md:border-l-2 border-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-secondary/10">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name={`day_${index}_lunch_active`} defaultChecked={dayData.lunch_active} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-warning"></div>
                      </label>
                      <span className="text-sm font-medium text-text-secondary">Pausa de Almoço</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        name={`day_${index}_lunch_start`} 
                        defaultValue={dayData.lunch_start || "12:00"}
                        className="bg-background border border-secondary rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                      />
                      <span className="text-text-secondary text-sm">até</span>
                      <input 
                        type="time" 
                        name={`day_${index}_lunch_end`} 
                        defaultValue={dayData.lunch_end || "13:00"}
                        className="bg-background border border-secondary rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Save size={20} /> Salvar Meus Horários
          </button>
        </div>
      </form>
    </div>
  );
}
