const fs = require('fs');

const pricingSection = 
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
              <p className="text-slate-400 text-sm mb-6 h-10">Para barbearias em crescimento.</p>
              <div className="text-4xl font-display font-bold text-white mb-8">R$ 89<span className="text-lg text-slate-500">,90/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Até 15 Barbeiros</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Gestão Financeira Completa</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Comandas, PDV e Estoque</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-success shrink-0" size={20} /> Lembretes WhatsApp Manuais</li>
                <li className="flex gap-3 text-sm opacity-40"><CheckCircle2 className="text-white/10 shrink-0" size={20} /> Sem Agente IA Automático</li>
              </ul>
              <Link href="/register" className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-center hover:bg-white/20 transition-colors">Assinar Barber Pro</Link>
            </div>

            {/* BARBER VIP - DESTAQUE */}
            <div className="bg-[#15151a] border border-primary/50 rounded-3xl p-8 flex flex-col relative transform lg:-translate-y-4 shadow-[0_0_50px_-15px_rgba(139,92,246,0.3)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1">
                <Zap size={14} /> Mais Assinado
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-primary">Barber VIP</h3>
              <p className="text-slate-400 text-sm mb-6 h-10">O sistema completo + Inteligência Artificial.</p>
              <div className="text-4xl font-display font-bold text-white mb-8">R$ 189<span className="text-lg text-slate-500">,90/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <li className="flex gap-3 text-sm font-bold text-white"><Bot className="text-primary shrink-0" size={20} /> Agente SDR (IA WhatsApp)</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Até 50 Barbeiros</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Até 4 Unidades (Filiais)</li>
                <li className="flex gap-3 text-sm"><CheckCircle2 className="text-primary shrink-0" size={20} /> Todos os recursos do app</li>
              </ul>
              <Link href="/register" className="w-full py-4 rounded-xl bg-primary text-white font-bold text-center hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25">Liberar Acesso VIP</Link>
            </div>

          </div>
        </div>
      </section>
;

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the start of PRICING section and the end of it (before FAQ section)
const startIdx = code.indexOf('{/* PRICING */}');
const endIdx = code.indexOf('{/* FAQ */}');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + pricingSection + code.substring(endIdx);
  fs.writeFileSync('src/app/page.tsx', code);
} else {
  console.log("Could not find sections");
}
