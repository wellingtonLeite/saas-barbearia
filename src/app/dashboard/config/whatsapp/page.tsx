import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WhatsappForm } from "./whatsapp-form";
import { WhatsappConnection } from "./whatsapp-connection";
import Link from "next/link";
import { ChevronLeft, MessageSquare, Bot } from "lucide-react";

export const metadata = {
  title: "Conectar WhatsApp & IA SDR | 88Barber",
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
  const hasWhatsappSdr = plan?.has_whatsapp_sdr ?? false;
  const planName = plan?.name || "Plano Gratuito";
  const templates = (tenant.whatsapp_templates as any) || {};

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config" 
          className="p-2.5 bg-surface border border-secondary rounded-xl text-text-secondary hover:text-primary hover:border-primary/50 transition-colors"
          title="Voltar para Configurações"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Bot size={28} />
              </span>
              Conectar WhatsApp & IA SDR
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              IA SDR Integrado
            </span>
          </div>
          <p className="text-text-secondary mt-1 text-sm">
            Conecte o número de WhatsApp da sua barbearia para ativar o atendimento 24/7 e personalizar mensagens automáticas.
          </p>
        </div>
      </div>

      {/* Conexão e Apresentação do SDR */}
      <WhatsappConnection 
        tenantId={tenant.id} 
        slug={tenant.slug} 
        phone={unit?.phone || undefined} 
        hasWhatsappSdr={hasWhatsappSdr}
        planName={planName}
      />

      {/* Seção de Personalização de Templates de Mensagens */}
      <div className="bg-surface border border-secondary rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="border-b border-secondary/50 pb-4">
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
            <MessageSquare className="text-primary" size={22} /> Templates de Mensagens Automáticas
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Personalize os textos dos lembretes, solicitações de avaliação e avisos de cancelamento enviados aos clientes.
          </p>
        </div>

        <WhatsappForm tenantId={tenant.id} defaultValues={templates} />
      </div>
    </div>
  );
}
