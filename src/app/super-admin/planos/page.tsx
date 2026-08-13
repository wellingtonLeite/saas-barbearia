import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Settings, Plus, Check, Save } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function PlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { base_price: 'asc' }
  });

  async function createOrUpdatePlan(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') return;

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const base_price = Number(formData.get("base_price"));
    const max_units = Number(formData.get("max_units"));
    const max_barbers = Number(formData.get("max_barbers"));
    const has_whatsapp = formData.get("has_whatsapp") === "on";
    const has_financial_module = formData.get("has_financial_module") === "on";

    const { db } = await import("@/lib/db");

    if (id) {
      await db.plan.update({
        where: { id },
        data: { name, base_price, max_units, max_barbers, has_whatsapp, has_financial_module }
      });
    } else {
      await db.plan.create({
        data: { name, base_price, max_units, max_barbers, has_whatsapp, has_financial_module }
      });
    }

    revalidatePath("/super-admin/planos");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <Settings className="text-primary" /> Gestão de Planos
          </h1>
          <p className="text-text-secondary mt-2">
            Configure as limitações e preços dos pacotes do seu SaaS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário Criar/Editar */}
        <div className="bg-surface border border-secondary p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold text-text-primary mb-6">Criar Novo Plano</h2>
          
          <form action={createOrUpdatePlan} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1">Nome do Plano</label>
              <input required type="text" name="name" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" placeholder="Ex: Plano Pro" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Preço Base (R$)</label>
                <input required type="number" step="0.01" name="base_price" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" placeholder="99.90" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Limite Unidades</label>
                <input required type="number" name="max_units" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" placeholder="1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1">Limite de Barbeiros</label>
              <input required type="number" name="max_barbers" className="w-full bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" placeholder="999 (para Ilimitado)" defaultValue={999} />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-secondary cursor-pointer hover:border-primary/50 transition-colors group">
                <input type="checkbox" name="has_whatsapp" className="peer sr-only" />
                <div className="w-5 h-5 rounded border border-secondary flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-colors">
                  <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Mensagens via WhatsApp</span>
                  <span className="text-xs text-text-secondary mt-1">Habilita botões para envio de mensagens direto pelo WhatsApp Web</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-secondary cursor-pointer hover:border-primary/50 transition-colors group">
                <input type="checkbox" name="has_financial_module" className="peer sr-only" />
                <div className="w-5 h-5 rounded border border-secondary flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-colors">
                  <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Acesso ao Módulo Financeiro</span>
                  <span className="text-xs text-text-secondary mt-1">Habilita as funcionalidades do menu Financeiro</span>
                </div>
              </label>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-primary-hover transition-all">
              <Save size={18} /> Salvar Plano
            </button>
          </form>
        </div>

        {/* Lista de Planos */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-surface border border-secondary p-6 rounded-2xl flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-2">
                  {Number(plan.base_price) === 0 ? (
                    <span className="text-3xl font-display font-bold text-primary">Sob Consulta</span>
                  ) : (
                    <>
                      <span className="text-3xl font-display font-bold text-primary">R$ {Number(plan.base_price).toFixed(2)}</span>
                      <span className="text-text-secondary text-sm mb-1">/mês</span>
                    </>
                  )}
                </div>
                
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-success" />
                    <strong>{plan.max_units}</strong> {plan.max_units === 1 ? 'Unidade' : 'Unidades'} liberada(s)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-success" />
                    <strong>{plan.max_barbers >= 999 ? 'Ilimitados' : plan.max_barbers}</strong> Barbeiros na equipe
                  </li>
                  
                  <li className={`flex items-center gap-2 text-sm ${plan.has_whatsapp ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                    <Check size={16} className={plan.has_whatsapp ? "text-success" : "text-secondary"} />
                    Mensagens via WhatsApp
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${plan.has_financial_module ? 'text-text-secondary' : 'text-text-secondary/50 line-through'}`}>
                    <Check size={16} className={plan.has_financial_module ? "text-success" : "text-secondary"} />
                    {plan.name === 'Plano Navalha' ? 'Módulo Financeiro (Básico)' : 'Módulo Financeiro (Completo)'}
                  </li>
                </ul>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full bg-background border border-secondary rounded-2xl p-12 text-center">
              <p className="text-text-secondary">Nenhum plano cadastrado ainda.</p>
              <p className="text-sm mt-1 text-text-secondary/70">Use o formulário ao lado para criar o seu primeiro plano.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
