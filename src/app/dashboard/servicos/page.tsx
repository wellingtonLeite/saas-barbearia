import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Scissors, Clock, Plus, Trash2 } from "lucide-react";
import { createService, deleteService } from "@/app/actions/service";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Serviços</h1>
          <p className="text-text-secondary mt-2">Gerencie os cortes e serviços oferecidos pela sua barbearia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Serviços */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-secondary rounded-xl overflow-hidden">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Scissors className="text-primary" /> Catálogo Ativo
              </h2>
            </div>
            <div className="divide-y divide-secondary">
              {services.length === 0 && (
                 <div className="p-8 text-center text-text-secondary">Nenhum serviço cadastrado ainda.</div>
              )}
              {services.map(service => (
                <div key={service.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{service.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <p className="text-xl font-display font-bold text-primary">{formatCurrency(service.price)}</p>
                    <form action={async () => {
                      "use server";
                      await deleteService(service.id);
                    }}>
                      <button className="text-text-secondary hover:text-danger p-2 rounded transition-colors" title="Deletar serviço">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulário Novo Serviço */}
        <div>
          <div className="bg-surface border border-secondary rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-primary" /> Novo Serviço
            </h2>
            
            <form action={createService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Corte Degradê"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
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
                Cadastrar
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
