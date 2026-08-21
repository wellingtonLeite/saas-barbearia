import { db } from "@/lib/db";
import { Users, Briefcase, Percent, Star, Crown, Shield, ArrowUpRight, Zap, Plus } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { BarberActiveToggle } from "./barber-active-toggle";
import { AddBarberForm } from "./add-barber-form";
import { MeiThresholdCard } from "@/components/dashboard/MeiThresholdCard";

export const metadata = {
  title: "Gestão de Equipe | 88Barber",
};

export default async function TeamPage() {
  const session = await auth();
  
  // Buscar a unidade atual e tenant do usuário logado
  const userUnit = await db.barberUnit.findFirst({
    where: { barberId: session?.user?.id },
    include: {
      unit: {
        include: {
          tenant: {
            include: {
              subscription: {
                include: {
                  plan: true
                }
              }
            }
          }
        }
      }
    }
  });

  const unitId = userUnit?.unitId;
  const tenant = userUnit?.unit?.tenant;
  const plan = tenant?.subscription?.plan;

  // Buscar todos os membros vinculados a esta unidade (incluindo o proprietário)
  const teamMembers = unitId ? await db.barberUnit.findMany({
    where: { unitId },
    include: {
      barber: {
        include: {
          barber_reviews: true,
          contracts: {
            where: { unitId }
          }
        }
      }
    },
    orderBy: [
      { barber: { role: 'asc' } }, // OWNER primeiro, depois BARBER
      { createdAt: 'asc' }
    ]
  }) : [];

  // Obter nome e limite do plano
  const planName = plan?.name || "Plano Gratuito";
  let maxBarbers = 1;
  const lowerName = planName.toLowerCase();
  if (lowerName.includes("vip")) {
    maxBarbers = 50;
  } else if (lowerName.includes("pro") || lowerName.includes("intermediário") || lowerName.includes("intermediario") || lowerName.includes("máquina")) {
    maxBarbers = 15;
  } else if (plan?.max_barbers) {
    maxBarbers = plan.max_barbers;
  }

  const totalBarbers = teamMembers.length;
  const isQuotaFull = totalBarbers >= maxBarbers;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header com Visual Limpo e Elegante */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-secondary/40">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Equipe & Profissionais</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Gerencie os barbeiros da sua unidade e permissões de atendimento.
          </p>
        </div>

        {/* Indicador Minimalista de Capacidade */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-secondary text-xs">
            <span className="text-text-secondary">Capacidade:</span>
            <span className={`font-bold ${isQuotaFull ? "text-amber-400" : "text-emerald-400"}`}>
              {totalBarbers} / {maxBarbers}
            </span>
            <span className="text-text-secondary font-medium">({planName})</span>
          </div>

          <Link
            href="/dashboard/assinatura"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-secondary/60 text-text-secondary hover:text-text-primary rounded-xl text-xs font-medium transition-colors border border-secondary"
          >
            <Zap size={13} className="text-primary" /> Planos
          </Link>
        </div>
      </div>

      {/* Monitor de Teto MEI para Barbeiros Parceiros (Lei Salão Parceiro) */}
      <MeiThresholdCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal: Lista de Membros da Equipe */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-secondary/50 flex justify-between items-center">
              <h2 className="font-semibold text-text-primary flex items-center gap-2 text-sm">
                <Users size={18} className="text-primary" /> Profissionais Cadastrados
              </h2>
              <span className="text-xs text-text-secondary">
                {teamMembers.length} {teamMembers.length === 1 ? "membro" : "membros"}
              </span>
            </div>

            <div className="divide-y divide-secondary/40">
              {teamMembers.length === 0 && (
                <div className="p-8 text-center text-text-secondary text-sm">
                  Nenhum membro cadastrado nesta unidade.
                </div>
              )}
              {teamMembers.map(item => {
                const barber = item.barber;
                const contract = barber.contracts[0];
                const reviews = barber.barber_reviews || [];
                const averageRating = reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : null;

                const isOwner = barber.role === 'OWNER';

                return (
                  <div 
                    key={barber.id} 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-background border border-secondary overflow-hidden flex items-center justify-center text-base font-bold text-text-primary shadow-sm">
                          {barber.avatar_url ? (
                            <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                          ) : (
                            barber.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {isOwner && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow" title="Proprietário">
                            <Crown size={10} className="fill-slate-950" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text-primary text-sm">{barber.name}</h3>
                          {isOwner && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Proprietário
                            </span>
                          )}
                        </div>

                        <p className="text-text-secondary text-xs mt-0.5">{barber.email}</p>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary">
                          {averageRating ? (
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <Star size={11} className="fill-primary" />
                              <span>{averageRating}</span>
                              <span className="text-text-secondary font-normal">({reviews.length})</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-text-secondary">Sem avaliações</span>
                          )}

                          {contract && (
                            <span className="text-[11px] text-text-secondary">
                              • {contract.employment_type === 'CLT' ? 'CLT' : `Comissão ${Number(contract.service_commission_rate || 0)}%`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  
                    {/* Ações e Toggle */}
                    <div className="flex sm:flex-col sm:items-end items-center justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-secondary/40">
                      <BarberActiveToggle
                        barberId={barber.id}
                        unitId={unitId!}
                        initialActive={item.is_active}
                        isOwner={isOwner}
                      />

                      <Link 
                        href={`/dashboard/equipe/${barber.id}`} 
                        className="px-2.5 py-1 text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium hover:bg-secondary/50 transition-colors border border-transparent hover:border-secondary"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Adicionar Barbeiro / Card de Upgrade */}
        <div>
          <AddBarberForm
            isQuotaFull={isQuotaFull}
            activeCount={totalBarbers}
            maxBarbers={maxBarbers}
            planName={planName}
          />
        </div>

      </div>
    </div>
  );
}
