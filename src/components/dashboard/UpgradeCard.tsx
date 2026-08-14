import { Lock } from 'lucide-react';
import Link from 'next/link';

export function UpgradeCard({ requiredPlan, featureName }: { requiredPlan: string; featureName: string }) {
  return (
    <div className="bg-surface border border-secondary rounded-2xl p-12 flex flex-col items-center justify-center text-center animate-fade-in shadow-xl shadow-black/20">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
        <Lock size={32} className="text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-3">Funcionalidade do {requiredPlan}</h3>
      <p className="text-text-secondary mb-8 max-w-md mx-auto text-lg leading-relaxed">
        {featureName} está disponível a partir do <strong>{requiredPlan}</strong>. Faça upgrade para desbloquear esta e outras funcionalidades exclusivas.
      </p>
      <Link href="/dashboard/assinatura" className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/20">
        Ver Planos e Fazer Upgrade
      </Link>
    </div>
  );
}
