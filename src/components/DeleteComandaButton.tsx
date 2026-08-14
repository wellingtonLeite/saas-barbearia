"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteComandaButton({ id, deleteAction }: { id: string, deleteAction: (id: string) => Promise<any> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={() => {
        if(confirm("Tem certeza que deseja deletar esta comanda?")) {
          startTransition(async () => {
            await deleteAction(id);
          });
        }
      }}
      disabled={isPending}
      className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50" 
      title="Deletar Comanda"
    >
      <Trash2 size={20} />
    </button>
  );
}
