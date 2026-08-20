"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Scissors, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface TenantExploreItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  about_text: string | null;
  units: Array<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    working_hours: any;
  }>;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

interface ExplorarClientProps {
  initialTenants: TenantExploreItem[];
}

// Helper para formatar o resumo dos horários de funcionamento
function formatWorkingHours(workingHoursJson: any): { text: string; isOpenNow: boolean } {
  if (!workingHoursJson || typeof workingHoursJson !== "object") {
    return { text: "Seg a Sáb: 09:00 - 19:00", isOpenNow: true };
  }

  const daysMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const now = new Date();
  const currentDay = now.getDay().toString();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let isOpenNow = false;
  const todayConfig = workingHoursJson[currentDay];
  if (todayConfig && todayConfig.active) {
    if (currentHour >= (todayConfig.start || "00:00") && currentHour <= (todayConfig.end || "23:59")) {
      isOpenNow = true;
    }
  }

  // Agrupa dias ativos
  const activeDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const config = workingHoursJson[i.toString()];
    if (config && config.active) {
      activeDays.push(`${daysMap[i]} ${config.start || "09:00"}-${config.end || "18:00"}`);
    }
  }

  if (activeDays.length === 0) {
    return { text: "Consulte horários", isOpenNow: false };
  }

  if (activeDays.length >= 5) {
    const sample = workingHoursJson["1"] || workingHoursJson["2"] || {};
    return {
      text: `Seg a Sex: ${sample.start || "09:00"} - ${sample.end || "19:00"}`,
      isOpenNow
    };
  }

  return { text: activeDays.slice(0, 2).join(" • "), isOpenNow };
}

