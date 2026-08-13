import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Plus, Package, TrendingUp, TrendingDown } from "lucide-react";
import { createProduct, addStock, removeStock } from "@/app/actions/product";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Produtos e Estoque</h1>
          <p className="text-text-secondary mt-2">Gerencie o catálogo de produtos e as movimentações de estoque.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Produtos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-secondary rounded-xl overflow-hidden">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="text-primary" /> Estoque Atual
              </h2>
            </div>
            <div className="divide-y divide-secondary">
              {products.length === 0 && (
                <div className="p-8 text-center text-text-secondary">Nenhum produto cadastrado.</div>
              )}
              {products.map(product => (
                <div key={product.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{product.name}</h3>
                    <p className="text-text-secondary">{formatCurrency(product.price)}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-text-secondary mb-1">Em Estoque</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                        product.stock_quantity > 5 ? 'bg-success/20 text-success border-success/30' : 
                        product.stock_quantity > 0 ? 'bg-warning/20 text-warning border-warning/30' : 
                        'bg-danger/20 text-danger border-danger/30'
                      }`}>
                        {product.stock_quantity} un
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <form action={async () => {
                        "use server";
                        await addStock(product.id, 1);
                      }}>
                        <button className="p-2 bg-success/10 text-success hover:bg-success/20 rounded border border-success/20 transition-colors" title="Adicionar 1 unidade">
                          <TrendingUp size={16} />
                        </button>
                      </form>
                      
                      <form action={async () => {
                        "use server";
                        await removeStock(product.id, 1);
                      }}>
                        <button className="p-2 bg-danger/10 text-danger hover:bg-danger/20 rounded border border-danger/20 transition-colors" title="Remover 1 unidade">
                          <TrendingDown size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulário Novo Produto */}
        <div>
          <div className="bg-surface border border-secondary rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-primary" /> Novo Produto
            </h2>
            
            <form action={createProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Pomada Efeito Matte"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Preço de Venda (R$)</label>
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
                <label className="block text-sm font-medium text-text-secondary mb-1">Estoque Inicial (Unidades)</label>
                <input 
                  type="number" 
                  name="stock_quantity"
                  defaultValue="0"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2"
              >
                Cadastrar Produto
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
