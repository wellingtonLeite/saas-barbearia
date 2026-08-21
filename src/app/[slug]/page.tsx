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
  Phone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.84 4.47V12.9a8.27 8.27 0 0 0 5.61 2.19v-3.46c-1.85 0-3.46-.94-4.41-2.39z"/>
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
  
  // Barbeiros ativos da unidade principal com nota calculada
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
  const whatsappUrl = rawPhone ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(`Olá! Gostaria de agendar um horário na ${tenant.name}.`)}` : null;
  const mapsUrl = primaryUnit?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryUnit.address)}` : null;

  // Dia da semana atual (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const currentDayKey = String(new Date().getDay());

  return (
    <div className="min-h-screen relative pb-28 sm:pb-16">
      {/* Glow Superior & Cover Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-12 animate-fade-in">
        
        {/* ========================================================================= */}
        {/* 1. HERO HEADER DARK PREMIUM ELEGANTE                                      */}
        {/* ========================================================================= */}
        <section className="flex flex-col items-center text-center space-y-5 pt-2">
          
          {/* Logo Central com Anel Iluminado */}
          <div className="relative group">
            {tenant.logo_url ? (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-amber-300 to-primary/60 shadow-[0_0_35px_rgba(217,119,6,0.3)]">
                <img 
                  src={tenant.logo_url} 
                  alt={tenant.name} 
                  className="w-full h-full object-cover rounded-full border-4 border-[#0f1115]" 
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-amber-300 to-primary/60 shadow-[0_0_35px_rgba(217,119,6,0.3)]">
                <div className="w-full h-full rounded-full border-4 border-[#0f1115] bg-[#14171f] flex items-center justify-center text-primary shadow-inner">
                  <Scissors size={42} />
                </div>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#0a0a0c] flex items-center justify-center shadow-md" title="Barbearia Aberta para Agendamentos">
              <CheckCircle2 size={12} className="text-black stroke-[3]" />
            </div>
          </div>
          
          {/* Identidade & Descrição */}
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight">
              {tenant.name}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              {tenant.about_text || "Experiência de barbearia premium, cortes exclusivos e atendimento de excelência."}
            </p>
          </div>

          {/* Pills de Metadados & Credibilidade */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {/* Avaliação */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3.5 py-1.5 rounded-full shadow-sm">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-xs sm:text-sm text-white">{averageRating}</span>
              <span className="text-text-secondary text-[11px] sm:text-xs">
                ({reviews.length > 0 ? `${reviews.length} avaliações` : "5.0 ★"})
              </span>
            </div>

            {/* Selo Verificado */}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold shadow-sm">
              <ShieldCheck size={14} />
              <span>Barbearia Verificada</span>
            </div>

            {/* Endereço Resumido */}
            {primaryUnit?.address && (
              <a 
                href={mapsUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-surface hover:bg-surface-hover border border-secondary px-3 py-1.5 rounded-full text-xs text-text-secondary hover:text-white transition-colors"
                title="Ver endereço no mapa"
              >
                <MapPin size={13} className="text-primary" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{primaryUnit.address.split(',')[0]}</span>
              </a>
            )}
          </div>

          {/* CTA PRINCIPAL DE ALTO IMPACTO (Conversão Imediata) */}
          <div className="w-full max-w-md pt-2 px-2">
            <Link
              href={`/${tenant.slug}/agendar`}
              className="w-full bg-primary hover:bg-primary-hover text-black font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base uppercase tracking-wider group"
            >
              <Calendar size={20} className="stroke-[2.5]" />
              <span>Agendar Meu Horário Online</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Ações Secundárias & Redes Sociais */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {whatsappUrl && (
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-secondary text-white hover:border-emerald-500/50 shadow-sm"
              >
                <MessageCircle size={15} className="text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}

            {mapsUrl && (
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-surface hover:bg-surface-hover px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-secondary text-white hover:border-primary/50 shadow-sm"
              >
                <Navigation size={14} className="text-primary" />
                <span>Como Chegar</span>
              </a>
            )}

            {hasSocials && (
              <div className="flex items-center gap-1.5 pl-1">
                {instagramLink && (
                  <a
                    href={instagramLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-pink-400 border border-secondary transition-all"
                    title="Instagram"
                  >
                    <InstagramIcon size={16} />
                  </a>
                )}
                {facebookLink && (
                  <a
                    href={facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-blue-400 border border-secondary transition-all"
                    title="Facebook"
                  >
                    <FacebookIcon size={16} />
                  </a>
                )}
                {tiktokLink && (
                  <a
                    href={tiktokLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-white border border-secondary transition-all"
                    title="TikTok"
                  >
                    <TikTokIcon size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. NOSSOS ESPECIALISTAS (Barbeiros Selecionáveis)                           */}
        {/* ========================================================================= */}
        {activeBarbers.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
                  <User className="text-primary" size={22} /> Nossos Especialistas
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Selecione o profissional de sua preferência para agendar direto.
                </p>
              </div>
              <span className="text-xs text-text-secondary font-medium hidden sm:inline-block">
                {activeBarbers.length} disponíveis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {activeBarbers.map((barber) => (
                <Link 
                  key={barber.id}
                  href={`/${tenant.slug}/agendar?barberId=${barber.id}`}
                  className="bg-surface hover:bg-surface-hover border border-secondary hover:border-primary/60 rounded-2xl p-4 text-center flex flex-col items-center justify-between space-y-3 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  {/* Foto do Barbeiro com Glow */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-primary/40 group-hover:border-primary overflow-hidden bg-secondary flex items-center justify-center shadow-md transition-colors">
                      {barber.avatar_url ? (
                        <img 
                          src={barber.avatar_url} 
                          alt={barber.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                          {barber.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-surface" title="Disponível" />
                  </div>

                  {/* Nome e Avaliação */}
                  <div className="w-full">
                    <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                      {barber.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-400 mt-1">
                      <Star size={11} className="fill-amber-400" />
                      <span className="font-bold">{barber.rating}</span>
                      <span className="text-[10px] text-text-secondary">({barber.reviewCount})</span>
                    </div>
                  </div>

                  {/* Botão sutil Escolher */}
                  <span className="w-full text-[11px] font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-black py-1.5 rounded-lg transition-colors">
                    Escolher
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. CARDÁPIO UNIFICADO DE SERVIÇOS (Zero Redundância)                      */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
                <Scissors className="text-primary" size={22} /> Cardápio de Serviços & Cortes
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Escolha o serviço desejado e garanta seu horário em instantes.
              </p>
            </div>
          </div>

          {tenant.serviceCategories.length === 0 && tenant.services.length === 0 ? (
            <div className="text-center p-8 bg-surface rounded-3xl border border-secondary">
              <p className="text-text-secondary text-sm">Nenhum serviço cadastrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Categorias com Serviços */}
              {tenant.serviceCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-1.5 h-5 bg-primary rounded-full" />
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {category.name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.services.map((service) => (
                      <ServiceCard key={service.id} service={service} tenantSlug={tenant.slug} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Serviços sem Categoria (se houver) */}
              {tenant.services.filter(s => !s.categoryId).length > 0 && (
                <div className="space-y-4">
                  {tenant.serviceCategories.length > 0 && (
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-1.5 h-5 bg-primary rounded-full" />
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        Outros Serviços
                      </h3>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tenant.services.filter(s => !s.categoryId).map((service) => (
                      <ServiceCard key={service.id} service={service} tenantSlug={tenant.slug} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. GALERIA DO ESPAÇO (Opcional se cadastrada)                              */}
        {/* ========================================================================= */}
        {gallery.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Conheça Nosso Espaço
              </h2>
            </div>
            <div className="flex gap-3.5 overflow-x-auto pb-3 snap-x snap-mandatory hide-scrollbar">
              {gallery.map((url, idx) => (
                <div 
                  key={idx} 
                  className="shrink-0 w-60 sm:w-72 h-40 rounded-2xl overflow-hidden snap-center bg-surface border border-secondary shadow-sm group"
                >
                  <img 
                    src={url} 
                    alt={`Foto ${idx+1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. LOCALIZAÇÃO & HORÁRIOS DE ATENDIMENTO (Seção Inferior Estruturada)      */}
        {/* ========================================================================= */}
        <section className="bg-surface border border-secondary rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-secondary/60">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Clock size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Localização & Horários</h2>
              <p className="text-xs text-text-secondary">Informações completas para planejar sua visita</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Coluna 1: Endereço e Contato */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Endereço Completo
                </span>
                <p className="text-sm font-medium text-white leading-relaxed">
                  {primaryUnit?.address || "Endereço não informado."}
                </p>
                {primaryUnit?.address && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryUnit.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline pt-1"
                  >
                    <Navigation size={13} /> Abrir no Google Maps <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {primaryUnit?.phone && (
                <div className="pt-4 border-t border-secondary/60 space-y-2">
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-400" /> Contato & WhatsApp
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{primaryUnit.phone}</span>
                    {whatsappUrl && (
                      <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Chamar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 2: Quadro de Horários da Semana */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                Horários de Funcionamento
              </span>

              {workingHours ? (
                <div className="space-y-1 bg-background/60 border border-secondary/70 rounded-2xl p-3 sm:p-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dHours = workingHours[day.key];
                    const isActive = dHours?.active ?? false;
                    const isToday = day.key === currentDayKey;

                    return (
                      <div 
                        key={day.key} 
                        className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                          isToday 
                            ? "bg-primary/15 border border-primary/30 text-white font-semibold" 
                            : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{day.label}</span>
                          {isToday && (
                            <span className="bg-primary text-black font-black text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wider">
                              Hoje
                            </span>
                          )}
                        </div>
                        {isActive ? (
                          <span className={isToday ? "text-primary font-bold" : "text-white font-medium"}>
                            {dHours.start} - {dHours.end}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-secondary/60">
                            Fechado
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-background/40 border border-secondary/40 rounded-2xl p-4 text-center">
                  <p className="text-xs text-text-secondary">Consulte os horários disponíveis ao agendar seu serviço.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. DEPOIMENTOS & AVALIAÇÕES REAIS                                         */}
        {/* ========================================================================= */}
        {reviews.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" size={20} /> Avaliações dos Clientes
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Opiniões reais de quem já cortou na {tenant.name}.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="bg-surface border border-secondary rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{review.client?.name || "Cliente"}</span>
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-secondary"} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-text-secondary text-xs sm:text-sm italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-text-secondary/70 text-right">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 7. RODAPÉ OFICIAL 88BARBER                                                */}
        {/* ========================================================================= */}
        <footer className="pt-8 pb-4 text-center border-t border-secondary/40 space-y-2">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 group transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform">
              <Scissors size={13} />
            </div>
            <span className="text-xs font-medium text-text-secondary">Tecnologia por</span>
            <span className="font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">
              88<span className="text-primary">Barber</span> Enterprise
            </span>
          </Link>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* 8. BARRA FLUTUANTE MOBILE FIXA (Floating Bottom Bar)                      */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1115]/95 backdrop-blur-md border-t border-secondary px-4 py-3 flex items-center justify-between shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2.5 overflow-hidden pr-2">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded-full object-cover border border-primary/50 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
              <Scissors size={14} />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate">{tenant.name}</h4>
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <Star size={10} className="fill-amber-400" />
              <span>{averageRating}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/${tenant.slug}/agendar`}
          className="shrink-0 bg-primary hover:bg-primary-hover text-black font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Calendar size={14} /> Agendar
        </Link>
      </div>
    </div>
  );
}

// Subcomponente de Card de Serviço Elegante e Reutilizável
function ServiceCard({ service, tenantSlug }: { service: any; tenantSlug: string }) {
  return (
    <div className="bg-surface border border-secondary hover:border-primary/60 rounded-3xl overflow-hidden transition-all duration-300 group shadow-sm flex flex-col justify-between">
      {/* Se o serviço tiver foto */}
      {service.image_url ? (
        <div className="h-44 w-full overflow-hidden bg-background relative shrink-0">
          <img 
            src={service.image_url} 
            alt={service.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-md">
            <Clock size={12} className="text-primary" /> {service.duration_minutes} min
          </span>
        </div>
      ) : (
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scissors size={18} />
          </div>
          <span className="bg-background/80 text-text-secondary text-xs font-semibold px-2.5 py-1 rounded-full border border-secondary flex items-center gap-1">
            <Clock size={12} className="text-primary" /> {service.duration_minutes} min
          </span>
        </div>
      )}

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-primary transition-colors">
            {service.name}
          </h4>
          {service.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-secondary/60">
          <div>
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Valor</span>
            <p className="font-display font-black text-primary text-xl">
              {formatCurrency(Number(service.price))}
            </p>
          </div>

          <Link 
            href={`/${tenantSlug}/agendar?serviceId=${service.id}`}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-black font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
          >
            Agendar <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