export default function ExplorarClient({ initialTenants }: ExplorarClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "OPEN_NOW" | "TOP_RATED">("ALL");

  // Filtra as barbearias em tempo real
  const filteredTenants = useMemo(() => {
    return initialTenants.filter((tenant) => {
      const term = searchTerm.toLowerCase().trim();
      const primaryUnit = tenant.units[0];
      const address = primaryUnit?.address?.toLowerCase() || "";
      const name = tenant.name.toLowerCase();
      const slug = tenant.slug.toLowerCase();
      const servicesMatch = tenant.services.some(s => s.name.toLowerCase().includes(term));

      const matchesSearch = !term || (
        name.includes(term) ||
        address.includes(term) ||
        slug.includes(term) ||
        servicesMatch
      );

      if (!matchesSearch) return false;

      const workingInfo = formatWorkingHours(primaryUnit?.working_hours);
      const averageRating = tenant.reviews.length > 0
        ? tenant.reviews.reduce((acc, curr) => acc + curr.rating, 0) / tenant.reviews.length
        : 5.0;

      if (filterType === "OPEN_NOW" && !workingInfo.isOpenNow) {
        return false;
      }

      if (filterType === "TOP_RATED" && averageRating < 4.5 && tenant.reviews.length > 0) {
        return false;
      }

      return true;
    });
  }, [initialTenants, searchTerm, filterType]);

  return (
    <div className="space-y-10 pb-20">
      {/* HERO SECTION DE BUSCA */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181a20] to-[#12141a] border border-white/10 p-6 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20">
            <Sparkles size={14} /> Encontre sua próxima experiência
          </div>
          
          <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
            Descubra as Melhores Barbearias
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Agende cortes de cabelo, barba e tratamentos exclusivos nas barbearias parceiras em poucos segundos.
          </p>

          {/* INPUT DE BUSCA EM TEMPO REAL */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Search size={22} className="text-primary" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busque por Nome da barbearia, Cidade, Bairro ou Serviço..."
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-surface border border-secondary text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base shadow-xl transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-white bg-white/10 px-2 py-1 rounded-md"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === "ALL"
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-surface border border-secondary text-slate-400 hover:text-white"
              }`}
            >
              Todas ({initialTenants.length})
            </button>
            <button
              onClick={() => setFilterType("OPEN_NOW")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === "OPEN_NOW"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "bg-surface border border-secondary text-slate-400 hover:text-white"
              }`}
            >
              🟢 Abertas Agora
            </button>
            <button
              onClick={() => setFilterType("TOP_RATED")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === "TOP_RATED"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                  : "bg-surface border border-secondary text-slate-400 hover:text-white"
              }`}
            >
              ⭐ Melhores Avaliadas
            </button>
          </div>
        </div>
      </section>

      {/* RESULTADOS / GRID DE CARDS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Barbearias Disponíveis</span>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">
              {filteredTenants.length}
            </span>
          </h2>
          {searchTerm && (
            <span className="text-xs text-slate-400">
              Resultados para "{searchTerm}"
            </span>
          )}
        </div>

        {filteredTenants.length === 0 ? (
          <div className="bg-surface border border-secondary rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <Scissors size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Nenhuma barbearia encontrada</h3>
            <p className="text-sm text-slate-400">
              Não encontramos nenhuma barbearia com o termo "{searchTerm}". Tente buscar por outro nome, bairro ou cidade.
            </p>
            <button
              onClick={() => { setSearchTerm(""); setFilterType("ALL"); }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors"
            >
              Ver Todas as Barbearias
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => {
              const primaryUnit = tenant.units[0];
              const reviewsCount = tenant.reviews.length;
              const averageRating = reviewsCount > 0
                ? (tenant.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1)
                : "5.0";
              const workingInfo = formatWorkingHours(primaryUnit?.working_hours);
              const cleanPhone = primaryUnit?.phone ? primaryUnit.phone.replace(/\D/g, "") : null;

              return (
                <div
                  key={tenant.id}
                  className="bg-surface hover:bg-[#1f232c] border border-secondary hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div>
                    {/* CARD HEADER */}
                    <div className="p-6 border-b border-secondary/60 relative">
                      <div className="flex items-start gap-4">
                        {/* Logo / Avatar */}
                        {tenant.logo_url ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30 shrink-0 bg-background">
                            <img
                              src={tenant.logo_url}
                              alt={tenant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-purple-600/30 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                            <Scissors size={28} />
                          </div>
                        )}

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Link 
                              href={`/${tenant.slug}`}
                              className="font-display font-bold text-lg text-white hover:text-primary transition-colors truncate block"
                            >
                              {tenant.name}
                            </Link>
                          </div>

                          {/* Slug link badge */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-semibold truncate">
                              88barber.top/{tenant.slug}
                            </span>
                          </div>

                          {/* Ratings and Open Status */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                              <Star size={13} className="fill-amber-400" />
                              <span>{averageRating}</span>
                              <span className="text-slate-500 font-normal">
                                ({reviewsCount > 0 ? `${reviewsCount} avaliações` : "Novo"})
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                workingInfo.isOpenNow
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${workingInfo.isOpenNow ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                              {workingInfo.isOpenNow ? "Aberto" : "Fechado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY: LOCALIZAÇÃO, HORÁRIO & CONTATO */}
                    <div className="p-6 space-y-3 text-xs text-slate-300">
                      {/* Endereço */}
                      <div className="flex items-start gap-2.5">
                        <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-slate-300">
                          {primaryUnit?.address || "Endereço central informado no agendamento"}
                        </span>
                      </div>

                      {/* Horário */}
                      <div className="flex items-center gap-2.5">
                        <Clock size={15} className="text-primary shrink-0" />
                        <span className="text-slate-400">{workingInfo.text}</span>
                      </div>

                      {/* Telefone / WhatsApp */}
                      {primaryUnit?.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone size={15} className="text-primary shrink-0" />
                          <a
                            href={`https://wa.me/55${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold"
                          >
                            {primaryUnit.phone} (WhatsApp)
                          </a>
                        </div>
                      )}

                      {/* PREVIEW DE SERVIÇOS & PREÇOS */}
                      {tenant.services.length > 0 && (
                        <div className="pt-3 border-t border-secondary/50 space-y-2">
                          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                            Serviços Populares:
                          </span>
                          <div className="space-y-1.5">
                            {tenant.services.slice(0, 3).map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/5 border border-white/5"
                              >
                                <span className="font-medium text-slate-200 truncate pr-2">
                                  {service.name}
                                </span>
                                <span className="font-bold text-white shrink-0">
                                  {formatCurrency(service.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD FOOTER / CTA ACTIONS */}
                  <div className="p-6 pt-0 space-y-2">
                    <Link
                      href={`/${tenant.slug}/agendar`}
                      className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/40 group-hover:translate-y-[-2px]"
                    >
                      <Calendar size={18} />
                      <span>Agendar Horário</span>
                    </Link>

                    <Link
                      href={`/${tenant.slug}`}
                      className="w-full py-2 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Ver página completa e fotos</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
