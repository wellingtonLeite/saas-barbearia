import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUserTenant } from "@/lib/tenant";
import { EditServiceForm } from "./edit-service-form";

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servicos" className="w-10 h-10 bg-surface border border-secondary rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
            Editar Serviço / Corte
          </h1>
          <p className="text-sm text-text-secondary">Atualize o nome, foto de apresentação, categoria, preço e duração.</p>
        </div>
      </div>

      <EditServiceForm
        service={{
          id: service.id,
          name: service.name,
          description: service.description,
          price: Number(service.price),
          duration_minutes: service.duration_minutes,
          image_url: service.image_url,
          categoryId: service.categoryId
        }}
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
