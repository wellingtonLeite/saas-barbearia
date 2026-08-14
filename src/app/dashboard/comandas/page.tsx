import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Plus, Search, Receipt, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getUserTenant } from "@/lib/tenant";

async function createNewComandaAction() {
  "use server";
  const { createComanda } = await import("@/app/actions/comanda");
  const { redirect } = await import("next/navigation");
  const comandaId = await createComanda();
  redirect(`/dashboard/comandas/${comandaId}`);
}

export default async function ComandasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getUserTenant(session.user.id);
  if (!tenant) {
    return <div className="p-8">Barbearia não encontrada.</div>;
  }

  // Busca comandas abertas
  const comandas = await db.comanda.findMany({
    where: {
      tenantId: tenant.id,
      status: 'OPEN'
    },
    include: {
      client: true,
      barber: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            <Receipt className="text-primary" /> Comandas / PDV
          </h1>
          <p className="text-text-secondary mt-2">
            Gerencie o consumo dos clientes na barbearia.
          </p>
        </div>
        
        <form action={createNewComandaAction}>
          <button type="submit" className="bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Plus size={20} /> Nova Comanda
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comandas.length === 0 ? (
          <div className="col-span-full bg-surface border border-secondary rounded-2xl p-8 text-center text-text-secondary">
            Nenhuma comanda aberta no momento.
          </div>
        ) : (
          comandas.map(comanda => (
            <Link key={comanda.id} href={`/dashboard/comandas/${comanda.id}`} className="bg-surface border border-secondary hover:border-primary/50 transition-colors rounded-2xl p-6 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text-primary text-lg">
                    {comanda.client?.name || "Cliente Avulso"}
                  </h3>
                  {comanda.barber && (
                    <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                      Atendido por {comanda.barber.name}
                    </p>
                  )}
                  <p className="text-sm text-text-secondary mt-1">
                    {comanda.items.length} iten(s)
                  </p>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  Aberta
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-secondary/50 flex items-center justify-between">
                <span className="font-display font-bold text-2xl text-text-primary">
                  R$ {Number(comanda.total_amount).toFixed(2)}
                </span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">
                  <ChevronRight />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
