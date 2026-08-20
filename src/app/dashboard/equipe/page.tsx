import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Users, UserPlus, Briefcase, Percent, Star, Crown, Shield } from "lucide-react";
import { addTeamMember } from "@/app/actions/team";
import { auth } from "@/auth";
import Link from "next/link";
import { BarberActiveToggle } from "./barber-active-toggle";

async function onAddTeamMember(formData: FormData) {
  "use server";
  await addTeamMember(formData);
}

export default async function TeamPage() {
  const session = await auth();
  
  // Buscar a unidade atual do usuário logado
  const userUnit = await db.barberUnit.findFirst({
    where: { barberId: session?.user?.id }
  });

  const unitId = userUnit?.unitId;

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Gestão de Equipe</h1>
          <p className="text-text-secondary mt-2">Gerencie seus barbeiros, proprietários e regras de atendimento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Equipe */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-secondary rounded-xl overflow-hidden">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-primary" /> Membros da Barbearia
              </h2>
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
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-text-primary border border-secondary/80">
                          {barber.name.charAt(0).toUpperCase()}
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
          <div className="bg-surface border border-secondary rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="text-primary" /> Adicionar Barbeiro
            </h2>

            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-6 text-sm text-text-secondary">
              <p><strong>Acesso do Funcionário:</strong></p>
              <p className="mt-1">
                Após cadastrar, passe o E-mail e a Senha Provisória para o barbeiro. Ele utilizará a <strong>mesma tela de login do sistema</strong> (<span className="text-primary font-medium">/login</span>) para acessar sua própria agenda restrita.
              </p>
            </div>
            
            <form action={onAddTeamMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">E-mail (Login)</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="carlos@barbearia.com"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="(11) 99999-9999"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Senha de Acesso</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Tipo Contrato</label>
                  <select 
                    name="employment_type"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="COMMISSION_ONLY">Comissão</option>
                    <option value="CLT">CLT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Comissão Serviços (%)</label>
                  <input 
                    type="number" 
                    name="service_commission_rate"
                    defaultValue="50"
                    min="0"
                    max="100"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-2"
              >
                Cadastrar Barbeiro
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
