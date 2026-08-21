"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface BarberBreakEvenData {
  barberId: string;
  barberName: string;
  avatarUrl?: string | null;
  targetCount: number; // Q_breakeven
  currentCount: number; // Atendimentos no mês
  progressPercent: number; // min(100, (current / target) * 100)
  isProfitable: boolean;
  profitableAt?: string | null; // Data/hora em que atingiu break-even
  netProfitGenerated: number; // Lucro líquido gerado após atingir o break-even
  remainingAppointments: number;
  fixedCostShare: number; // CF_c
  marginPerService: number; // MC_s
}

export interface BreakEvenResponse {
  success: boolean;
  totalFixedExpenses: number;
  activeChairsCount: number;
  fixedCostPerChair: number;
  tenantTargetCount: number;
  tenantCurrentCount: number;
  tenantProgressPercent: number;
  tenantIsProfitable: boolean;
  barbers: BarberBreakEvenData[];
  month: number;
  year: number;
  configuredFixedCost?: number;
  error?: string;
}

export async function getBreakEvenAnalysis(): Promise<BreakEvenResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        totalFixedExpenses: 0,
        activeChairsCount: 0,
        fixedCostPerChair: 0,
        tenantTargetCount: 0,
        tenantCurrentCount: 0,
        tenantProgressPercent: 0,
        tenantIsProfitable: false,
        barbers: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        error: "Não autorizado",
      };
    }

    // Identificar tenant do usuário
    const userWithUnits = await db.user.findUnique({
      where: { id: userId },
      include: {
        units: {
          include: {
            unit: {
              include: {
                tenant: true,
                barbers: {
                  where: { is_active: true },
                  include: {
                    barber: {
                      include: {
                        contracts: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let unit = userWithUnits?.units[0]?.unit;
    let tenantId = unit?.tenantId;

    if (!tenantId || !unit) {
      const { getUserTenant } = await import("@/lib/tenant");
      const tenant = await getUserTenant(userId);
      if (!tenant) {
        return {
          success: false,
          totalFixedExpenses: 0,
          activeChairsCount: 0,
          fixedCostPerChair: 0,
          tenantTargetCount: 0,
          tenantCurrentCount: 0,
          tenantProgressPercent: 0,
          tenantIsProfitable: false,
          barbers: [],
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          error: "Barbearia não encontrada",
        };
      }
      tenantId = tenant.id;
      const foundUnit = await db.unit.findFirst({
        where: { tenantId },
        include: {
          tenant: true,
          barbers: {
            where: { is_active: true },
            include: {
              barber: {
                include: {
                  contracts: true,
                },
              },
            },
          },
        },
      });
      if (foundUnit) {
        unit = foundUnit;
      }
    }

    if (!tenantId) {
      return {
        success: false,
        totalFixedExpenses: 0,
        activeChairsCount: 0,
        fixedCostPerChair: 0,
        tenantTargetCount: 0,
        tenantCurrentCount: 0,
        tenantProgressPercent: 0,
        tenantIsProfitable: false,
        barbers: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        error: "Barbearia não encontrada",
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // 1. Obter registro do Tenant para verificar se possui fixed_cost_monthly configurado
    const tenantRecord = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { fixed_cost_monthly: true },
    });
    const tenantConfiguredFixedCost = Number(tenantRecord?.fixed_cost_monthly || 0);

    let totalFixedExpenses = 0;

    // Se o dono configurou explicitamente o custo fixo mensal nas configurações/modal (maior que 0), prioriza
    if (tenantConfiguredFixedCost > 0) {
      totalFixedExpenses = tenantConfiguredFixedCost;
    } else {
      // Caso contrário, buscar despesas operacionais fixas do mês em AccountEntry (PAYABLE)
      const fixedExpensesEntries = await db.accountEntry.findMany({
        where: {
          tenantId,
          type: "PAYABLE",
          due_date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      totalFixedExpenses = fixedExpensesEntries.reduce(
        (acc, curr) => acc + Number(curr.amount),
        0
      );

      // Se a barbearia ainda não cadastrou despesas no mês nem configurou fixed_cost, adota benchmark operacional padrão R$ 4.500,00
      if (totalFixedExpenses <= 0) {
        totalFixedExpenses = 4500;
      }
    }

    // 2. Barbeiros ativos (cadeiras operacionais)
    const activeBarbers = unit?.barbers || [];
    const activeChairsCount = Math.max(1, activeBarbers.length);

    // Custo Fixo Unitário por Cadeira (CF_c)
    const fixedCostPerChair = totalFixedExpenses / activeChairsCount;

    // 3. Buscar todos os agendamentos concluídos ou confirmados do mês
    const appointmentsMonth = await db.appointment.findMany({
      where: {
        tenantId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
        start_time: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        service: true,
        barber: true,
      },
      orderBy: { start_time: "asc" },
    });

    // 4. Preço médio dos serviços da barbearia
    const services = await db.service.findMany({
      where: { tenantId },
    });

    const avgServicePrice =
      services.length > 0
        ? services.reduce((acc, s) => acc + Number(s.price), 0) / services.length
        : 50.0;

    let tenantTotalCompleted = 0;
    let tenantTotalTarget = 0;

    const barbersData: BarberBreakEvenData[] = activeBarbers.map((bUnit) => {
      const barber = bUnit.barber;
      const contract = barber.contracts?.find((c) => c.unitId === unit?.id);

      // Comissão padrão de 50% caso não configurada
      const commissionRate = contract?.service_commission_rate
        ? Number(contract.service_commission_rate) / 100
        : 0.5;

      // Deduções: Imposto Simples Nacional (6%) + Taxas Gateway (4%) + Insumo direto por corte (R$ 2,00)
      const deductionRate = 0.10; // 10% de impostos e taxas
      const directSupplyCost = 2.0; // R$ 2,00 de descartáveis/insumos

      // Margem de Contribuição Líquida Retida pelo Salão (MC_s)
      const marginPerService = Math.max(
        5,
        avgServicePrice * (1 - commissionRate - deductionRate) - directSupplyCost
      );

      // Quantidade de atendimentos para atingir o Break-Even (Q_break-even)
      const targetCount = Math.ceil(fixedCostPerChair / marginPerService);

      // Agendamentos deste barbeiro no mês em ordem cronológica
      const barberAppts = appointmentsMonth.filter(
        (a) => a.barberId === barber.id
      );
      const currentCount = barberAppts.length;

      const progressPercent = Math.min(
        100,
        Math.round((currentCount / targetCount) * 100)
      );
      const isProfitable = currentCount >= targetCount;

      let profitableAt: string | null = null;
      if (isProfitable && barberAppts[targetCount - 1]) {
        const breakEvenAppt = barberAppts[targetCount - 1];
        profitableAt = new Date(breakEvenAppt.start_time).toLocaleDateString(
          "pt-BR",
          { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }
        );
      }

      const surplusCount = Math.max(0, currentCount - targetCount);
      const netProfitGenerated = surplusCount * marginPerService;
      const remainingAppointments = Math.max(0, targetCount - currentCount);

      tenantTotalCompleted += currentCount;
      tenantTotalTarget += targetCount;

      return {
        barberId: barber.id,
        barberName: barber.name,
        avatarUrl: barber.avatar_url,
        targetCount,
        currentCount,
        progressPercent,
        isProfitable,
        profitableAt,
        netProfitGenerated,
        remainingAppointments,
        fixedCostShare: fixedCostPerChair,
        marginPerService,
      };
    });

    if (barbersData.length === 0) {
      const defaultMargin = Math.max(5, avgServicePrice * (1 - 0.5 - 0.10) - 2.0);
      tenantTotalTarget = Math.ceil(totalFixedExpenses / defaultMargin);
      tenantTotalCompleted = appointmentsMonth.length;
    }

    const tenantProgressPercent =
      tenantTotalTarget > 0
        ? Math.min(100, Math.round((tenantTotalCompleted / tenantTotalTarget) * 100))
        : 0;

    return {
      success: true,
      totalFixedExpenses,
      activeChairsCount,
      fixedCostPerChair,
      tenantTargetCount: tenantTotalTarget,
      tenantCurrentCount: tenantTotalCompleted,
      tenantProgressPercent,
      tenantIsProfitable: tenantTotalCompleted >= tenantTotalTarget,
      barbers: barbersData,
      month: currentMonth,
      year: currentYear,
      configuredFixedCost: tenantConfiguredFixedCost,
    };
  } catch (error: any) {
    console.error("[getBreakEvenAnalysis Error]", error);
    return {
      success: false,
      totalFixedExpenses: 0,
      activeChairsCount: 0,
      fixedCostPerChair: 0,
      tenantTargetCount: 0,
      tenantCurrentCount: 0,
      tenantProgressPercent: 0,
      tenantIsProfitable: false,
      barbers: [],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      error: error.message,
    };
  }
}

export async function updateBreakEvenFixedCost(fixedCost: number): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Não autorizado" };

    const { getUserTenant } = await import("@/lib/tenant");
    const tenant = await getUserTenant(userId);
    if (!tenant) return { success: false, error: "Barbearia não encontrada" };

    const amount = Number(fixedCost);
    if (isNaN(amount) || amount < 0) {
      return { success: false, error: "Valor de custo fixo inválido" };
    }

    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        fixed_cost_monthly: amount,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/financeiro");
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar custo fixo mensal:", error);
    return { success: false, error: error.message || "Erro ao atualizar custo fixo" };
  }
}

// Alias para manter compatibilidade com componentes existentes
export async function updateMonthlyFixedCost(amount: number): Promise<{ success: boolean; error?: string }> {
  return updateBreakEvenFixedCost(amount);
}
