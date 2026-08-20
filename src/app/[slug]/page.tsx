import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Scissors, Clock, Star, Phone, Sparkles, ChevronRight, Calendar, User, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Impede que arquivos estáticos não encontrados disparem buscas no banco
  if (/\\.(json|ico|xml|png|jpg|jpeg|svg|txt|webmanifest)$/i.test(resolvedParams.slug)) {
    notFound();
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      units: {
        include: {
          barbers: {
            where: { is_active: true },
            include: {
              barber: {
                include: {
                  barber_reviews: true
                }
              }
            }
          }
        }
      },
      serviceCategories: {
        include: {
          services: true
        },
        orderBy: { order: 'asc' }
      },
      services: true,
      reviews: {
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      }
    }
  });

  if (!tenant) notFound();

  const primaryUnit = tenant.units[0];
  const gallery = (tenant.gallery_urls as string[]) || [];
  const reviews = tenant.reviews || [];
  
  // Barbeiros ativos da unidade principal
  const activeBarbers = primaryUnit?.barbers?.map(b => ({
    id: b.barber.id,
    name: b.barber.name,
    avatar_url: b.barber.avatar_url,
    rating: b.barber.barber_reviews.length > 0
      ? (b.barber.barber_reviews.reduce((acc, r) => acc + r.rating, 0) / b.barber.barber_reviews.length).toFixed(1)
      : "5.0",
    reviewCount: b.barber.barber_reviews.length
  })) || [];
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  // Todos os serviços para o catálogo de estilos
  const allServices = tenant.services || [];
  const visualCatalog = allServices.filter(s => s.image_url);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-12 animate-fade-in relative z-10">
      
      {/* Header Profile Hero */}
      <section className="flex flex-col items-center text-center space-y-4 pt-2">
        {tenant.logo_url ? (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-amber-400 to-primary shadow-2xl relative group">
            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover rounded-full border-4 border-[#0a0a0c]" />
          </div>
        ) : (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-amber-500 shadow-2xl relative">
            <div className="w-full h-full rounded-full border-4 border-[#0a0a0c] bg-surface flex items-center justify-center text-primary shadow-inner">
              <Scissors size={44} />
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">{tenant.name}</h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">{tenant.about_text || "A sua barbearia de confiança."}</p>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full shadow-sm">
            <Star size={16} className="fill-amber-400" />
            <span className="font-black text-sm">{averageRating}</span>
            <span className="text-text-secondary text-xs ml-1">({reviews.length} avaliações)</span>
          </div>
        )}

        {/* CTA Principal de Agendamento */}
        <div className="w-full max-w-md pt-2">
          <Link
            href={`/${tenant.slug}/agendar`}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-amber-400 to-primary text-black font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/25 hover:brightness-110 hover:scale-[1.02] transition-all text-base uppercase tracking-wider"
          >
            <Calendar size={20} /> Agendar Horário Online
          </Link>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {primaryUnit?.phone && (
            <a 
              href={`https://wa.me/55${primaryUnit.phone.replace(/\D/g, '')}`} 
              target="_blank" 
              className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2 rounded-full text-xs font-semibold transition-colors border border-secondary text-text-primary"
            >
              <Phone size={14} className="text-primary" /> WhatsApp
            </a>
          )}
          {primaryUnit?.address && (
            <a 
              href={`https://maps.google.com/maps?q=${encodeURIComponent(primaryUnit.address)}`} 
              target="_blank" 
              className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2 rounded-full text-xs font-semibold transition-colors border border-secondary text-text-primary"
            >
              <MapPin size={14} className="text-primary" /> Como Chegar
            </a>
          )}
        </div>
      </section>

      {/* CATÁLOGO DE ESTILOS & CORTES (GALERIA DE INSPIRAÇÃO COM 1 CLIQUE) */}
      {visualCatalog.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
                <Sparkles className="text-primary" size={22} /> Catálogo de Estilos & Cortes
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Escolha o seu visual favorito e agende diretamente com 1 clique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visualCatalog.map((service) => (
              <div 
                key={service.id} 
                className="bg-surface border border-secondary rounded-3xl overflow-hidden hover:border-primary/60 transition-all duration-300 group shadow-lg flex flex-col justify-between"
              >
                {service.image_url && (
                  <div className="h-48 w-full overflow-hidden bg-background relative shrink-0">
                    <img 
                      src={service.image_url} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-md">
                      <Clock size={12} className="text-primary" /> {service.duration_minutes} min
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-secondary/60">
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-semibold block">Valor</span>
                      <p className="font-display font-black text-primary text-xl">
                        {formatCurrency(Number(service.price))}
                      </p>
                    </div>

                    <Link 
                      href={`/${tenant.slug}/agendar?serviceId=${service.id}`}
                      className="inline-flex items-center gap-1.5 bg-primary text-black hover:bg-primary-hover font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-primary/20 hover:scale-105"
                    >
                      Quero este corte <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOSSA EQUIPE DE BARBEIROS */}
      {activeBarbers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
              <User className="text-primary" size={22} /> Profissionais da Casa
            </h2>
            <span className="text-xs text-text-secondary">{activeBarbers.length} disponíveis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeBarbers.map((barber) => (
              <div 
                key={barber.id}
                className="bg-surface border border-secondary rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary/50 overflow-hidden bg-secondary flex items-center justify-center shadow-md">
                  {barber.avatar_url ? (
                    <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-text-primary">{barber.name.charAt(0)}</span>
                  )}
                </div>

                <div className="w-full">
                  <h4 className="font-bold text-sm text-text-primary truncate">{barber.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-400 mt-0.5">
                    <Star size={11} className="fill-amber-400" />
                    <span className="font-bold">{barber.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Galeria de Fotos do Espaço / Barbearia */}
      {gallery.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white px-1">Conheça Nosso Espaço</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {gallery.map((url, idx) => (
              <div key={idx} className="shrink-0 w-64 h-40 rounded-2xl overflow-hidden snap-center bg-surface border border-secondary shadow-sm">
                <img src={url} alt={`Foto ${idx+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista Completa de Serviços & Preços */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
            <Scissors className="text-primary" size={22} /> Todos os Serviços & Preços
          </h2>
        </div>

        {tenant.serviceCategories.length === 0 && tenant.services.length === 0 ? (
          <div className="text-center p-8 bg-surface rounded-3xl border border-secondary">
            <p className="text-text-secondary">Nenhum serviço cadastrado ainda.</p>
          </div>
        ) : (
          <>
            {tenant.serviceCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-lg font-bold px-3 border-l-4 border-primary text-white">{category.name}</h3>
                
                <div className="space-y-3">
                  {category.services.map((service) => (
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        {service.image_url && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-background border border-secondary shrink-0">
                            <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-base">{service.name}</h4>
                          {service.description && (
                            <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                            <span className="font-bold text-primary">{formatCurrency(Number(service.price))}</span>
                          </div>
                        </div>
                      </div>

                      <Link 
                        href={`/${tenant.slug}/agendar?serviceId=${service.id}`} 
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold px-6 py-2.5 rounded-xl transition-all text-xs text-center sm:self-center"
                      >
                        Agendar
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {tenant.services.filter(s => !s.categoryId).length > 0 && (
              <div className="space-y-4">
                {tenant.serviceCategories.length > 0 && (
                  <h3 className="text-lg font-bold px-3 border-l-4 border-primary text-white">Outros Serviços</h3>
                )}
                
                <div className="space-y-3">
                  {tenant.services.filter(s => !s.categoryId).map((service) => (
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        {service.image_url && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-background border border-secondary shrink-0">
                            <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-base">{service.name}</h4>
                          {service.description && (
                            <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                            <span className="font-bold text-primary">{formatCurrency(Number(service.price))}</span>
                          </div>
                        </div>
                      </div>

                      <Link 
                        href={`/${tenant.slug}/agendar?serviceId=${service.id}`} 
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold px-6 py-2.5 rounded-xl transition-all text-xs text-center sm:self-center"
                      >
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

      {/* Avaliações de Clientes */}
      {reviews.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold px-2 border-l-4 border-primary text-white">Últimas Avaliações</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-surface border border-secondary rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
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
                    <p className="text-text-secondary text-xs sm:text-sm italic">"{review.comment}"</p>
                  )}
                </div>
                <div className="text-[11px] text-text-secondary text-right">
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <footer className="pt-8 pb-4 text-center border-t border-secondary/40">
        <Link href="/" className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium text-text-secondary">Powered by</span>
          <span className="font-display font-black text-white">Navalha<span className="text-primary">88</span></span>
        </Link>
      </footer>
    </div>
  );
}
