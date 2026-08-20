import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WhatsappForm } from "./whatsapp-form";
import { WhatsappConnection } from "./whatsapp-connection";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "WhatsApp & Automação | 88Barber",
};

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
              tenant: {
                include: {
                  subscription: {
                    include: {
                      plan: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const unit = userWithTenant?.units[0]?.unit;
  const tenant = unit?.tenant;

  if (!tenant) {
    return (
      <div className="p-8 text-center bg-surface border border-secondary rounded-2xl max-w-md mx-auto mt-20">
        <h2 className="text-xl font-bold text-text-primary mb-2">Barbearia não encontrada</h2>
        <p className="text-text-secondary text-sm">Não foi possível carregar os dados da barbearia.</p>
      </div>
    );
  }

  const subscription = tenant.subscription;
  const plan = subscription?.plan;
  const hasWhatsappSdr = Boolean(plan?.has_whatsapp_sdr);
  const planName = plan?.name || "Plano Gratuito";
  const templates = (tenant.whatsapp_templates as any) || {};

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header com Design Limpo */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/config" 
          className="p-2 bg-surface border border-secondary rounded-xl text-text-secondary hover:text-primary hover:border-primary/50 transition-colors"
          title="Voltar para Configurações"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              WhatsApp {hasWhatsappSdr ? "& Agente SDR" : ""}
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
              hasWhatsappSdr 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-secondary text-text-secondary border-secondary"
            }`}>
              {planName}
            </span>
          </div>
          <p className="text-text-secondary text-sm mt-0.5">
            {hasWhatsappSdr 
              ? "Gerencie a conexão do seu WhatsApp e o atendimento automático com Inteligência Artificial."
              : "Configuração de mensagens e links de contato manual com clientes."}
          </p>
        </div>
      </div>

      {/* Componente de Conexão e Upgrade */}
      <WhatsappConnection 
        tenantId={tenant.id} 
        slug={tenant.slug} 
        phone={unit?.phone || undefined} 
        hasWhatsappSdr={hasWhatsappSdr}
        planName={planName}
      />

      {/* Templates de Mensagem */}
      <WhatsappForm 
        tenantId={tenant.id} 
        defaultValues={templates} 
        hasWhatsappSdr={hasWhatsappSdr} 
      />
    </div>
  );
}
