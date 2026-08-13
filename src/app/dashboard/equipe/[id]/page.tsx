import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, User as UserIcon, CalendarX, Plus } from "lucide-react";
import Link from "next/link";

export default async function BarberManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const barber = await db.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      contracts: {
        include: { unit: true }
      },
      schedule_blocks: {
        orderBy: { start_time: 'desc' }
      }
    }
  });

  if (!barber || barber.contracts.length === 0) notFound();

  const contract = barber.contracts[0];

  async function addBlock(formData: FormData) {
    "use server";
    const date = formData.get("date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const reason = formData.get("reason") as string;

    if (!date || !startTime || !endTime) return;

    const { db } = await import("@/lib/db");
    
    // Assegurando que a data seja interpretada de forma correta (fuso local)
    await db.scheduleBlock.create({
      data: {
        tenantId: contract.unit.tenantId,
        unitId: contract.unitId,
        barberId: barber.id,
        start_time: new Date(`${date}T${startTime}:00`),
        end_time: new Date(`${date}T${endTime}:00`),
        reason: reason || null
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/dashboard/equipe/${barber.id}`);
  }

  async function deleteBlock(formData: FormData) {
    "use server";
    const blockId = formData.get("blockId") as string;
    const { db } = await import("@/lib/db");
    await db.scheduleBlock.delete({ where: { id: blockId } });
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/dashboard/equipe/${barber.id}`);
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <Link href="/dashboard/equipe" className="text-text-secondary hover:text-primary flex items-center gap-2 w-fit transition-colors">
        <ArrowLeft size={18} /> Voltar para Equipe
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
          {barber.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">{barber.name}</h1>
          <p className="text-text-secondary mt-1">Gestão de Agenda e Bloqueios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Formulário de Bloqueio */}
        <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CalendarX className="text-danger" /> Adicionar Bloqueio
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Use esta área para fechar a agenda do funcionário (ex: atestado médico, folga imprevista).
          </p>

          <form action={addBlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Data do Bloqueio</label>
              <input 
                type="date" 
                name="date"
                required
                className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-danger transition-colors"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-1">Início</label>
                <input 
                  type="time" 
                  name="start_time"
                  required
                  defaultValue="00:00"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-danger transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-1">Término</label>
                <input 
                  type="time" 
                  name="end_time"
                  required
                  defaultValue="23:59"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-danger transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Motivo (Opcional)</label>
              <input 
                type="text" 
                name="reason"
                placeholder="Ex: Atestado Médico, Problema Pessoal..."
                className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-danger transition-colors"
              />
            </div>

            <button type="submit" className="w-full py-4 bg-danger text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-danger/90 transition-colors shadow-lg shadow-danger/20 mt-4">
              <Plus size={20} /> Bloquear Agenda
            </button>
          </form>
        </div>

        {/* Lista de Bloqueios */}
        <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-secondary">
            <h2 className="text-xl font-bold text-text-primary">Bloqueios Ativos / Histórico</h2>
          </div>
          
          <div className="divide-y divide-secondary">
            {barber.schedule_blocks.length === 0 && (
              <div className="p-8 text-center text-text-secondary">Nenhum bloqueio registrado.</div>
            )}
            {barber.schedule_blocks.map(block => (
              <div key={block.id} className="p-6 hover:bg-surface-hover transition-colors flex justify-between items-center">
                <div>
                  <p className="font-bold text-danger text-lg">{block.reason || "Bloqueio Manual"}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {block.start_time.toLocaleDateString('pt-BR')} <br/>
                    Das {block.start_time.getHours().toString().padStart(2, '0')}:{block.start_time.getMinutes().toString().padStart(2, '0')} 
                    {' às '} 
                    {block.end_time.getHours().toString().padStart(2, '0')}:{block.end_time.getMinutes().toString().padStart(2, '0')}
                  </p>
                </div>
                
                <form action={deleteBlock}>
                  <input type="hidden" name="blockId" value={block.id} />
                  <button type="submit" className="text-text-secondary hover:text-danger text-sm font-bold border border-secondary hover:border-danger rounded-lg px-4 py-2 transition-colors">
                    Remover
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
