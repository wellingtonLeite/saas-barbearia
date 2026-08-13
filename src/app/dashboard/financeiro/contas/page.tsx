import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { markAsPaid, deleteAccountEntry, createAccountEntry } from "@/app/actions/accounts";
import { getPlanFeatures } from "@/lib/plan-features";
import { UpgradeCard } from "@/components/UpgradeCard";

async function getTenantId(userId: string) {
  const barberUnit = await db.barberUnit.findFirst({
    where: { barberId: userId },
    include: { unit: true }
  });
  if (barberUnit) return barberUnit.unit.tenantId;
  const tenant = await db.tenant.findFirst();
  return tenant?.id;
}

export default async function ContasPage(props: { searchParams: Promise<{ aba?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const tenantId = await getTenantId(userId);
  if (!tenantId) return null;

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });

  const planFeatures = getPlanFeatures(tenant?.subscription?.plan);

  if (!planFeatures.hasAccountsPayable) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <Link href="/dashboard/financeiro" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar ao Financeiro
        </Link>
        <UpgradeCard requiredPlan="Máquina de Corte" featureName="Contas a Pagar e Receber" />
      </div>
    );
  }

  const aba = searchParams.aba === "receber" ? "RECEIVABLE" : "PAYABLE";

  const contas = await db.accountEntry.findMany({
    where: { tenantId, type: aba },
    orderBy: { due_date: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/financeiro" className="text-primary hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={16} /> Voltar ao Financeiro
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary">Contas a {aba === 'PAYABLE' ? 'Pagar' : 'Receber'}</h1>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Link 
          href="?aba=pagar" 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${aba === 'PAYABLE' ? 'bg-primary text-white' : 'bg-surface border border-secondary text-text-secondary hover:text-text-primary'}`}
        >
          A Pagar
        </Link>
        <Link 
          href="?aba=receber" 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${aba === 'RECEIVABLE' ? 'bg-primary text-white' : 'bg-surface border border-secondary text-text-secondary hover:text-text-primary'}`}
        >
          A Receber
        </Link>
      </div>

      <div className="bg-surface border border-secondary rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PlusCircle size={20} /> Nova Conta
        </h2>
        <form action={createAccountEntry} className="flex gap-4 flex-wrap items-end">
          <input type="hidden" name="type" value={aba} />
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-text-secondary mb-1">Descrição</label>
            <input name="description" required className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary" placeholder="Ex: Aluguel" />
          </div>
          
          <div className="w-32">
            <label className="block text-sm text-text-secondary mb-1">Valor (R$)</label>
            <input name="amount" type="number" step="0.01" required className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary" placeholder="0.00" />
          </div>

          <div className="w-40">
            <label className="block text-sm text-text-secondary mb-1">Vencimento</label>
            <input name="due_date" type="date" required className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary" />
          </div>

          <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium h-[42px]">
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-surface border border-secondary rounded-xl overflow-hidden">
        <div className="divide-y divide-secondary">
          {contas.length === 0 && (
            <div className="p-8 text-center text-text-secondary">Nenhuma conta encontrada.</div>
          )}
          {contas.map(conta => (
            <div key={conta.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors">
              <div>
                <p className="font-bold text-text-primary">{conta.description}</p>
                <p className="text-sm text-text-secondary">
                  Vencimento: {conta.due_date.toLocaleDateString('pt-BR')}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${
                  conta.status === 'PAID' ? 'bg-success/20 text-success' :
                  conta.status === 'OVERDUE' ? 'bg-error/20 text-error' :
                  'bg-warning/20 text-warning'
                }`}>
                  {conta.status === 'PAID' ? 'Pago' : conta.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <p className={`font-bold text-lg ${aba === 'PAYABLE' ? 'text-error' : 'text-success'}`}>
                  {formatCurrency(Number(conta.amount))}
                </p>
                
                <div className="flex items-center gap-2">
                  {conta.status !== 'PAID' && (
                    <form action={markAsPaid.bind(null, conta.id)}>
                      <button title="Marcar como Pago" className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors">
                        <CheckCircle2 size={20} />
                      </button>
                    </form>
                  )}
                  <form action={deleteAccountEntry.bind(null, conta.id)}>
                    <button title="Excluir" className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
