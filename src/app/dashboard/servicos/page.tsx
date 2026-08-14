import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Scissors, Clock, Plus, Trash2, Folder, Pencil } from "lucide-react";
import { createService, deleteService, createCategory, deleteCategory } from "@/app/actions/service";
import { auth } from "@/auth";
import { getUserTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";

async function onCreateCategory(formData: FormData) {
  "use server";
  await createCategory(formData);
}

async function onDeleteCategory(id: string) {
  "use server";
  await deleteCategory(id);
}

async function onCreateService(formData: FormData) {
  "use server";
  await createService(formData);
}

async function onDeleteService(id: string) {
  "use server";
  await deleteService(id);
}

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return <div className="p-8">Barbearia não encontrada.</div>;

  const categories = await db.serviceCategory.findMany({
    where: { tenantId: tenant.id },
    include: { services: true },
    orderBy: { order: 'asc' }
  });

  const uncategorizedServices = await db.service.findMany({
    where: { tenantId: tenant.id, categoryId: null },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Serviços e Categorias</h1>
          <p className="text-text-secondary mt-2">Gerencie os cortes e serviços e agrupe-os por categorias (ex: Cabelo, Barba).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Serviços */}
        <div className="lg:col-span-2 space-y-6">
          {categories.length === 0 && uncategorizedServices.length === 0 && (
             <div className="bg-surface border border-secondary rounded-xl p-8 text-center text-text-secondary">
               Nenhum serviço ou categoria cadastrado ainda.
             </div>
          )}

          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-secondary rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-secondary flex justify-between items-center bg-background/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Folder className="text-primary" size={20} /> {cat.name}
                </h2>
                <form action={onDeleteCategory.bind(null, cat.id)}>
                  <button className="text-text-secondary hover:text-danger p-1 rounded transition-colors" title="Deletar Categoria">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
              
              <div className="divide-y divide-secondary">
                {cat.services.length === 0 && (
                  <div className="p-4 text-center text-sm text-text-secondary">Nenhum serviço nesta categoria.</div>
                )}
                {cat.services.map(service => (
                  <div key={service.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
                    <div>
                      <h3 className="font-bold text-text-primary">{service.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="font-display font-bold text-primary">{formatCurrency(Number(service.price))}</p>
                      
                      <Link href={`/dashboard/servicos/${service.id}`} className="text-text-secondary hover:text-primary p-2 rounded transition-colors" title="Editar Serviço">
                        <Pencil size={16} />
                      </Link>

                      <form action={onDeleteService.bind(null, service.id)}>
                        <button className="text-text-secondary hover:text-danger p-2 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {uncategorizedServices.length > 0 && (
            <div className="bg-surface border border-secondary rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-secondary flex justify-between items-center bg-background/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-text-secondary">
                  Sem Categoria
                </h2>
              </div>
              <div className="divide-y divide-secondary">
                {uncategorizedServices.map(service => (
                  <div key={service.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
                    <div>
                      <h3 className="font-bold text-text-primary">{service.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="font-display font-bold text-primary">{formatCurrency(Number(service.price))}</p>
                      <Link href={`/dashboard/servicos/${service.id}`} className="text-text-secondary hover:text-primary p-2 rounded transition-colors" title="Editar Serviço">
                        <Pencil size={16} />
                      </Link>
                      <form action={onDeleteService.bind(null, service.id)}>
                        <button className="text-text-secondary hover:text-danger p-2 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulários na lateral */}
        <div className="space-y-6">
          
          {/* Nova Categoria */}
          <div className="bg-surface border border-secondary rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="text-primary" /> Nova Categoria
            </h2>
            <form action={onCreateCategory} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Combos Promocionais"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-surface-hover border border-secondary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Criar Categoria
              </button>
            </form>
          </div>

          {/* Novo Serviço */}
          <div className="bg-surface border border-secondary rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Scissors className="text-primary" /> Novo Serviço
            </h2>
            <form action={onCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Corte Degradê"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
                <select 
                  name="categoryId"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Sem Categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price"
                    required
                    placeholder="45.00"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Duração (min)</label>
                  <input 
                    type="number" 
                    name="duration"
                    required
                    defaultValue="30"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 px-4 rounded-lg transition-colors mt-2"
              >
                Cadastrar Serviço
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
