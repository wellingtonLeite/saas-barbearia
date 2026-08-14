import type { Plan } from '@/generated/prisma/client';

export type PlanFeatures = {
  hasBasicFinancial: boolean; // Extrato simples (todos com has_financial_module)
  hasAccountsPayable: boolean; // Contas a pagar/receber (Máquina de Corte+)
  hasCommissionReport: boolean; // Relatório de comissões (Máquina de Corte+)
  hasStockAlerts: boolean; // Alertas de estoque mínimo (Máquina de Corte+)
  hasGrowthDashboard: boolean; // Dashboard modo CEO (Tesoura de Ouro)
  hasDRE: boolean; // DRE (Tesoura de Ouro)
  hasCashFlowChart: boolean; // Gráfico fluxo de caixa (Tesoura de Ouro)
  hasExportReports: boolean; // Exportação CSV/PDF (Tesoura de Ouro)
  hasWhatsapp: boolean; // Botões WhatsApp (Máquina de Corte+)
};

export function getPlanFeatures(plan: Plan | null | undefined): PlanFeatures {
  // Navalha = max_barbers: 2
  // Máquina de Corte = max_barbers: 10
  // Tesoura de Ouro = max_barbers: 50
  // Franquia = max_barbers: 9999
  const maxBarbers = plan?.max_barbers ?? 0;
  const isMaquina = maxBarbers >= 10;
  const isOuro = maxBarbers >= 50;

  return {
    hasBasicFinancial: plan?.has_financial_module ?? false,
    hasAccountsPayable: isMaquina,
    hasCommissionReport: isMaquina,
    hasStockAlerts: isMaquina,
    hasGrowthDashboard: isOuro,
    hasDRE: isOuro,
    hasCashFlowChart: isOuro,
    hasExportReports: isOuro,
    hasWhatsapp: plan?.has_whatsapp ?? false,
  };
}
