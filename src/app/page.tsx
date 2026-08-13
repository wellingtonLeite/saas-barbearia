import Link from "next/link";
import { Scissors, ShieldCheck, Compass } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-glow rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-primary mb-4 font-medium tracking-wide uppercase">
            <Scissors size={16} /> O Futuro da Barbearia
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            Gestão <span className="text-gradient-gold">Premium</span><br />
            para o seu negócio.
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Plataforma multi-tenant de alto padrão. Agendamentos, financeiro, assinaturas e controle de estoque em um único ecossistema elegante.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-slide-up" style={{ animationDelay: "0.2s" }}>
          
          {/* Super Admin Card */}
          <Link 
            href="/admin"
            className="group relative flex flex-col p-8 rounded-3xl glass-panel hover:bg-surface-hover transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] border border-secondary hover:border-white/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-text-primary group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Super Admin</h2>
            <p className="text-text-secondary leading-relaxed flex-1">
              Visão global da plataforma. Controle assinaturas, MRR, barbearias e métricas de crescimento.
            </p>
            <div className="mt-6 flex items-center text-sm font-medium text-text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Acessar Painel &rarr;
            </div>
          </Link>
          
          {/* Barber Card */}
          <Link 
            href="/dashboard"
            className="group relative flex flex-col p-8 rounded-3xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-[#333] hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-glow rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <Scissors size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-gradient-gold mb-3">Barbeiro</h2>
            <p className="text-text-secondary leading-relaxed flex-1 relative z-10">
              O coração do seu negócio. Gerencie agenda, estoque, equipe e comissões com facilidade.
            </p>
            <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Acessar Gestão &rarr;
            </div>
          </Link>
          
          {/* Client Card */}
          <Link 
            href="/explore"
            className="group relative flex flex-col p-8 rounded-3xl glass-panel hover:bg-surface-hover transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] border border-secondary hover:border-white/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-text-primary group-hover:scale-110 transition-transform">
              <Compass size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Cliente</h2>
            <p className="text-text-secondary leading-relaxed flex-1">
              Experiência mobile-first impecável. Encontre horários, explore barbearias e agende em segundos.
            </p>
            <div className="mt-6 flex items-center text-sm font-medium text-text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Explorar Plataforma &rarr;
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
