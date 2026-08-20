import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarX, Plus, Trash2, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { EditBarberForm } from "./edit-form";

export default async function BarberManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const barber = await db.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      contracts: {
        include: { unit: true }
      },
      units: true,
      schedule_blocks: {
        orderBy: { start_time: 'desc' }
      }
    }
  });

  if (!barber || barber.contracts.length === 0) notFound();

  const contract = barber.contracts[0];
  const barberUnit = barber.units.find(u => u.unitId === contract.unitId);
  const isOwner = barber.role === 'OWNER';
  const isActive = barberUnit?.is_active ?? true;

  async function addBlock(formData: FormData) {
    "use server";
    if (!barber) return;
    const date = formData.get("date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const reason = formData.get("reason") as string;

    if (!date || !startTime || !endTime) return;

    const { db } = await import("@/lib/db");
    
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
    if (!barber) return;
    const blockId = formData.get("blockId") as string;
    const { db } = await import("@/lib/db");
    await db.scheduleBlock.delete({ where: { id: blockId } });
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/dashboard/equipe/${barber.id}`);
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <Link 
        href="/dashboard/equipe" 
        className="text-text-secondary hover:text-primary flex items-center gap-2 w-fit transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Voltar para Equipe
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-2xl font-bold text-text-primary border-2 border-primary/40 shadow-md">
            {barber.avatar_url ? (
              <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
            ) : (
              barber.name.charAt(0).toUpperCase()
            )}
          </div>
          {isOwner && (
            <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg" title="Proprietário">
              <Crown size={14} className="fill-slate-950" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">{barber.name}</h1>
            {isOwner && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Shield size={12} /> Proprietário / Administrador
              </span>
            )}
          </div>
          <p className="text-text-secondary mt-0.5 text-sm">
            {isOwner ? "Gestão de Acesso, Perfil de Atendimento e Agenda" : "Gestão Cadastral, Comissões e Agenda"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Edição Cadastral e Comissões */}
        <div className="lg:col-span-2">
          <EditBarberForm 
            barber={{
              id: barber.id,
              name: barber.name,
              email: barber.email,
              phone: barber.phone,
              avatar_url: barber.avatar_url,
              role: barber.role
            }}
            contract={{
              employment_type: contract.employment_type,
              fixed_salary: Number(contract.fixed_salary),
              service_commission_rate: Number(contract.service_commission_rate),
              product_commission_rate: Number(contract.product_commission_rate),
            }}
            unitId={contract.unitId}
            initialActive={isActive}
            isOwner={isOwner}
          />
        </div>

        {/* Gestão de Bloqueios de Horário */}
        <div className="space-y-6">
          
          <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              <CalendarX size={20} className="text-primary" /> Adicionar Bloqueio de Horário
            </h2>
            <p className="text-text-secondary text-xs mb-6">
              Feche horários específicos na agenda deste profissional (ex: atestados, folgas ou intervalos).
            </p>

            <form action={addBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Data do Bloqueio</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Início</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    defaultValue="00:00"
                    required
                    className="w-full bg-background border border-secondary rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Término</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    defaultValue="23:59"
                    required
                    className="w-full bg-background border border-secondary rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Motivo (Opcional)</label>
                <input 
                  type="text" 
                  name="reason" 
                  placeholder="Ex: Atestado Médico, Folga..."
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-secondary hover:bg-primary/20 text-text-primary hover:text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm border border-secondary"
              >
                <Plus size={16} /> Bloquear Horário na Agenda
              </button>
            </form>
          </div>

          <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-4">Bloqueios Ativos / Histórico</h2>
            
            <div className="space-y-3">
              {barber.schedule_blocks.length === 0 && (
                <p className="text-text-secondary text-xs text-center py-4">Nenhum bloqueio registrado para este barbeiro.</p>
              )}
              {barber.schedule_blocks.map(block => (
                <div key={block.id} className="p-3 bg-background border border-secondary rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text-primary block">
                      {block.start_time.toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-text-secondary">
                      {block.start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {block.end_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {block.reason && <p className="text-primary italic mt-0.5">{block.reason}</p>}
                  </div>

                  <form action={deleteBlock}>
                    <input type="hidden" name="blockId" value={block.id} />
                    <button type="submit" className="p-1.5 text-text-secondary hover:text-danger rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
