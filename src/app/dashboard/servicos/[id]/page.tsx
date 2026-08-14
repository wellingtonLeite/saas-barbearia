import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Scissors } from "lucide-react";
import Link from "next/link";
import { getUserTenant } from "@/lib/tenant";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getUserTenant(session.user.id);
  if (!tenant) return <div className="p-8">Barbearia não encontrada.</div>;

  const service = await db.service.findUnique({
    where: {
      id: resolvedParams.id,
      tenantId: tenant.id
    }
  });

  if (!service) notFound();

  const categories = await db.serviceCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' }
  });

  async function updateService(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration = parseInt(formData.get("duration") as string);
    const categoryId = formData.get("categoryId") as string;

    const { db } = await import("@/lib/db");
    
    await db.service.update({
      where: { id: service!.id },
      data: {
        name,
        price,
        duration_minutes: duration,
        categoryId: categoryId || null
      }
    });

    const { revalidatePath } = await import("next/cache");
    const { redirect } = await import("next/navigation");
    revalidatePath("/dashboard/servicos");
    redirect("/dashboard/servicos");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servicos" className="w-10 h-10 bg-surface border border-secondary rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            Editar Serviço
          </h1>
        </div>
      </div>

      <div className="bg-surface border border-secondary rounded-2xl p-8 shadow-sm">
        <form action={updateService} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nome</label>
            <input 
              type="text" 
              name="name"
              required
              defaultValue={service.name}
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
            <select 
              name="categoryId"
              defaultValue={service.categoryId || ""}
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
                defaultValue={Number(service.price)}
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Duração (min)</label>
              <input 
                type="number" 
                name="duration"
                required
                defaultValue={service.duration_minutes}
                className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-secondary">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Scissors size={20} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
