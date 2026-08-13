import { db } from "@/lib/db";
import { PaymentSettingsForm } from "./PaymentSettingsForm";
import { CreditCard } from "lucide-react";

export default async function PagamentosPage() {
  const config = await db.gatewayConfig.findUnique({
    where: { gateway: "MERCADO_PAGO" }
  });

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações de Pagamento</h1>
        <p className="text-slate-400">Configure as integrações de pagamento do sistema.</p>
      </div>

      <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Mercado Pago</h2>
            <p className="text-slate-400 text-sm">Configure sua chave de acesso para receber pagamentos.</p>
          </div>
        </div>
        
        <PaymentSettingsForm initialData={config} />
      </div>
    </div>
  );
}
