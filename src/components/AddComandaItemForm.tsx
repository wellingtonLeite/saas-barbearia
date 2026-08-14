"use client";

import { useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";

export function AddComandaItemForm({ 
  comandaId, 
  items, 
  type, 
  addAction 
}: { 
  comandaId: string, 
  items: any[], 
  type: "service" | "product", 
  addAction: (formData: FormData) => Promise<any> 
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      startTransition(async () => {
        try {
          const res = await addAction(formData);
          if (res && res.success === false) {
            alert("Erro: " + res.error);
          }
        } catch (error: any) {
          console.error("Failed to add item:", error);
          alert("Erro: " + (error.message || "Erro desconhecido"));
        }
      });
    }} className="flex gap-2">
      <input type="hidden" name="comandaId" value={comandaId} />
      <select 
        name={type === "service" ? "serviceId" : "productId"} 
        className="flex-1 bg-background border border-secondary rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none" 
        required
      >
        <option value="">{type === "service" ? "Selecione um serviço..." : "Selecione um produto..."}</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>{item.name} - R$ {Number(item.price).toFixed(2)}</option>
        ))}
      </select>
      <button 
        type="submit" 
        disabled={isPending} 
        className="bg-primary/20 text-primary hover:bg-primary hover:text-black font-bold p-2 px-4 rounded-xl transition-all disabled:opacity-50"
      >
        {isPending ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
      </button>
    </form>
  );
}
