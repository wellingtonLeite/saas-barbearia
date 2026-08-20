"use client";

import { useState, useRef } from "react";
import { createService } from "@/app/actions/service";
import { Scissors, Loader2, Sparkles, Check, Camera, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { SERVICE_PRESETS, ServicePreset } from "@/lib/catalog-presets";

interface AddServiceFormProps {
  categories: { id: string; name: string }[];
}

export function AddServiceForm({ categories }: AddServiceFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const applyPreset = (preset: ServicePreset) => {
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setDescription(preset.description);
    setPrice(preset.suggestedPrice.toString());
    setDuration(preset.duration_minutes.toString());
    setImageUrl(preset.image_url);

    // Tentar mapear categoria aproximada
    const matchedCategory = categories.find(c => 
      c.name.toLowerCase().includes(preset.suggestedCategory.toLowerCase()) ||
      preset.suggestedCategory.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCategory) {
      setCategoryId(matchedCategory.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("price", price);
    formData.set("duration", duration);
    formData.set("categoryId", categoryId);
    formData.set("image_url", imageUrl);

    try {
      const res = await createService(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setDuration("30");
        setImageUrl("");
        setSelectedPresetId(null);
        formRef.current?.reset();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar serviço.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
          <Scissors className="text-primary" /> Novo Serviço / Corte
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Selecione um preset pronto com foto em alta resolução ou digite os dados manualmente.
        </p>
      </div>

      {/* GALERIA DE PRESETS RÁPIDOS (1 CLIQUE) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" /> Presets Prontos de Cortes & Barbas
          </span>
          <span className="text-[11px] text-text-secondary">1 clique para preencher</span>
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
          {SERVICE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id || imageUrl === preset.image_url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 text-left group transition-all ${
                  isSelected 
                    ? "border-primary ring-2 ring-primary/40 shadow-md" 
                    : "border-secondary/70 hover:border-primary/60"
                }`}
                title={`${preset.name} (R$ ${preset.suggestedPrice.toFixed(2)})`}
              >
                <img
                  src={preset.image_url}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">
                    {preset.name}
                  </p>
                  <p className="text-[9px] text-primary font-semibold">
                    R$ {preset.suggestedPrice.toFixed(0)} • {preset.duration_minutes}m
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-primary text-black rounded-full p-0.5 shadow-sm">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-secondary">
        
        {/* SELETOR DE IMAGEM COM PREVIEW */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-text-secondary">Foto do Serviço / Corte</label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => { setImageUrl(""); setSelectedPresetId(null); }}
                className="text-[11px] text-text-secondary hover:text-danger"
              >
                Remover foto
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-secondary bg-background overflow-hidden flex items-center justify-center shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={() => setImageUrl("")}
                />
              ) : (
                <Camera size={22} className="text-text-secondary" />
              )}
            </div>
            <input
              type="url"
              name="image_url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cole a URL da foto ou selecione acima"
              className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Nome do Serviço</label>
          <input 
            type="text" 
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Corte Degradê Navalhado"
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Descrição / Detalhes (Opcional)</label>
          <textarea
            name="description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Acabamento perfeito nas laterais com navalha e lavagem inclusa."
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Categoria</label>
          <select 
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Sem Categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Preço (R$)</label>
            <input 
              type="number" 
              step="0.01"
              name="price"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="45.00"
              className="w-full bg-background border border-secondary rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Duração (min)</label>
            <input 
              type="number" 
              name="duration"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-background border border-secondary rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 px-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Cadastrar Serviço
        </button>
      </form>
    </div>
  );
}
