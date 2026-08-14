import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Gift, Crown, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { saveLoyaltyProgram } from "@/app/actions/loyalty";
import { createClientPlan, deleteClientPlan } from "@/app/actions/vip";
import { getUserTenant } from "@/lib/tenant";

export const metadata = {
  title: "Fidelidade e VIP | SaaS Barbearia",
};

export default async function FidelidadePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await getUserTenant(session.user.id);
  
  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Barbearia não encontrada.</h2>
      </div>
    );
  }

  const { tab = "vip" } = await searchParams;

  const tenantData = await db.tenant.findUnique({
    where: { id: tenant.id },
    include: {
      loyaltyPrograms: true,
      clientPlans: true
    }
  });

  const loyaltyProgram = tenantData?.loyaltyPrograms?.[0] || null;
  const clientPlans = tenantData?.clientPlans || [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in p-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
          <Gift className="text-primary" /> Fidelização de Clientes
        </h1>
        <p className="text-text-secondary mt-2">
          Configure seu Clube VIP e Programa de Fidelidade para os seus clientes.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-secondary mb-8 pb-0">
        <Link 
          href="?tab=vip" 
          className={`flex items-center gap-2 px-6 py-3 font-bold transition-colors border-b-2 ${tab === 'vip' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          <Crown size={18} /> Clube VIP
        </Link>
        <Link 
          href="?tab=fidelidade" 
          className={`flex items-center gap-2 px-6 py-3 font-bold transition-colors border-b-2 ${tab === 'fidelidade' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          <Gift size={18} /> Prog. Fidelidade
        </Link>
      </div>

      {tab === "vip" && (
        <div className="animate-fade-in space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Planos VIP (Para Seus Clientes)</h2>
              <p className="text-text-secondary text-sm">Crie assinaturas mensais ou anuais que seus clientes podem comprar (ex: Cabelo e Barba Ilimitado).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <form action={async (formData) => { await createClientPlan(formData); }} className="bg-surface border border-secondary p-6 rounded-2xl shadow-xl sticky top-6">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-primary" /> Criar Novo Plano
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Nome do Plano</label>
                    <input type="text" name="name" required className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary" placeholder="Ex: Premium Ilimitado" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" name="price" required className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary" placeholder="90.00" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Descrição / Benefícios</label>
                    <textarea name="description" rows={3} className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary" placeholder="Cortes ilimitados no mês..." />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Cobrança</label>
                    <select name="interval" className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary">
                      <option value="MONTHLY">Mensal</option>
                      <option value="YEARLY">Anual</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" name="is_active" value="true" defaultChecked className="w-5 h-5 rounded border-secondary bg-background text-primary" />
                    <span className="text-text-primary font-medium text-sm">Disponível para venda</span>
                  </div>
                </div>
                <button type="submit" className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors">
                  Salvar Plano VIP
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {clientPlans.length === 0 ? (
                <div className="bg-surface border border-secondary p-8 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center">
                  <Crown size={48} className="text-secondary mb-4" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">Nenhum plano criado</h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    Você ainda não tem nenhum plano VIP configurado. Crie um plano para fidelizar seus clientes com receitas recorrentes.
                  </p>
                </div>
              ) : (
                clientPlans.map((cp) => (
                  <div key={cp.id} className="bg-surface border border-secondary p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-text-primary">{cp.name}</h4>
                        {!cp.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-text-secondary text-xs font-bold uppercase">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2 max-w-xl">{cp.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-display font-bold text-primary text-lg">R$ {Number(cp.price).toFixed(2)} <span className="text-text-secondary text-sm font-sans font-normal">/{cp.interval === 'MONTHLY' ? 'mês' : 'ano'}</span></span>
                      </div>
                    </div>
                    
                    <form action={async () => { await deleteClientPlan(cp.id); }}>
                      <button type="submit" className="text-text-secondary hover:text-danger hover:bg-danger/10 p-3 rounded-xl transition-colors flex items-center justify-center">
                        <Trash2 size={20} />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "fidelidade" && (
        <div className="animate-fade-in max-w-2xl">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Programa de Fidelidade</h2>
          <p className="text-text-secondary text-sm mb-8">Recompense seus clientes que retornam sempre à barbearia.</p>

          <form action={async (formData) => { await saveLoyaltyProgram(formData); }} className="bg-surface border border-secondary p-8 rounded-2xl shadow-xl">
            <div className="space-y-6">
              <div className="p-4 bg-background/50 border border-secondary rounded-xl flex items-center gap-4">
                <Gift className="text-primary w-10 h-10" />
                <div>
                  <h4 className="font-bold text-text-primary">Ativar Fidelidade</h4>
                  <p className="text-sm text-text-secondary">Permita que seus clientes acumulem pontos ao pagar por serviços.</p>
                </div>
                <div className="ml-auto">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_active" value="true" defaultChecked={loyaltyProgram?.is_active ?? true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Pontos ganhos por cada R$ 1,00 gasto</label>
                <div className="flex items-center gap-3">
                  <input type="number" step="0.01" name="points_per_brl" required defaultValue={Number(loyaltyProgram?.points_per_brl || 1)} className="flex-1 bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary font-bold text-lg" />
                  <span className="text-text-secondary">pontos</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">Exemplo: Se colocar 1, um serviço de R$ 50 vai gerar 50 pontos.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-secondary">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Pontos para Resgate</label>
                  <input type="number" name="reward_points" required defaultValue={loyaltyProgram?.reward_points || 100} className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary font-bold" />
                  <p className="text-xs text-text-secondary mt-1">Quantos pontos o cliente precisa juntar.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Desconto Ganho (R$)</label>
                  <input type="number" step="0.01" name="reward_value" required defaultValue={Number(loyaltyProgram?.reward_value || 10)} className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary font-bold" />
                  <p className="text-xs text-text-secondary mt-1">Qual o valor abatido na próxima compra.</p>
                </div>
              </div>
            </div>
            
            <button type="submit" className="mt-8 w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Salvar Regras do Programa
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
