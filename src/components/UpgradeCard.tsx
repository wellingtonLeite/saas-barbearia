import { Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeCardProps {
  requiredPlan: string;
  featureName: string;
}

export function UpgradeCard({ requiredPlan, featureName }: UpgradeCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-secondary rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      
      <div className="h-16 w-16 bg-background border border-secondary rounded-full flex items-center justify-center mb-6 relative z-10">
        <Lock className="w-8 h-8 text-text-secondary" />
      </div>
      
      <h3 className="text-xl font-semibold text-text-primary mb-2 relative z-10">
        Funcionalidade do plano {requiredPlan}
      </h3>
      <p className="text-text-secondary mb-8 max-w-md relative z-10">
        Faça upgrade para desbloquear {featureName} e aproveitar todos os recursos para gerenciar sua barbearia.
      </p>
      
      <Link 
        href="/dashboard/assinatura" 
        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors relative z-10"
      >
        Ver Planos
      </Link>
    </div>
  );
}
