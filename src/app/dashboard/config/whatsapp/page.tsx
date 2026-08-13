import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WhatsappForm } from "./whatsapp-form";
import Link from "next/link";
import { ChevronLeft, MessageCircle } from "lucide-react";

export default async function WhatsappConfigPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const userWithTenant = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      units: {
        include: {
          unit: {
            include: {
              tenant: true
            }
          }
        }
      }
    }
  });

  const tenant = userWithTenant?.units[0]?.unit?.tenant;

  if (!tenant) {
    return <div>Barbearia não encontrada.</div>;
  }

  const templates = (tenant.whatsapp_templates as any) || {};

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/config" className="p-2 bg-surface border border-secondary rounded-lg text-text-secondary hover:text-primary transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-2">
            <MessageCircle className="text-success" /> Configurações de WhatsApp
          </h1>
          <p className="text-text-secondary mt-1">
            Personalize as mensagens enviadas para seus clientes.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-secondary rounded-xl p-6">
        <WhatsappForm tenantId={tenant.id} defaultValues={templates} />
      </div>
    </div>
  );
}
