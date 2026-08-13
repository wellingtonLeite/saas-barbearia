import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Scissors } from "lucide-react";

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      units: true,
      services: true,
    }
  });

  if (!tenant) notFound();

  const primaryUnit = tenant.units[0]; // Simplificação para MVP: 1 unidade

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 bg-surface p-12 rounded-2xl border border-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-hover to-primary"></div>
        
        {tenant.logo_url && (
          <div className="flex justify-center mb-6">
            <img src={tenant.logo_url} alt={`Logo ${tenant.name}`} className="w-32 h-32 object-cover rounded-2xl border-4 border-primary/20 shadow-2xl" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary">
          Bem-vindo à <span className="text-primary">{tenant.name}</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Cortes impecáveis, ambiente exclusivo e o melhor atendimento da região.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href={`/${tenant.slug}/agendar`} 
            className="bg-primary hover:bg-primary-hover text-black font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Calendar size={24} /> Agendar Agora
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nossos Serviços */}
        <section className="bg-surface p-8 rounded-2xl border border-secondary">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
            <Scissors /> Nossos Serviços
          </h2>
          <div className="space-y-4">
            {tenant.services.length === 0 && (
              <p className="text-text-secondary">Serviços em atualização...</p>
            )}
            {tenant.services.map(service => (
              <div key={service.id} className="flex justify-between items-center border-b border-secondary/50 pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-bold text-text-primary">{service.name}</h3>
                  <p className="text-sm text-text-secondary">{service.duration_minutes} minutos</p>
                </div>
                <div className="font-bold text-lg text-primary">
                  R$ {Number(service.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Localização e Horários */}
        <section className="space-y-8">
          <div className="bg-surface p-8 rounded-2xl border border-secondary">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
              <MapPin /> Localização
            </h2>
            <p className="text-text-primary text-lg">
              {primaryUnit?.address || "Endereço não cadastrado"}
            </p>
            {primaryUnit?.phone && (
              <p className="mt-2 text-primary font-bold">
                WhatsApp: {primaryUnit.phone}
              </p>
            )}
            <div className="mt-4 aspect-video bg-secondary/30 rounded-lg flex items-center justify-center text-text-secondary border border-secondary/50 overflow-hidden">
              {primaryUnit?.address ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(primaryUnit.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              ) : (
                <span className="text-sm">Endereço não cadastrado</span>
              )}
            </div>
          </div>
          
          <div className="bg-surface p-8 rounded-2xl border border-secondary">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
              <Clock /> Horário de Funcionamento
            </h2>
            <div className="space-y-2 text-text-secondary">
              <div className="flex justify-between"><span>Segunda a Sexta</span> <span className="text-text-primary font-bold">09:00 - 20:00</span></div>
              <div className="flex justify-between"><span>Sábado</span> <span className="text-text-primary font-bold">09:00 - 18:00</span></div>
              <div className="flex justify-between"><span>Domingo</span> <span className="text-danger font-bold">Fechado</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
