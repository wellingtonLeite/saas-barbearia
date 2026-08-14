import Link from "next/link";
import Image from "next/image";
import { LandingForm } from "@/components/LandingForm";
import { 
  Scissors, 
  CheckCircle2,
  CalendarDays,
  CreditCard,
  TrendingUp,
  MessageCircle,
  Globe,
  Smartphone,
  Star,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/20 text-text-primary">
      
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo_navalha88.jpg" alt="Navalha88" width={220} height={70} className="h-14 sm:h-16 w-auto object-contain mix-blend-lighten" />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-text-secondary">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-text-secondary hover:text-primary font-bold transition-colors text-sm sm:text-base hidden sm:block">
              Entrar
            </Link>
            <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:scale-105 text-sm sm:text-base whitespace-nowrap">
              Assinar Sistema
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-32 overflow-hidden px-4 sm:px-6 border-b border-secondary">
        <div className="absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary-glow rounded-full blur-[100px] sm:blur-[120px] opacity-60 pointer-events-none translate-x-1/4 -translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left: Copy + Form */}
          <div className="flex flex-col items-start animate-slide-up text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary mb-5 sm:mb-6 font-bold text-xs sm:text-sm tracking-wide uppercase">
              O SISTEMA DEFINITIVO PARA BARBEARIAS
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.1] mb-4 sm:mb-6">
              Sua barbearia cheia e seus clientes{" "}
              <span className="text-gradient-primary">fidelizados.</span>
            </h1>
            
            <p className="text-text-secondary text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 max-w-lg">
              Agendamento inteligente, avisos automáticos via WhatsApp e controle financeiro na palma da mão — direto do seu celular.
            </p>
            
            {/* Signup Form */}
            <div className="w-full max-w-md bg-surface p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-secondary shadow-2xl relative">
              <div className="absolute -top-3 left-5 sm:left-6 bg-primary text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                FALE COM O COMERCIAL
              </div>
              <LandingForm />
              <p className="text-center text-xs text-text-secondary mt-3 font-medium">Sem cartão de crédito • Cancele quando quiser</p>
            </div>
          </div>

          {/* Right: Image + Badges */}
          <div className="relative flex justify-center items-center order-2 mt-4 md:mt-0">
            {/* Mobile: smaller image */}
            <div className="relative w-64 sm:w-80 md:w-auto animate-float">
              <Image 
                src="/barber_hero_purple.jpg" 
                alt="Barbeiro utilizando Navalha88 no celular" 
                width={500} 
                height={500} 
                priority
                className="rounded-2xl sm:rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.3)] object-cover aspect-square border border-secondary/50 w-full"
              />
              {/* Badge: Agendamento */}
              <div className="absolute -left-4 sm:-left-10 top-10 sm:top-20 bg-surface border border-secondary p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3">
                <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-full text-green-400 flex-shrink-0"><CalendarDays size={16} /></div>
                <div>
                  <p className="text-xs text-text-secondary font-bold leading-tight">Novo Agendamento</p>
                  <p className="text-xs sm:text-sm text-white font-black">Lucas às 15:00</p>
                </div>
              </div>
              {/* Badge: Pagamento */}
              <div className="absolute -right-3 sm:-right-5 bottom-10 sm:bottom-20 bg-surface border border-secondary p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3">
                <div className="bg-primary/20 p-1.5 sm:p-2 rounded-full text-primary flex-shrink-0"><CreditCard size={16} /></div>
                <div>
                  <p className="text-xs text-text-secondary font-bold leading-tight">Pagamento Confirmado</p>
                  <p className="text-xs sm:text-sm text-white font-black">+ R$ 65,00</p>
                </div>
              </div>
              {/* Badge: Mobile */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-surface border border-primary/30 p-3 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap">
                <Smartphone size={14} className="text-primary" />
                <p className="text-xs text-primary font-black">100% otimizado para celular</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MOBILE FIRST HIGHLIGHT ============ */}
      <section className="bg-primary/5 border-b border-secondary py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <Smartphone size={20} />
              </div>
              <span className="font-bold text-white">Controle pelo celular</span>
            </div>
            <div className="w-px h-8 bg-secondary hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} />
              </div>
              <span className="font-bold text-white">WhatsApp integrado</span>
            </div>
            <div className="w-px h-8 bg-secondary hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <Star size={20} />
              </div>
              <span className="font-bold text-white">agora mesmo. Sistema completo com mensalidade que cabe no bolso.</span>
            </div>
            <div className="w-px h-8 bg-secondary hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <span className="font-bold text-white">Agenda 24h automática</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MOBILE PITCH SECTION ============ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface border-b border-secondary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white leading-tight mb-6">
              Feito para ser usado no seu <span className="text-gradient-primary">celular.</span>
            </h2>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6">
              Sabemos que nem todo barbeiro tem um computador na barbearia. Por isso o Navalha88 foi construído com foco em <strong className="text-white">mobile first</strong> — tudo que você precisa cabe na tela do seu smartphone.
            </p>
            <ul className="space-y-4">
              {[
                "Ver e gerenciar toda a agenda do dia",
                "Aceitar ou cancelar agendamentos",
                "Ver relatório financeiro do dia",
                "Avisar clientes via WhatsApp com 1 toque",
                "Adicionar novos serviços e preços",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary font-medium">
                  <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="w-48 sm:w-64 md:w-72 bg-background rounded-[2rem] border-4 border-secondary shadow-2xl overflow-hidden relative">
              {/* Fake phone UI */}
              <div className="bg-background pt-6 pb-4 px-4">
                <div className="w-24 h-2 bg-secondary rounded-full mx-auto mb-4" />
                <div className="bg-surface rounded-2xl p-4 mb-3">
                  <p className="text-xs text-text-secondary font-bold mb-1">Agenda de Hoje</p>
                  <p className="text-xl font-black text-white">12 cortes</p>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full" />
                  </div>
                </div>
                {[
                  { name: "Lucas M.", time: "09:00", service: "Corte + Barba" },
                  { name: "Rafael S.", time: "10:00", service: "Corte Social" },
                  { name: "Bruno K.", time: "11:30", service: "Barba" },
                ].map((apt) => (
                  <div key={apt.name} className="bg-surface rounded-xl p-3 mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">{apt.name}</p>
                      <p className="text-xs text-text-secondary">{apt.service}</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{apt.time}</span>
                  </div>
                ))}
                <button className="w-full mt-3 bg-primary text-white font-black py-3 rounded-xl text-sm">
                  + Novo Agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section id="funcionalidades" className="py-16 sm:py-24 bg-background px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-primary font-black tracking-widest uppercase mb-4 text-xs sm:text-sm">O arsenal completo</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4 sm:mb-6 leading-tight">
              Tudo que uma barbearia de sucesso precisa
            </h3>
            <p className="text-text-secondary text-base sm:text-lg">
              Esqueça planilhas e sistemas complicados. Controle sua barbearia inteira pelo celular.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: CalendarDays, color: "bg-primary/20 text-primary", title: "Agenda Inteligente", desc: "Seus clientes agendam pelo link próprio 24h por dia. A agenda organiza automaticamente, sem conflitos." },
              { icon: MessageCircle, color: "bg-green-500/20 text-green-400", title: "Lembretes Automáticos", desc: "Reduza faltas a quase zero com lembretes automáticos para que o cliente não esqueça do horário." },
              { icon: TrendingUp, color: "bg-pink-500/20 text-pink-400", title: "Comissões Automáticas", desc: "Configure a % de cada barbeiro. O sistema calcula tudo no fechamento — sem planilha, sem erro." },
              { icon: Globe, color: "bg-blue-500/20 text-blue-400", title: "Site e App Exclusivos", desc: "Sua barbearia ganha um site moderno. O cliente pode instalar como App direto no celular." },
              { icon: CreditCard, color: "bg-orange-500/20 text-orange-400", title: "Gestão Financeira", desc: "Controle total de contas a pagar, contas a receber e histórico detalhado do seu fluxo de caixa." },
              { icon: Globe, color: "bg-indigo-500/20 text-indigo-400", title: "Gestão Centralizada", desc: "Acompanhe de perto o desempenho da sua barbearia com relatórios completos na palma da mão." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-secondary hover:border-primary transition-colors group active:scale-95 cursor-pointer">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center mb-5 sm:mb-8 rotate-3 group-hover:rotate-0 transition-transform`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4">{title}</h4>
                <p className="text-text-secondary leading-relaxed font-medium text-sm sm:text-base">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="planos" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface border-t border-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4 sm:mb-6">Planos simples e justos</h2>
            <p className="text-text-secondary text-base sm:text-lg font-medium">Comece de graça. Assine quando quiser.</p>
          </div>

          {/* Planos: Grid 1 col mobile, 2 col sm, 4 col lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">

            {/* FREE Plan */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-background border-2 border-green-500/40 flex flex-col hover:border-green-500/80 transition-colors relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-primary/20 text-primary text-xs font-black px-2.5 py-1 rounded-full">POPULAR</div>
              <h3 className="text-xl font-black text-white mb-1.5">Profissional</h3>
              <p className="text-text-secondary text-sm">Ideal para barbearias em crescimento</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-green-400">R$ 0</span>
                <span className="text-text-secondary font-bold text-sm"> / 15 dias</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />1 Barbeiro</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />Agenda Online</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />App do cliente (link)</li>
                <li className="flex items-start gap-2.5 text-text-secondary/40 font-medium text-sm line-through"><CheckCircle2 size={16} className="shrink-0 mt-0.5" />WhatsApp</li>
                <li className="flex items-start gap-2.5 text-text-secondary/40 font-medium text-sm line-through"><CheckCircle2 size={16} className="shrink-0 mt-0.5" />Financeiro</li>
              </ul>
              <Link href="/register?plan=free" className="w-full py-3 rounded-xl font-black text-center text-green-400 border-2 border-green-500/40 hover:border-green-500 hover:bg-green-500/5 transition-colors text-sm active:scale-95">
                FALAR COM VENDAS
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-background border border-secondary flex flex-col hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-black text-white mb-1.5">Básico</h3>
              <p className="text-text-secondary mb-6 font-medium text-sm">O essencial para começar.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">R$ 59</span>
                <span className="text-text-secondary font-bold text-sm">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Até 2 Barbeiros</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Agenda Online</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Site Personalizado</li>
                <li className="flex items-start gap-2.5 text-text-secondary/40 font-medium text-sm line-through"><CheckCircle2 size={16} className="shrink-0 mt-0.5" />Comissões Auto</li>
              </ul>
              <Link href="/register?plan=basic" className="w-full py-3 rounded-xl font-black text-center text-white border-2 border-secondary hover:border-primary hover:text-primary transition-colors text-sm active:scale-95">
                ASSINAR
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-background text-white border-4 border-primary relative shadow-[0_0_30px_rgba(139,92,246,0.2)] lg:scale-105 z-10 flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                ⭐ MAIS POPULAR
              </div>
              <h3 className="text-xl font-black mb-1.5">Profissional</h3>
              <p className="text-text-secondary mb-6 font-bold text-sm">Para barbearias de alto fluxo.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-primary">R$ 99</span>
                <span className="text-text-secondary font-bold text-sm">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2.5 font-bold text-white text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Barbeiros Ilimitados</li>
                <li className="flex items-start gap-2.5 font-bold text-white text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Comissões Automáticas</li>
                <li className="flex items-start gap-2.5 font-bold text-white text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Lembretes WhatsApp</li>
                <li className="flex items-start gap-2.5 font-bold text-white text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Gestão Financeira</li>
              </ul>
              <Link href="/register?plan=pro" className="w-full py-3 rounded-xl font-black text-center bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg text-sm active:scale-95">
                ASSINAR AGORA
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-background border border-secondary flex flex-col hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-black text-white mb-1.5">Rede</h3>
              <p className="text-text-secondary mb-6 font-medium text-sm">Para redes e franquias.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">R$ 199</span>
                <span className="text-text-secondary font-bold text-sm">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Múltiplas Filiais</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Relatório Consolidado</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Controle de Estoque</li>
                <li className="flex items-start gap-2.5 text-text-secondary font-medium text-sm"><CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />Suporte VIP Prioritário</li>
              </ul>
              <Link href="/register?plan=network" className="w-full py-3 rounded-xl font-black text-center text-white border-2 border-secondary hover:border-primary hover:text-primary transition-colors text-sm active:scale-95">
                CONSULTOR
              </Link>
            </div>
          </div>

          {/* Trial CTA */}
          <div className="mt-10 sm:mt-14 text-center">
            <p className="text-text-secondary font-medium mb-4">Ainda em dúvida? Entre em contato agora mesmo. Sem compromisso.</p>
            <Link href="/register?plan=free" className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black px-8 py-3 rounded-full transition-colors active:scale-95">
              <Star size={16} /> Entrar em Contato
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-background border-t border-secondary py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo_navalha88.jpg" alt="Navalha88" width={180} height={50} className="h-12 sm:h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 mix-blend-lighten" />
          </Link>
          <p className="text-text-secondary font-medium text-center text-sm sm:text-base">
            © {new Date().getFullYear()} Navalha88 SaaS. Feito para barbeiros que buscam o topo.
          </p>
          <div className="flex gap-4 sm:gap-6 font-bold text-sm sm:text-base">
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">Termos</a>
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
