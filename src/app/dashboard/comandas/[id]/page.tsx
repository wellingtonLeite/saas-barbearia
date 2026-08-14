import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Receipt, Plus, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getUserTenant } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { DeleteComandaButton } from "@/components/DeleteComandaButton";
import { AddComandaItemForm } from "@/components/AddComandaItemForm";
import { addComandaItem, closeComanda, deleteComanda } from "@/app/actions/comanda";

export default async function ComandaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return <div className="p-8">Barbearia não encontrada.</div>;

  const comanda = await db.comanda.findUnique({
    where: {
      id: resolvedParams.id,
      tenantId: tenant.id
    },
    include: {
      client: true,
      barber: true,
      items: true
    }
  });

  if (!comanda) notFound();

  // Buscar serviços para adicionar à comanda
  const servicesData = await db.service.findMany({
    where: { tenantId: tenant.id }
  });
  const services = servicesData.map(s => ({...s, price: Number(s.price)}));

  // Buscar produtos para adicionar à comanda
  const productsData = await db.product.findMany({
    where: { tenantId: tenant.id }
  });
  const products = productsData.map(p => ({...p, price: Number(p.price)}));

  // Funções inline removidas para usar as actions centralizadas

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/comandas" className="w-10 h-10 bg-surface border border-secondary rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
            Comanda #{comanda.id.split("-")[0].toUpperCase()}
          </h1>
          <p className="text-text-secondary">
            <span className="font-bold text-text-primary">{comanda.client?.name || "Cliente Avulso"}</span>
            {comanda.barber && ` • Atendido por ${comanda.barber.name}`}
          </p>
        </div>
        
        {/* Deletar Comanda */}
        <DeleteComandaButton id={comanda.id} deleteAction={deleteComanda} />
      </div>

      <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Receipt /> Itens Consumidos
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            comanda.status === 'OPEN' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'
          }`}>
            {comanda.status === 'OPEN' ? 'Aberta' : 'Fechada'}
          </span>
        </div>

        <div className="divide-y divide-secondary/50 mb-6">
          {comanda.items.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">Nenhum item adicionado ainda.</div>
          ) : (
            comanda.items.map(item => (
              <div key={item.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-text-primary">
                    {item.name} 
                    {item.productId && <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Produto</span>}
                    {item.serviceId && <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Serviço</span>}
                  </p>
                  <p className="text-sm text-text-secondary">{item.quantity}x R$ {Number(item.price).toFixed(2)}</p>
                </div>
                <div className="font-bold text-lg">
                  R$ {(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-secondary">
          <span className="text-lg font-bold text-text-secondary">Total a Pagar</span>
          <span className="text-3xl font-display font-black text-primary">
            R$ {Number(comanda.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      {comanda.status === 'OPEN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-6">
            {/* Adicionar Serviço */}
            <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-text-primary mb-4">Adicionar Serviço</h3>
              <AddComandaItemForm 
                comandaId={comanda.id} 
                items={services} 
                type="service" 
                addAction={addComandaItem} 
              />
            </div>

            {/* Adicionar Produto */}
            <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-text-primary mb-4">Adicionar Produto</h3>
              <AddComandaItemForm 
                comandaId={comanda.id} 
                items={products} 
                type="product" 
                addAction={addComandaItem} 
              />
            </div>
          </div>

          {/* Fechar Comanda */}
          <div className="bg-surface border border-secondary rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="font-bold text-text-primary mb-2">Finalizar Atendimento</h3>
            <p className="text-sm text-text-secondary mb-4">Confirmar pagamento e fechar comanda.</p>
            <form action={closeComanda.bind(null, comanda.id)} className="w-full">
              <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Receber e Fechar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
