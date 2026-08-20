import { db } from "@/lib/db";
import { Users, Briefcase, Percent, Star, Crown, Shield, AlertTriangle, ArrowUpRight, CheckCircle2, Zap } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { BarberActiveToggle } from "./barber-active-toggle";
import { AddBarberForm } from "./add-barber-form";

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

  // Contagem direta de vagas utilizadas
  const totalBarbers = teamMembers.length;
  const isQuotaFull = totalBarbers >= maxBarbers;
  const percentage = Math.min(100, Math.round((totalBarbers / maxBarbers) * 100));
  const availableSlots = Math.max(0, maxBarbers - totalBarbers);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Gestão de Equipe</h1>
          <p className="text-text-secondary mt-1">Gerencie seus barbeiros, proprietários e regras de atendimento.</p>
        </div>

        <Link
          href="/dashboard/assinatura"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-primary/20 text-text-primary hover:text-primary rounded-xl text-xs font-bold transition-all border border-secondary self-start sm:self-auto"
        >
          <Zap size={14} className="text-primary" /> Ver Planos & Upgrade
        </Link>
      </div>

      {/* CARD DE RESUMO: PLANO ATUAL & VAGAS UTILIZADAS */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-secondary/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary">
                  Plano Atual: <span className="text-primary">{planName}</span>
                </h3>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Controle de membros da equipe e capacidade do plano contratado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Vagas Utilizadas:</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
              isQuotaFull 
                ? "bg-danger/20 text-danger border-danger/40" 
                : percentage >= 80 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}>
              {totalBarbers} / {maxBarbers}
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="pt-5 pb-2">
          <div className="flex justify-between items-center text-xs text-text-secondary font-medium mb-2">
            <span>Utilização das vagas: <strong className="text-text-primary">{percentage}%</strong></span>
            <span>{availableSlots} {availableSlots === 1 ? "vaga restante" : "vagas restantes"}</span>
          </div>
          <div className="w-full h-3.5 bg-background border border-secondary rounded-full p-0.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isQuotaFull
                  ? "bg-gradient-to-r from-amber-500 to-danger shadow-sm shadow-danger/50"
                  : percentage >= 80
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-500/40"
                    : "bg-gradient-to-r from-primary to-emerald-400"
              }`}
              style={{ width: `${Math.max(5, percentage)}%` }}
            />
          </div>
        </div>

        {/* Pílulas de resumo */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-secondary/40 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <CheckCircle2 size={13} /> <strong>{totalBarbers}</strong> Membros Cadastrados
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
            <Zap size={13} /> <strong>{availableSlots}</strong> Vagas Disponíveis
          </span>
        </div>
      </div>

      {/* BANNER DE AVISO SE O LIMITE FOR ATINGIDO */}
      {isQuotaFull && (
        <div className="bg-gradient-to-r from-amber-500/15 via-danger/15 to-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-bold text-base text-amber-300">
                ⚠️ Limite de barbeiros atingido para o seu plano ({planName})
              </h4>
              <p className="text-sm text-text-secondary mt-1">
                Faça upgrade para adicionar mais membros à sua barbearia.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/assinatura"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-primary hover:brightness-110 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-sm whitespace-nowrap transition-all hover:scale-105 shrink-0 self-stretch md:self-auto justify-center"
          >
            Fazer Upgrade da Assinatura <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Equipe */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-secondary rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-primary" /> Membros da Barbearia
              </h2>
              <span className="text-xs text-text-secondary font-medium">
                {teamMembers.length} {teamMembers.length === 1 ? "membro" : "membros"}
              </span>
            </div>
            <div className="divide-y divide-secondary">
              {teamMembers.length === 0 && (
                <div className="p-8 text-center text-text-secondary">Nenhum membro na equipe ainda.</div>
              )}
              {teamMembers.map(item => {
                const barber = item.barber;
                const contract = barber.contracts[0];
                const reviews = barber.barber_reviews || [];
                const averageRating = reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "Sem notas";

                const isOwner = barber.role === 'OWNER';

                return (
                  <div key={barber.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xl font-bold text-text-primary border-2 border-primary/30 shadow-sm">
                          {barber.avatar_url ? (
                            <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                          ) : (
                            barber.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {isOwner && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-lg" title="Proprietário">
                            <Crown size={12} className="fill-slate-950" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-text-primary">{barber.name}</h3>
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Shield size={10} /> Proprietário
                            </span>
                          )}
                        </div>

                        <p className="text-text-secondary text-sm">{barber.email}</p>
                        {barber.phone && <p className="text-text-secondary text-xs">{barber.phone}</p>}

                        <div className="flex items-center gap-1 mt-1 text-xs font-bold text-primary">
                          <Star size={12} className="fill-primary" />
                          <span>{averageRating}</span>
                          <span className="text-text-secondary font-normal ml-1">({reviews.length} avaliações)</span>
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex flex-col sm:items-end gap-2">
                      {/* Switcher: Atende na Agenda & SDR */}
                      <BarberActiveToggle
                        barberId={barber.id}
                        unitId={unitId!}
                        initialActive={item.is_active}
                        isOwner={isOwner}
                      />

                      <div className="flex items-center gap-2 mt-1">
                        {contract?.employment_type === 'CLT' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                            <Briefcase size={10} /> CLT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-success/20 text-success border-success/30 flex items-center gap-1">
                            <Percent size={10} /> Comissão {contract?.service_commission_rate ? `${Number(contract.service_commission_rate)}%` : ""}
                          </span>
                        )}

                        <Link 
                          href={`/dashboard/equipe/${barber.id}`} 
                          className="px-3 py-1 bg-secondary/50 hover:bg-primary/20 text-text-primary hover:text-primary rounded-lg text-xs font-bold transition-colors"
                        >
                          Gerenciar / Editar
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Formulário Novo Membro */}
        <div>
          <AddBarberForm
            isQuotaFull={isQuotaFull}
            activeCount={totalBarbers}
            maxBarbers={maxBarbers}
          />
        </div>

      </div>
    </div>
  );
}
