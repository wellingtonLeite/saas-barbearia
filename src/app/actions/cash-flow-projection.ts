"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export interface DailyProjectionPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "25/Ago"
  projectedInflow: number;
  projectedOutflow: number;
  netChange: number;
  projectedBalance: number;
  isNegative: boolean;
  notes: string[];
}

export interface CashFlowAlert {
  date: string;
  projectedDeficit: number;
  reason: string;
  suggestedAction: string;
}

export interface CashFlowProjectionResponse {
  success: boolean;
  currentBalance: number;
  periods: {
    days30: {
      endBalance: number;
      totalInflow: number;
      totalOutflow: number;
      points: DailyProjectionPoint[];
    };
    days60: {
      endBalance: number;
      totalInflow: number;
      totalOutflow: number;
      points: DailyProjectionPoint[];
    };
    days90: {
      endBalance: number;
      totalInflow: number;
      totalOutflow: number;
      points: DailyProjectionPoint[];
    };
  };
  alerts: CashFlowAlert[];
  vipSubscriptionsMonthly: number;
  averageDailyRevenue: number;
  error?: string;
}

export async function getCashFlowProjection(): Promise<CashFlowProjectionResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Não autorizado");
    }

    const userWithUnits = await db.user.findUnique({
      where: { id: userId },
      include: {
        units: {
          include: {
            unit: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });

    const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
    if (!tenantId) {
      throw new Error("Barbearia não encontrada");
    }

    // 1. Saldo de caixa atual estimado (Receitas passadas - Despesas pagas)
    const [salesHistory, paidExpenses, pendingPayables, futureAppointments, vipSubscriptions] =
      await Promise.all([
        db.sale.findMany({
          where: { tenantId },
          select: { total_amount: true, barber_commission: true },
        }),
        db.accountEntry.findMany({
          where: { tenantId, type: "PAYABLE", status: "PAID" },
          select: { amount: true },
        }),
        db.accountEntry.findMany({
          where: { tenantId, type: "PAYABLE", status: "PENDING" },
          select: { amount: true, due_date: true, description: true },
        }),
        db.appointment.findMany({
          where: {
            tenantId,
            status: { in: ["PENDING", "CONFIRMED"] },
            start_time: { gte: new Date() },
          },
          include: { service: true },
        }),
        db.clientSubscription.findMany({
          where: {
            client: {
              client_appointments: {
                some: { tenantId },
              },
            },
            status: "ACTIVE",
          },
          include: { plan: true },
        }),
      ]);

    const totalRetainedSales = salesHistory.reduce(
      (acc, s) => acc + (Number(s.total_amount) - Number(s.barber_commission)),
      0
    );
    const totalPaidExp = paidExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

    // Saldo atual de partida
    let startingBalance = Math.max(1500, totalRetainedSales - totalPaidExp);

    // Média diária de receita dos últimos 30 dias (Walk-ins & avulsos)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent30dSales = await db.sale.findMany({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
    });

    const totalRecent30d = recent30dSales.reduce(
      (acc, s) => acc + Number(s.total_amount),
      0
    );
    const averageDailyRevenue = Math.max(150, totalRecent30d / 30);

    // Receita recorrente mensal de assinaturas VIP de clientes
    const vipSubscriptionsMonthly = vipSubscriptions.reduce(
      (acc, sub) => acc + Number(sub.plan?.price || 0),
      0
    );
    const vipDailyInflow = vipSubscriptionsMonthly / 30;

    // 2. Projetar os próximos 90 dias
    const allPoints: DailyProjectionPoint[] = [];
    const alerts: CashFlowAlert[] = [];

    let runningBalance = startingBalance;
    const today = new Date();

    for (let dayIndex = 1; dayIndex <= 90; dayIndex++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayIndex);

      const dateStr = targetDate.toISOString().split("T")[0];
      const dayLabel = targetDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });

      // Entradas do dia:
      // a) Agendamentos marcados para este dia
      const apptsOnDay = futureAppointments.filter((a) => {
        const aDate = new Date(a.start_time).toISOString().split("T")[0];
        return aDate === dateStr;
      });

      const apptInflow = apptsOnDay.reduce(
        (acc, a) => acc + Number(a.service?.price || 0),
        0
      );

      // b) Média de clientes avulsos + fração de assinatura VIP
      const estimatedWalkInInflow = apptsOnDay.length > 0 ? 0 : averageDailyRevenue * 0.7;
      const dailyInflow = Math.round(apptInflow + estimatedWalkInInflow + vipDailyInflow);

      // Saídas do dia:
      // a) Contas a pagar com vencimento no dia
      const payablesOnDay = pendingPayables.filter((p) => {
        const pDate = new Date(p.due_date).toISOString().split("T")[0];
        return pDate === dateStr;
      });

      const billsOutflow = payablesOnDay.reduce(
        (acc, p) => acc + Number(p.amount),
        0
      );

      // b) Repasse estimado de comissão (50% das entradas) + custo operacional
      const commissionOutflow = dailyInflow * 0.5;
      const dailyOutflow = Math.round(billsOutflow + commissionOutflow);

      const netChange = dailyInflow - dailyOutflow;
      runningBalance += netChange;

      const isNegative = runningBalance < 0;

      const notes: string[] = [];
      if (payablesOnDay.length > 0) {
        notes.push(
          `Vencimento de ${payablesOnDay.length} conta(s): ${payablesOnDay
            .map((p) => p.description)
            .join(", ")}`
        );
      }
      if (apptsOnDay.length > 0) {
        notes.push(`${apptsOnDay.length} agendamento(s) confirmado(s)`);
      }

      if (isNegative && alerts.length < 3) {
        alerts.push({
          date: dayLabel,
          projectedDeficit: Math.abs(runningBalance),
          reason: `Concentração de pagamentos (${payablesOnDay.map((p) => p.description).join(", ") || "Despesas acumuladas"})`,
          suggestedAction:
            "Lançar Campanha Relâmpago de Recorrência VIP via SDR WhatsApp com desconto antecipado.",
        });
      }

      allPoints.push({
        date: dateStr,
        dayLabel,
        projectedInflow: dailyInflow,
        projectedOutflow: dailyOutflow,
        netChange,
        projectedBalance: Math.round(runningBalance),
        isNegative,
        notes,
      });
    }

    const points30 = allPoints.slice(0, 30);
    const points60 = allPoints.slice(0, 60);
    const points90 = allPoints.slice(0, 90);

    return {
      success: true,
      currentBalance: Math.round(startingBalance),
      periods: {
        days30: {
          endBalance: points30[29]?.projectedBalance || 0,
          totalInflow: points30.reduce((acc, p) => acc + p.projectedInflow, 0),
          totalOutflow: points30.reduce((acc, p) => acc + p.projectedOutflow, 0),
          points: points30,
        },
        days60: {
          endBalance: points60[59]?.projectedBalance || 0,
          totalInflow: points60.reduce((acc, p) => acc + p.projectedInflow, 0),
          totalOutflow: points60.reduce((acc, p) => acc + p.projectedOutflow, 0),
          points: points60,
        },
        days90: {
          endBalance: points90[89]?.projectedBalance || 0,
          totalInflow: points90.reduce((acc, p) => acc + p.projectedInflow, 0),
          totalOutflow: points90.reduce((acc, p) => acc + p.projectedOutflow, 0),
          points: points90,
        },
      },
      alerts,
      vipSubscriptionsMonthly: Math.round(vipSubscriptionsMonthly),
      averageDailyRevenue: Math.round(averageDailyRevenue),
    };
  } catch (error: any) {
    console.error("[getCashFlowProjection Error]", error);
    return {
      success: false,
      currentBalance: 0,
      periods: {
        days30: { endBalance: 0, totalInflow: 0, totalOutflow: 0, points: [] },
        days60: { endBalance: 0, totalInflow: 0, totalOutflow: 0, points: [] },
        days90: { endBalance: 0, totalInflow: 0, totalOutflow: 0, points: [] },
      },
      alerts: [],
      vipSubscriptionsMonthly: 0,
      averageDailyRevenue: 0,
      error: error.message,
    };
  }
}
