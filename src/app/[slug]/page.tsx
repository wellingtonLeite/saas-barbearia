import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Scissors, Clock, Star, Phone } from "lucide-react";
import Image from "next/image";

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      units: true,
      serviceCategories: {
        include: {
          services: true
        },
        orderBy: { order: 'asc' }
      },
      services: {
        where: { categoryId: null }
      },
      reviews: {
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!tenant) notFound();

  const primaryUnit = tenant.units[0];
  const gallery = (tenant.gallery_urls as string[]) || [];
  const reviews = tenant.reviews || [];
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10 animate-fade-in relative z-10">
      {/* Header Profile */}
      <section className="flex flex-col items-center text-center space-y-4">
        {tenant.logo_url ? (
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-hover shadow-2xl relative">
            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover rounded-full border-4 border-[#0a0a0c]" />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-hover shadow-2xl relative">
            <div className="w-full h-full rounded-full border-4 border-[#0a0a0c] bg-surface flex items-center justify-center text-primary">
              <Scissors size={40} />
            </div>
          </div>
        )}
        
        <div>
          <h1 className="text-3xl font-display font-black text-white">{tenant.name}</h1>
          <p className="text-text-secondary mt-1">{tenant.about_text || "A sua barbearia de confiança."}</p>
        </div>

        {averageRating && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full mt-2">
            <Star size={16} className="fill-amber-400" />
            <span className="font-bold text-sm">{averageRating}</span>
            <span className="text-text-secondary text-xs ml-1">({reviews.length} avaliações)</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {primaryUnit?.phone && (
            <a href={`https://wa.me/55${primaryUnit.phone.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/10">
              <Phone size={16} className="text-primary" /> WhatsApp
            </a>
          )}
          {primaryUnit?.address && (
            <a href={`https://maps.google.com/maps?q=${encodeURIComponent(primaryUnit.address)}`} target="_blank" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/10">
              <MapPin size={16} className="text-primary" /> Como Chegar
            </a>
          )}
        </div>
      </section>

      {/* Galeria de Fotos */}
      {gallery.length > 0 && (
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {gallery.map((url, idx) => (
              <div key={idx} className="shrink-0 w-64 h-40 rounded-2xl overflow-hidden snap-center bg-surface border border-secondary">
                <img src={url} alt={`Foto ${idx+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de Serviços */}
      <section className="space-y-8">
        {tenant.serviceCategories.length === 0 && tenant.services.length === 0 ? (
          <div className="text-center p-8 bg-surface rounded-3xl border border-secondary">
            <p className="text-text-secondary">Nenhum serviço cadastrado ainda.</p>
          </div>
        ) : (
          <>
            {tenant.serviceCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h2 className="text-xl font-bold px-2 border-l-4 border-primary text-white">{category.name}</h2>
                
                <div className="space-y-3">
                  {category.services.map((service) => (
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex items-center justify-between gap-4 group">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                          <span className="flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</span>
                          <span className="font-bold text-primary">R$ {Number(service.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <Link href={`/${tenant.slug}/agendar?serviceId=${service.id}`} className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold px-6 py-3 rounded-xl transition-all">
                        Agendar
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {tenant.services.length > 0 && (
              <div className="space-y-4">
                {tenant.serviceCategories.length > 0 && (
                  <h2 className="text-xl font-bold px-2 border-l-4 border-primary text-white">Outros Serviços</h2>
                )}
                
                <div className="space-y-3">
                  {tenant.services.map((service) => (
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex items-center justify-between gap-4 group">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                          <span className="flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</span>
                          <span className="font-bold text-primary">R$ {Number(service.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <Link href={`/${tenant.slug}/agendar?serviceId=${service.id}`} className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold px-6 py-3 rounded-xl transition-all">
                        Agendar
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Avaliações */}
      {reviews.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold px-2 border-l-4 border-primary text-white">Últimas Avaliações</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-surface border border-secondary rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{review.client.name}</span>
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-amber-400" : "text-secondary"} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-text-secondary text-sm italic">"{review.comment}"</p>
                  )}
                </div>
                <div className="text-xs text-secondary mt-4 text-right">
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <footer className="pt-8 pb-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium text-text-secondary">Powered by</span>
          <span className="font-display font-black text-white">Navalha<span className="text-primary">88</span></span>
        </Link>
      </footer>
    </div>
  );
}
