import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, 
  Scissors, 
  Clock, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  User, 
  MessageCircle, 
  Navigation, 
  Phone
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TikTokIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  );
}

// Dias da semana ordenados para exibição (Segunda a Domingo)
const DAYS_OF_WEEK = [
  { key: "1", label: "Segunda-feira", short: "Seg" },
  { key: "2", label: "Terça-feira", short: "Ter" },
  { key: "3", label: "Quarta-feira", short: "Qua" },
  { key: "4", label: "Quinta-feira", short: "Qui" },
  { key: "5", label: "Sexta-feira", short: "Sex" },
  { key: "6", label: "Sábado", short: "Sáb" },
  { key: "0", label: "Domingo", short: "Dom" },
];

function formatSocialUrl(url: string | null | undefined, platform: "instagram" | "facebook" | "tiktok"): string | null {
  if (!url || !url.trim()) return null;
  const clean = url.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  const handle = clean.replace(/^@/, "");
  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "facebook") return `https://facebook.com/${handle}`;
  if (platform === "tiktok") return `https://tiktok.com/@${handle}`;
  return clean;
}

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Impede que arquivos estáticos não encontrados disparem buscas no banco
  if (/\.(json|ico|xml|png|jpg|jpeg|svg|txt|webmanifest)$/i.test(resolvedParams.slug)) {
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
  
  // Calcular média geral de avaliações
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  // Todos os serviços para o catálogo visual
  const allServices = tenant.services || [];
  const visualCatalog = allServices.filter(s => s.image_url);

  // Redes Sociais
  const instagramLink = formatSocialUrl(tenant.instagram_url, "instagram");
  const facebookLink = formatSocialUrl(tenant.facebook_url, "facebook");
  const tiktokLink = formatSocialUrl(tenant.tiktok_url, "tiktok");
  const hasSocials = Boolean(instagramLink || facebookLink || tiktokLink);

  // Horários de Funcionamento da Unidade
  const workingHours = (primaryUnit?.working_hours as Record<string, {
    active: boolean;
    start: string;
    end: string;
    lunch_active?: boolean;
    lunch_start?: string;
    lunch_end?: string;
  }>) || null;

  // WhatsApp e Google Maps Links
  const rawPhone = primaryUnit?.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = rawPhone ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(`Olá! Gostaria de informações sobre os serviços da ${tenant.name}.`)}` : null;
  const mapsUrl = primaryUnit?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryUnit.address)}` : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-12 animate-fade-in relative z-10">
      
      {/* Header Profile Hero */}
      <section className="flex flex-col items-center text-center space-y-4 pt-2">
        {tenant.logo_url ? (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary/80 via-primary to-purple-400 shadow-2xl relative group">
            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover rounded-full border-4 border-[#0f1115]" />
          </div>
        ) : (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary/80 to-purple-500 shadow-2xl relative">
            <div className="w-full h-full rounded-full border-4 border-[#0f1115] bg-surface flex items-center justify-center text-primary shadow-inner">
              <Scissors size={44} />
            </div>
          </div>
        )}
        
        <div className="space-y-1.5 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">{tenant.name}</h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{tenant.about_text || "A sua barbearia de confiança com atendimento de alta qualidade e estilo."}</p>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full shadow-sm">
            <Star size={16} className="fill-amber-400" />
            <span className="font-bold text-sm text-white">{averageRating}</span>
            <span className="text-text-secondary text-xs ml-1">({reviews.length} avaliações)</span>
          </div>
        )}

        {/* CTA Principal de Agendamento - Padrão Dark Premium 88Barber */}
        <div className="w-full max-w-md pt-2">
          <Link
            href={`/${tenant.slug}/agendar`}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider"
          >
            <Calendar size={20} /> Agendar Horário Online
          </Link>
        </div>

        {/* Botões de Ação Rápida (WhatsApp & Como Chegar) */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
          {whatsappUrl && (
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-secondary text-white hover:border-emerald-500/50 shadow-sm"
            >
              <MessageCircle size={15} className="text-emerald-400" /> WhatsApp
            </a>
          )}
          {mapsUrl && (
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-secondary text-white hover:border-primary/50 shadow-sm"
            >
              <MapPin size={15} className="text-primary" /> Como Chegar
            </a>
          )}
        </div>

        {/* Redes Sociais Dinâmicas */}
        {hasSocials && (
          <div className="flex items-center justify-center gap-2.5 pt-1">
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-pink-400 border border-secondary transition-all"
                title="Instagram da Barbearia"
              >
                <InstagramIcon size={17} />
              </a>
            )}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-blue-400 border border-secondary transition-all"
                title="Facebook da Barbearia"
              >
                <FacebookIcon size={17} />
              </a>
            )}
            {tiktokLink && (
              <a
                href={tiktokLink}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-white border border-secondary transition-all"
                title="TikTok da Barbearia"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.84 4.47V12.9a8.27 8.27 0 0 0 5.61 2.19v-3.46c-1.85 0-3.46-.94-4.41-2.39z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </section>

      {/* INFORMAÇÕES COMPLETAS DO ESTABELECIMENTO (ENDEREÇO & HORÁRIOS) */}
      <section className="bg-surface border border-secondary rounded-3xl p-5 sm:p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2 border-b border-secondary/60">
          <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Localização & Horários de Atendimento</h2>
            <p className="text-xs text-text-secondary">Informações do estabelecimento para sua visita</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Endereço e Contato */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                Endereço
              </span>
              <p className="text-sm font-medium text-white leading-relaxed">
                {primaryUnit?.address || "Endereço não informado."}
              </p>
              {primaryUnit?.address && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryUnit.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline mt-2"
                >
                  <Navigation size={13} /> Abrir no Google Maps
                </a>
              )}
            </div>

            {primaryUnit?.phone && (
              <div className="pt-3 border-t border-secondary/50">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Telefone / WhatsApp
                </span>
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <Phone size={14} className="text-emerald-400" />
                  {primaryUnit.phone}
                </p>
              </div>
            )}
          </div>

          {/* Quadro de Horários de Funcionamento */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              Horários da Semana
            </span>

            {workingHours ? (
              <div className="space-y-1.5 bg-background/50 border border-secondary/60 rounded-2xl p-3.5">
                {DAYS_OF_WEEK.map((day) => {
                  const dHours = workingHours[day.key];
                  const isActive = dHours?.active ?? false;

                  return (
                    <div 
                      key={day.key} 
                      className="flex items-center justify-between text-xs py-1 border-b border-secondary/30 last:border-0"
                    >
                      <span className="font-medium text-text-secondary">{day.label}</span>
                      {isActive ? (
                        <span className="font-semibold text-white">
                          {dHours.start} - {dHours.end}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-text-secondary/60">
                          Fechado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-background/40 border border-secondary/40 rounded-2xl p-4 text-center">
                <p className="text-xs text-text-secondary">Consulte os horários diretamente no agendamento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE ESTILOS & CORTES */}
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
                className="bg-surface border border-secondary rounded-3xl overflow-hidden hover:border-primary/60 transition-all duration-300 group shadow-sm flex flex-col justify-between"
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
                      className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-primary/20 hover:scale-105"
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

      {/* PROFISSIONAIS DA CASA */}
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
                <div className="w-16 h-16 rounded-full border-2 border-primary/40 overflow-hidden bg-secondary flex items-center justify-center shadow-md">
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

      {/* Galeria de Fotos do Espaço */}
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
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm">
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
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs text-center sm:self-center"
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
                    <div key={service.id} className="bg-surface hover:bg-surface-hover transition-colors p-4 rounded-2xl border border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm">
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
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs text-center sm:self-center"
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

      {/* Rodapé Oficial 88Barber */}
      <footer className="pt-8 pb-6 text-center border-t border-secondary/40 space-y-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 group transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform">
            <Scissors size={13} />
          </div>
          <span className="text-xs font-medium text-text-secondary">Tecnologia por</span>
          <span className="font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">
            88<span className="text-primary">Barber</span>
          </span>
        </Link>
      </footer>
    </div>
  );
}
