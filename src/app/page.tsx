import Link from 'next/link';
import { CheckCircle2, MessageSquare, CalendarDays, DollarSign, Users, Package, Smartphone, Scissors, ChevronRight, Star, ArrowRight, Bot, Zap, Compass, CalendarCheck } from 'lucide-react';

export const metadata = {
  title: '88barber | Sistema de Gestão e IA para Barbearias',
  description: 'O SaaS de gestão definitiva para barbearias. Agende clientes automaticamente via IA no WhatsApp, gerencie finanças, comandas e equipe.',
  keywords: ['sistema para barbearia', 'agendamento whatsapp', 'inteligência artificial', 'gestão de barbearia', 'PDV barbearia', 'SDR automação'],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-primary/30 selection:text-white">
      {/* HEADER */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Scissors className="text-white" size={20} />
            </div>
            <span className="text-white font-display font-bold text-2xl tracking-tight">88barber</span>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/explorar" className="text-white hover:text-primary transition-colors flex items-center gap-1.5 font-semibold bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full">
              <Compass size={15} className="text-primary" /> Encontrar Barbearias
            </Link>
            <Link href="/meus-agendamentos" className="hover:text-white transition-colors flex items-center gap-1.5">
              <CalendarCheck size={15} /> Meus Agendamentos
            </Link>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center mt-12 md:mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 mb-8">
            <SparklesIcon /> Novo: Agente IA de Agendamento pelo WhatsApp liberado!
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight mb-8 leading-tight">
            Sua barbearia no <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">piloto automático.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            O 88barber não é apenas uma agenda. É um ecossistema completo onde um <strong>Agente SDR com Inteligência Artificial</strong> atende seus clientes no WhatsApp 24h por dia, enquanto o sistema cuida do financeiro, das comissões e das comandas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]">
              Começar Teste Grátis <ArrowRight size={20} />
            </Link>
            <a href="#como-funciona" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors border border-white/10">
              Entender a Tecnologia
            </a>
          </div>
        </div>
      </main>

      {/* FEATURES - THE 'WHY' */}
      <section id="recursos" className="py-24 bg-[#0f0f13] border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Tudo que o dono de barbearia precisa.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Substitua cadernos, planilhas e o estresse de responder clientes fora do horário por um sistema inteligente e centralizado.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Bot className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Agente SDR (WhatsApp IA)</h3>
              <p className="text-slate-400 leading-relaxed">
                Nossa IA conversa com seus clientes, apresenta os cortes, checa a disponibilidade no banco de dados e agenda o horário diretamente no sistema. Sem intervenção humana.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Controle Financeiro Profissional</h3>
              <p className="text-slate-400 leading-relaxed">
                Extrato em tempo real, contas a pagar e receber, fluxo de caixa e DRE (Demonstrativo de Resultados). Saiba exatamente quanto sua barbearia lucrou no mês.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Equipe e Comissões</h3>
              <p className="text-slate-400 leading-relaxed">
                Cadastre seus barbeiros e defina taxas de comissão por serviço. O sistema calcula automaticamente o pagamento de cada profissional no final do dia.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <Package className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Comandas e Estoque</h3>
              <p className="text-slate-400 leading-relaxed">
                Ponto de Venda (PDV) integrado. Adicione pomadas, cervejas e cortes numa mesma comanda. O estoque é atualizado e o caixa registra a venda instantaneamente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <Star className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fidelidade e Retenção</h3>
              <p className="text-slate-400 leading-relaxed">
                Crie programas de fidelidade, veja o histórico de cortes de cada cliente e identifique quais são seus clientes VIPs para aplicar estratégias de retenção.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#15151a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Link de Agendamento Web</h3>
              <p className="text-slate-400 leading-relaxed">
                Além do WhatsApp, você ganha um link exclusivo da sua barbearia para colocar na bio do Instagram. Seus clientes agendam sozinhos por uma tela elegante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Como o Agente IA (SDR) trabalha para você.</h2>
              <p className="text-slate-400 text-lg mb-8">
                Nossa arquitetura foi desenhada para que você tenha a tecnologia de grandes corporações na palma da mão. Não é um bot de botões chatos, é inteligência real.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">O cliente manda mensagem</h4>
                    <p className="text-slate-400">"Teria horário hoje a tarde pro corte militar?"</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">A IA consulta o seu banco de dados</h4>
                    <p className="text-slate-400">Em milissegundos, nossa IA cruza as agendas de todos os seus barbeiros cadastrados no sistema 88barber.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Atendimento Humanizado</h4>
                    <p className="text-slate-400">Ela responde: "Temos sim! O João tem vaga às 15h e o Marcos às 16h30. Qual você prefere?" e já reserva direto na agenda.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 bg-[#15151a] p-2 rounded-3xl border border-white/10 shadow-2xl relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-20"></div>
              <div className="bg-[#0a0a0a] rounded-2xl p-6 relative">
                {/* Mockup Chat */}
                <div className="space-y-4 text-sm">
                  <div className="bg-[#202c33] text-[#e9edef] p-3 rounded-xl rounded-tr-none max-w-[80%] ml-auto">
                    Opa, consegue cortar meu cabelo hj as 18h?
                  </div>
                  <div className="bg-[#202c33] text-[#e9edef] p-3 rounded-xl rounded-tl-none max-w-[80%] border border-primary/30">
                    <div className="flex items-center gap-2 mb-1 text-primary text-xs font-bold"><Bot size={12}/> IA da Barbearia</div>
                    Olá! As 18h já estamos lotados, mas tenho vaga às 18:30 com o Carlos e às 19:00 com o Pedro. Qual fica melhor para você?
                  </div>
                  <div className="bg-[#202c33] text-[#e9edef] p-3 rounded-xl rounded-tr-none max-w-[80%] ml-auto">
                    Pode ser as 18:30 com o Carlos!
                  </div>
                  <div className="bg-[#202c33] text-[#e9edef] p-3 rounded-xl rounded-tl-none max-w-[80%] border border-primary/30">
                    <div className="flex items-center gap-2 mb-1 text-primary text-xs font-bold"><Bot size={12}/> IA da Barbearia</div>
                    Tudo certo! ✅ Agendamento confirmado para hoje às 18:30 com o barbeiro Carlos. O serviço é o Corte de Cabelo. Te esperamos!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-24 bg-[#0f0f13] border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Planos que escalam com você.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Desde a cadeira única até redes de barbearia. Escolha o plano perfeito.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* PLANO GRATUITO */}
            <div className="bg-[#15151a] border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Gratuito</h3>
              <p className="text-slate-400 text-sm mb-6 h-10">O essencial para quem está começando.</p>
              <div className="text-4xl font-display font-bold text-white mb-8">R$ 0<span className="text-lg text-slate-500">/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-white/30 shrink-0" size={20} /> 1 Barbeiro</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-white/30 shrink-0" size={20} /> 1 Unidade</li>
                <li className="flex gap-3 text-sm opacity-40"><CheckCircle2 className="text-white/10 shrink-0" size={20} /> Sem Financeiro / PDV</li>
                <li className="flex gap-3 text-sm opacity-40"><CheckCircle2 className="text-white/10 shrink-0" size={20} /> Sem WhatsApp IA</li>
              </ul>
              <Link href="/register" className="w-full py-3 rounded-xl border border-white/10 font-bold text-center hover:bg-white/5 transition-colors">Testar Grátis</Link>
            </div>

            {/* BARBER PRO */}
            <div className="bg-[#15151a] border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Barber Pro</h3>
              <p className="text-slate-400 text-sm mb-6 h-10">Para barbearias em crescimento com IA no WhatsApp.</p>
              <div className="text-4xl font-display font-bold text-white mb-8">R$ 89<span className="text-lg text-slate-500">,90/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm font-bold text-emerald-400"><Bot className="text-emerald-400 shrink-0" size={20} /> Agente SDR (IA WhatsApp) Incluso</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Até 15 Barbeiros</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Gestão Financeira Completa</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Comandas, PDV e Estoque</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Relatórios e Comissões</li>
              </ul>
              <Link href="/register" className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-center hover:bg-white/20 transition-colors">Assinar Barber Pro</Link>
            </div>

            {/* BARBER VIP - DESTAQUE */}
            <div className="bg-[#15151a] border border-primary/50 rounded-3xl p-8 flex flex-col relative transform lg:-translate-y-4 shadow-[0_0_50px_-15px_rgba(139,92,246,0.3)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1">
                <Zap size={14} /> Mais Completo
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-primary">Barber VIP</h3>
              <p className="text-slate-400 text-sm mb-6 h-10">Escala máxima para redes e barbearias de alto fluxo.</p>
              <div className="text-4xl font-display font-bold text-white mb-8">R$ 189<span className="text-lg text-slate-500">,90/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <li className="flex gap-3 text-sm font-bold text-white"><Bot className="text-primary shrink-0" size={20} /> Agente SDR (IA WhatsApp Prioritário)</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Até 50 Barbeiros</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Multi-Unidades (Filiais)</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Programa de Fidelidade e VIP</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Suporte Prioritário 24/7</li>
              </ul>
              <Link href="/register" className="w-full py-3 rounded-xl bg-primary text-white font-bold text-center hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">Assinar Barber VIP</Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-[#15151a] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-2">Preciso de um número novo de WhatsApp para o robô?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Não! Nossa integração conecta direto no seu número atual da barbearia (usando leitura de QR Code, como no WhatsApp Web). Ele lê as mensagens e assume o agendamento automaticamente.</p>
            </div>
            <div className="bg-[#15151a] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-2">Como o sistema controla o dinheiro e comissões?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Sempre que um serviço é finalizado no caixa, o sistema deduz a taxa (se houver) e joga a comissão exata na carteira do barbeiro, e o lucro no extrato da Barbearia. Transparência total.</p>
            </div>
            <div className="bg-[#15151a] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-2">Posso testar antes de pagar?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Sim. Temos o plano gratuito (sem limite de tempo) para uso básico com 1 barbeiro. Para destravar o Agente IA e recursos de equipe, basta fazer o upgrade via Mercado Pago a qualquer momento no seu painel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Scissors size={18} />
            <span className="font-display font-bold text-white">88barber SaaS</span>
          </div>
          <p>© {new Date().getFullYear()} 88barber. O sistema definitivo para barbearias e clientes.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/explorar" className="hover:text-white transition-colors">Encontrar Barbearias</Link>
            <Link href="/meus-agendamentos" className="hover:text-white transition-colors">Meus Agendamentos</Link>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  );
}