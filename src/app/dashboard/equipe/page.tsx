import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Users, UserPlus, Briefcase, Percent, Star } from "lucide-react";
import { addTeamMember } from "@/app/actions/team";

async function onAddTeamMember(formData: FormData) {
  "use server";
  await addTeamMember(formData);
}

import { auth } from "@/auth";
import Link from "next/link";

export default async function TeamPage() {
  const session = await auth();
  
  // Buscar equipe da mesma unidade
  const userUnit = await db.barberUnit.findFirst({
    where: { barberId: session?.user?.id }
  });

  const team = userUnit ? await db.barberContract.findMany({
    where: { unitId: userUnit.unitId },
    include: { 
      barber: {
        include: {
          barber_reviews: true
        }
      } 
    }
  }) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Gestão de Equipe</h1>
          <p className="text-text-secondary mt-2">Gerencie seus barbeiros e regras de comissionamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Equipe */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-secondary rounded-xl overflow-hidden">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-primary" /> Barbeiros Ativos
              </h2>
            </div>
            <div className="divide-y divide-secondary">
              {team.length === 0 && (
                <div className="p-8 text-center text-text-secondary">Nenhum membro na equipe ainda.</div>
              )}
              {team.map(contract => {
                const reviews = contract.barber.barber_reviews;
                const averageRating = reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "Sem notas";

                return (
                  <div key={contract.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-text-primary">
                        {contract.barber.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">{contract.barber.name}</h3>
                        <p className="text-text-secondary text-sm">{contract.barber.email}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs font-bold text-primary">
                          <Star size={12} className="fill-primary" />
                          <span>{averageRating}</span>
                          <span className="text-text-secondary font-normal ml-1">({reviews.length} avaliações)</span>
                        </div>
                      </div>
                    </div>
                  
                  <div className="text-right flex items-center gap-4">
                    {contract.employment_type === 'CLT' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                        <Briefcase size={12} /> CLT
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-success/20 text-success border-success/30 flex items-center gap-1">
                        <Percent size={12} /> Comissão
                      </span>
                    )}
                    
                    <div className="text-sm text-right mt-2">
                      {contract.employment_type === 'CLT' && (
                        <p className="text-text-primary font-bold">{formatCurrency(Number(contract.fixed_salary))}</p>
                      )}
                      {Number(contract.service_commission_rate) > 0 && (
                        <p className="text-text-secondary">{Number(contract.service_commission_rate)}% Serviços</p>
                      )}
                      <Link href={`/dashboard/equipe/${contract.barber.id}`} className="inline-block mt-3 px-4 py-2 bg-secondary/50 hover:bg-primary/20 text-text-primary hover:text-primary rounded-lg text-xs font-bold transition-colors">
                        Gerenciar Agenda e Bloqueios
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
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">E-mail (Login)</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Senha Provisória</label>
                <input 
                  type="text" 
                  name="password"
                  required
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Regime de Contratação</label>
                <select 
                  name="employment_type" 
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="COMMISSION_ONLY">Apenas Comissão</option>
                  <option value="CLT">CLT (Salário Fixo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Salário Fixo</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="fixed_salary"
                    defaultValue="0"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Comissão (%)</label>
                  <input 
                    type="number" 
                    name="service_commission_rate"
                    defaultValue="50"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 px-4 rounded-lg transition-colors mt-4"
              >
                Cadastrar Membro
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
