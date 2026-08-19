import Link from "next/link";
import Image from "next/image";
import { LandingForm } from "@/components/LandingForm";
import { 
  CheckCircle2,
  CalendarDays,
  MessageCircle,
  Star,
  Bot,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-body selection:bg-primary/20 text-gray-300">
      
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo_88barber.jpg" alt="88barber" width={220} height={70} className="h-16 w-auto object-contain mix-blend-lighten" />
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-400">
            <a href="#ia" className="hover:text-primary transition-colors flex items-center gap-1"><Bot size={14}/> Agente IA</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white font-semibold transition-colors text-sm">
              Entrar
            </Link>
            <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 text-sm whitespace-nowrap flex items-center gap-2">
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-4 sm:px-6 border-b border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[150px] opacity-10 pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col items-start animate-slide-up text-left order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary mb-6 font-bold text-xs tracking-wide uppercase">
              <Bot size={14} className="animate-pulse" /> A Revolução na sua Barbearia
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.1] mb-6">
              Piloto automático com nosso <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Agente IA.</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              O 88barber não é apenas um sistema. É o seu novo funcionário: um <strong className="text-white">SDR Automatizado no WhatsApp</strong> que atende, agenda e fideliza clientes 24h por dia.
            </p>
            
            <div className="w-full max-w-md bg-[#111] p-6 rounded-3xl border border-white/10 shadow-2xl relative">
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-black px-4 py-1 rounded-full shadow-lg">
                TESTE GRATUITAMENTE
              </div>
              <LandingForm />
              <p className="text-center text-xs text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> Sem cartão de crédito necessário
              </p>
            </div>
          </div>

          <div className="relative flex justify-center items-center order-2 mt-8 md:mt-0">
            <div className="relative w-72 sm:w-80 md:w-auto animate-float">
              <Image 
                src="/barber_hero_purple.jpg" 
                alt="Agente IA no WhatsApp" 
                width={500} 
                height={500} 
                priority
                className="rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] object-cover aspect-square border border-white/10 w-full"
              />
              
              <div className="absolute -left-8 top-20 bg-[#111]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full text-green-400"><Bot size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold">Agente IA (WhatsApp)</p>
                  <p className="text-sm text-white font-black">"Horário agendado com sucesso!"</p>
                </div>
              </div>

              <div className="absolute -right-6 bottom-20 bg-[#111]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full text-primary"><Zap size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold">Conversão Rápida</p>
                  <p className="text-sm text-white font-black">+40% de Agendamentos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ IA HIGHLIGHT ============ */}
      <section id="ia" className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#111] border-b border-white/5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Bot size={48} className="text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6">
            Conheça o seu <span className="text-primary">SDR Automatizado</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
            No Plano VIP, você ganha uma Inteligência Artificial exclusiva conectada ao seu WhatsApp. Ela conversa com seus clientes como se fosse humana, entende a disponibilidade da agenda e marca os horários sem você precisar mover um dedo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 text-left">
              <MessageCircle className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Atendimento 24/7</h3>
              <p className="text-gray-400">Sua barbearia nunca fecha. O Agente IA responde clientes de madrugada, domingos e feriados.</p>
            </div>
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <Zap className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Respostas Humanizadas</h3>
              <p className="text-gray-400">Ele usa inteligência natural para entender áudios curtos, gírias e intenções de compra.</p>
            </div>
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 text-left">
              <CalendarDays className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Agenda Integrada</h3>
              <p className="text-gray-400">O robô cruza os dados e só oferece os horários realmente livres da sua equipe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="planos" className="py-24 px-4 sm:px-6 bg-[#0a0a0a] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">Escolha o plano ideal</h2>
            <p className="text-gray-400 text-lg">De barbearias iniciantes a grandes redes. Evolua no seu ritmo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Plano Gratuito */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 flex flex-col hover:border-white/30 transition-colors">
              <h3 className="text-xl font-black text-white mb-2">Gratuito</h3>
              <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Para quem está começando agora.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">R$ 0</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-white/50 shrink-0" />1 Barbeiro</li>
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-white/50 shrink-0" />Agenda Online (Básica)</li>
                <li className="flex items-start gap-3 text-gray-500 text-sm line-through"><CheckCircle2 size={18} className="shrink-0" />Lembretes WhatsApp</li>
                <li className="flex items-start gap-3 text-gray-500 text-sm line-through"><CheckCircle2 size={18} className="shrink-0" />Agente SDR de IA</li>
              </ul>
              <Link href="/register?plan=gratuito" className="w-full py-3 rounded-xl font-bold text-center text-white border border-white/20 hover:bg-white hover:text-black transition-all">
                Começar Grátis
              </Link>
            </div>

            {/* Plano Inicial */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 flex flex-col hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-black text-white mb-2">Inicial</h3>
              <p className="text-gray-400 text-sm mb-6 min-h-[40px]">O essencial para profissionalizar seu espaço.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">R$ 49</span>
                <span className="text-gray-500 font-medium text-sm">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Até 3 Barbeiros</li>
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Agenda e Comissões</li>
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Gestão Financeira</li>
                <li className="flex items-start gap-3 text-gray-500 text-sm line-through"><CheckCircle2 size={18} className="shrink-0" />Agente SDR de IA</li>
              </ul>
              <Link href="/register?plan=inicial" className="w-full py-3 rounded-xl font-bold text-center text-white border border-primary/50 hover:bg-primary/10 hover:border-primary transition-all">
                Assinar Inicial
              </Link>
            </div>

            {/* Plano Intermediário */}
            <div className="bg-[#111] p-8 rounded-3xl border border-primary/30 flex flex-col hover:border-primary transition-colors">
              <h3 className="text-xl font-black text-white mb-2">Intermediário</h3>
              <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Para barbearias com alto fluxo diário.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">R$ 99</span>
                <span className="text-gray-500 font-medium text-sm">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Barbeiros Ilimitados</li>
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Lembretes Automáticos (WPP)</li>
                <li className="flex items-start gap-3 text-gray-300 text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Programa de Fidelidade</li>
                <li className="flex items-start gap-3 text-gray-500 text-sm line-through"><CheckCircle2 size={18} className="shrink-0" />Agente SDR de IA</li>
              </ul>
              <Link href="/register?plan=intermediario" className="w-full py-3 rounded-xl font-bold text-center text-white bg-primary/20 hover:bg-primary hover:text-white transition-all border border-primary/50">
                Assinar Intermediário
              </Link>
            </div>

            {/* Plano VIP - HIGHLIGHTED */}
            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#111] p-8 rounded-3xl border-2 border-primary relative shadow-[0_0_40px_rgba(139,92,246,0.3)] transform lg:-translate-y-4 flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                <Bot size={14} /> MAIS VENDIDO
              </div>
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">VIP <Star size={16} className="text-yellow-400 fill-yellow-400"/></h3>
              <p className="text-primary-100 text-sm mb-6 min-h-[40px] font-medium">A experiência definitiva com Inteligência Artificial.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">R$ 199</span>
                <span className="text-gray-400 font-medium text-sm">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-white font-medium text-sm"><Bot size={18} className="text-primary shrink-0 animate-pulse" />Agente SDR Automatizado</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Agendamento via IA no WPP</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Tudo do plano Intermediário</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 size={18} className="text-primary shrink-0" />Múltiplas Filiais</li>
              </ul>
              <Link href="/register?plan=vip" className="w-full py-4 rounded-xl font-black text-center text-white bg-primary hover:bg-primary-hover hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                QUERO SER VIP
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#050505] border-t border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo_88barber.jpg" alt="88barber" width={150} height={40} className="h-10 w-auto object-contain mix-blend-lighten opacity-50 hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-gray-600 font-medium text-center text-sm">
            © {new Date().getFullYear()} 88barber. O futuro do agendamento chegou.
          </p>
          <div className="flex gap-6 font-medium text-sm">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Termos</a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
