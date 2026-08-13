import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UpgradeCard } from "@/components/dashboard/UpgradeCard";
import { Download, FileText } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: { units: { include: { unit: true } } }
  });
  
  const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
  if (!tenantId) redirect("/dashboard");

  const tenant = await db.tenant.findUnique({ 
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });
  
  const plan = tenant?.subscription?.plan;
  const isOuro = (plan?.max_barbers ?? 0) >= 50;

  if (!isOuro) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <UpgradeCard requiredPlan="Tesoura de Ouro" featureName="Exportação de Relatórios Avançados" />
      </div>
    );
  }

  const reports = [
    { id: "faturamento", title: "Faturamento por Período", description: "Exporta as vendas (Sales) realizadas num intervalo." },
    { id: "comissoes", title: "Comissões por Barbeiro", description: "Exporta os valores devidos de comissão." },
    { id: "atendimentos", title: "Atendimentos por Cliente", description: "Exporta todos os agendamentos concluídos." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3 mb-2">
          <FileText className="text-primary" size={32} />
          Relatórios
        </h1>
        <p className="text-text-secondary">Baixe relatórios gerenciais em formato CSV para análise no Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-surface border border-secondary rounded-2xl p-6 shadow-xl shadow-black/10 flex flex-col h-full">
            <h3 className="text-xl font-bold text-text-primary mb-2">{report.title}</h3>
            <p className="text-text-secondary mb-6 flex-1">{report.description}</p>
            
            <form action={`/api/reports/${report.id}`} method="GET" className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input type="date" name="start" required className="bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary w-full outline-none focus:border-primary text-sm" />
                <input type="date" name="end" required className="bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary w-full outline-none focus:border-primary text-sm" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 font-bold px-4 py-2 rounded-xl hover:bg-primary hover:text-background transition-all">
                <Download size={18} />
                Baixar CSV
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
