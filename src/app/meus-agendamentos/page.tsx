import CustomerHeader from "@/components/CustomerHeader";
import MeusAgendamentosClient from "@/components/MeusAgendamentosClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Agendamentos | 88barber",
  description: "Acompanhe seus horários agendados, histórico de atendimentos e avalie seus cortes no 88barber.",
  keywords: ["meus agendamentos", "consultar horário barbearia", "cancelar agendamento", "88barber"],
};

export const dynamic = "force-dynamic";

export default function MeusAgendamentosPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/30 selection:text-white">
      <CustomerHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <MeusAgendamentosClient />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0c] py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} 88barber. Portal de Experiência do Cliente.</p>
          <div className="flex gap-4">
            <a href="/explorar" className="hover:text-white transition-colors">Explorar Barbearias</a>
            <a href="/login" className="hover:text-white transition-colors">Painel da Barbearia</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
