import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Scissors, Clock, Plus, Trash2, Folder, Pencil, Image as ImageIcon } from "lucide-react";
import { deleteService, createCategory, deleteCategory } from "@/app/actions/service";
import { auth } from "@/auth";
import { getUserTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddServiceForm } from "./add-service-form";

async function onCreateCategory(formData: FormData) {
  "use server";
  await createCategory(formData);
}

async function onDeleteCategory(id: string) {
  "use server";
  await deleteCategory(id);
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
          <h1 className="text-3xl font-display font-bold text-text-primary">Serviços, Cortes & Catálogo</h1>
          <p className="text-text-secondary mt-1">Gerencie os cortes e serviços com fotos em alta definição e organize por categorias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Serviços */}
        <div className="lg:col-span-2 space-y-6">
          {categories.length === 0 && uncategorizedServices.length === 0 && (
             <div className="bg-surface border border-secondary rounded-2xl p-12 text-center text-text-secondary space-y-3">
               <Scissors size={36} className="mx-auto text-primary opacity-60" />
               <p className="text-lg font-bold text-text-primary">Nenhum corte ou serviço cadastrado ainda.</p>
               <p className="text-sm">Use o formulário ao lado para cadastrar seu primeiro serviço utilizando os presets visuais com 1 clique!</p>
             </div>
          )}

          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
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
                  <div key={service.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Foto do Serviço */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-secondary shrink-0 flex items-center justify-center shadow-sm">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <Scissors size={20} className="text-primary/70" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-text-primary text-base">{service.name}</h3>
                        {service.description && (
                          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                          <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <p className="font-display font-bold text-primary text-lg">{formatCurrency(Number(service.price))}</p>
                      
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/servicos/${service.id}`} className="text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface transition-colors" title="Editar Serviço">
                          <Pencil size={16} />
                        </Link>

                        <form action={onDeleteService.bind(null, service.id)}>
                          <button className="text-text-secondary hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-colors" title="Excluir Serviço">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {uncategorizedServices.length > 0 && (
            <div className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-secondary flex justify-between items-center bg-background/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-text-secondary">
                  Sem Categoria
                </h2>
              </div>
              <div className="divide-y divide-secondary">
                {uncategorizedServices.map(service => (
                  <div key={service.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Foto do Serviço */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-secondary shrink-0 flex items-center justify-center shadow-sm">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <Scissors size={20} className="text-primary/70" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-text-primary text-base">{service.name}</h3>
                        {service.description && (
                          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                          <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <p className="font-display font-bold text-primary text-lg">{formatCurrency(Number(service.price))}</p>
                      
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/servicos/${service.id}`} className="text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface transition-colors" title="Editar Serviço">
                          <Pencil size={16} />
                        </Link>

                        <form action={onDeleteService.bind(null, service.id)}>
                          <button className="text-text-secondary hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-colors" title="Excluir Serviço">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulários na lateral */}
        <div className="space-y-6">
          
          {/* Novo Serviço com Presets */}
          <AddServiceForm 
            categories={categories.map(c => ({ id: c.id, name: c.name }))} 
          />

          {/* Nova Categoria */}
          <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
              <Plus className="text-primary" /> Nova Categoria
            </h2>
            <form action={onCreateCategory} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Cabelo, Barba, Combos..."
                  className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-surface-hover border border-secondary hover:bg-secondary text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                Criar Categoria
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
