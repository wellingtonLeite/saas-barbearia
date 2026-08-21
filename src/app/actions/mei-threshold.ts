"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export type MeiStatusLevel = "REGULAR" | "ATENCAO" | "ALERTA" | "CRITICO";

export interface BarberMeiStatus {
  barberId: string;
  barberName: string;
  avatarUrl?: string | null;
  accumulatedYear: number; // YTD
  thresholdLimit: number; // 81000
  percentageUsed: number;
  projectedYearEnd: number;
  willExceedLimit: boolean;
  statusLevel: MeiStatusLevel;
  statusBadge: {
    label: string;
    color: string;
  };
  recommendation: string;
}

export interface MeiThresholdResponse {
  success: boolean;
  year: number;
  thresholdLimit: number;
  barbers: BarberMeiStatus[];
  error?: string;
}

export async function getMeiThresholdAnalysis(): Promise<MeiThresholdResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Não autorizado");

    const userWithUnits = await db.user.findUnique({
      where: { id: userId },
      include: {
        units: {
          include: {
            unit: {
              include: {
                barbers: {
                  where: { is_active: true },
                  include: { barber: true },
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
      if (!tenant) throw new Error("Barbearia não encontrada");
      tenantId = tenant.id;
      const foundUnit = await db.unit.findFirst({
        where: { tenantId },
        include: {
          barbers: {
            where: { is_active: true },
            include: { barber: true },
          },
        },
      });
      if (foundUnit) {
        unit = foundUnit;
      }
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const dayOfYear = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const totalDaysInYear = 365;

    const MEI_LIMIT = 81000.0;

    // Buscar comissões de todos os barbeiros no ano corrente
    const [salesYear, appointmentsYear] = await Promise.all([
      db.sale.findMany({
        where: {
          tenantId,
          createdAt: { gte: startOfYear, lte: endOfYear },
        },
        select: { barberId: true, barber_commission: true },
      }),
      db.appointment.findMany({
        where: {
          tenantId,
          status: "COMPLETED",
          start_time: { gte: startOfYear, lte: endOfYear },
        },
        select: { barberId: true, barber_commission: true },
      }),
    ]);

    const activeBarbers = unit?.barbers || [];

    const barbersMei: BarberMeiStatus[] = activeBarbers.map((bUnit) => {
      const barber = bUnit.barber;

      // Somar comissões em vendas e agendamentos
      const salesComm = salesYear
        .filter((s) => s.barberId === barber.id)
        .reduce((acc, s) => acc + Number(s.barber_commission || 0), 0);

      const apptComm = appointmentsYear
        .filter((a) => a.barberId === barber.id)
        .reduce((acc, a) => acc + Number(a.barber_commission || 0), 0);

      const accumulatedYear = Math.max(salesComm, apptComm) || (salesComm + apptComm) / 2 || 0;

      const percentageUsed = Math.min(
        100,
        Math.round((accumulatedYear / MEI_LIMIT) * 100)
      );

      // Projeção para o final do ano: F_proj = YTD + (YTD / dias_decorridos) * dias_restantes
      const dailyAvg = accumulatedYear > 0 ? accumulatedYear / Math.max(1, dayOfYear) : 0;
      const projectedYearEnd = Math.round(dailyAvg * totalDaysInYear);
      const willExceedLimit = projectedYearEnd > MEI_LIMIT;

      let statusLevel: MeiStatusLevel = "REGULAR";
      let statusBadge = {
        label: "Regular (0%-69%)",
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      };
      let recommendation =
        "Operação segura. O faturamento está bem distribuído dentro do teto MEI.";

      if (percentageUsed >= 95 || accumulatedYear >= 76950) {
        statusLevel = "CRITICO";
        statusBadge = {
          label: "Crítico (≥95%)",
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        recommendation =
          "⚠️ Atingiu a zona crítica! Inicie a transição para Microempresa (ME / SLU) imediatamente para evitar autuação retroativa da Receita Federal.";
      } else if (percentageUsed >= 85 || accumulatedYear >= 68850) {
        statusLevel = "ALERTA";
        statusBadge = {
          label: "Alerta (85%-94%)",
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
        recommendation =
          "🔔 Projeção indica estouro do teto nos próximos meses. Consulte seu contador para planejamento de desenquadramento voluntário.";
      } else if (percentageUsed >= 70 || accumulatedYear >= 55890) {
        statusLevel = "ATENCAO";
        statusBadge = {
          label: "Atenção (70%-84%)",
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        };
        recommendation =
          "Faturamento anual ultrapassou 70% do teto. Mantenha acompanhamento mensal.";
      }

      return {
        barberId: barber.id,
        barberName: barber.name,
        avatarUrl: barber.avatar_url,
        accumulatedYear: Math.round(accumulatedYear),
        thresholdLimit: MEI_LIMIT,
        percentageUsed,
        projectedYearEnd,
        willExceedLimit,
        statusLevel,
        statusBadge,
        recommendation,
      };
    });

    return {
      success: true,
      year: currentYear,
      thresholdLimit: MEI_LIMIT,
      barbers: barbersMei,
    };
  } catch (error: any) {
    console.error("[getMeiThresholdAnalysis Error]", error);
    return {
      success: false,
      year: new Date().getFullYear(),
      thresholdLimit: 81000,
      barbers: [],
      error: error.message,
    };
  }
}
