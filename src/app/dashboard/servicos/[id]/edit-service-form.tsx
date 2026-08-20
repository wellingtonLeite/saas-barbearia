"use client";

import { useState } from "react";
import { updateService } from "@/app/actions/service";
import { Scissors, Camera, Sparkles, Check, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { SERVICE_PRESETS } from "@/lib/catalog-presets";

interface EditServiceFormProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    image_url: string | null;
    categoryId: string | null;
  };
  categories: { id: string; name: string }[];
}

export function EditServiceForm({ service, categories }: EditServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [price, setPrice] = useState(service.price.toString());
  const [duration, setDuration] = useState(service.duration_minutes.toString());
  const [categoryId, setCategoryId] = useState(service.categoryId || "");
  const [imageUrl, setImageUrl] = useState(service.image_url || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("price", price);
    formData.set("duration", duration);
    formData.set("categoryId", categoryId);
    formData.set("image_url", imageUrl);

    try {
      const res = await updateService(service.id, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        router.push("/dashboard/servicos");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar serviço.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-2xl p-8 shadow-sm space-y-6">
      
      {/* SELETOR VISUAL DE FOTO / PRESETS */}
      <div className="p-5 bg-background/60 border border-secondary rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <Camera size={16} className="text-primary" /> Foto do Serviço / Corte
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-text-secondary hover:text-danger font-medium"
            >
              Remover foto
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-2xl border-2 border-primary/50 overflow-hidden bg-surface flex items-center justify-center shrink-0 shadow-md">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={() => setImageUrl("")}
              />
            ) : (
              <Scissors size={28} className="text-primary/60" />
            )}
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <p className="text-xs font-medium text-text-secondary">URL da Foto em Alta Resolução (Unsplash, CDN, etc.):</p>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-background border border-secondary rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Galeria de Fotos Rápidas */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2 font-medium">
            <Sparkles size={14} className="text-primary" /> Galeria de Fotos em Alta Definição (clique para escolher):
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SERVICE_PRESETS.map((preset) => {
              const isSelected = imageUrl === preset.image_url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setImageUrl(preset.image_url)}
                  title={preset.name}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all group ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/40 scale-95"
                      : "border-secondary/60 hover:border-primary/60"
                  }`}
                >
                  <img
                    src={preset.image_url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <div className="bg-primary text-black rounded-full p-0.5 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Serviço</label>
          <input 
            type="text" 
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descrição / Detalhes</label>
          <textarea
            name="description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Corte estilizado, lavagem inclusa e finalização com pomada."
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
          <select 
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Sem Categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Preço (R$)</label>
            <input 
              type="number" 
              step="0.01"
              name="price"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Duração (min)</label>
            <input 
              type="number" 
              name="duration"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-secondary">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
