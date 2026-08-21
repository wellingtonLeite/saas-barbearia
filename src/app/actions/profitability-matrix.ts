"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export type BCGClassification = "ESTRELA" | "VACA_LEITEIRA" | "INTERROGACAO" | "ABACAXI";

export interface ServiceProfitabilityData {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  completedCount: number;
  netMargin: number; // Margem líquida retida pelo salão (R$)
  profitPerMinute: number; // R$/minuto
  profitPerHour: number; // R$/hora
  classification: BCGClassification;
  recommendation: string;
  badgeColor: string;
}

export interface ProfitabilityMatrixResponse {
  success: boolean;
  services: ServiceProfitabilityData[];
  overallAvgProfitPerHour: number;
  mostProfitableService?: ServiceProfitabilityData;
  leastProfitableService?: ServiceProfitabilityData;
  error?: string;
}

export async function getProfitabilityMatrix(): Promise<ProfitabilityMatrixResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Não autorizado");

    const userWithUnits = await db.user.findUnique({
      where: { id: userId },
      include: {
        units: {
          include: { unit: true },
        },
      },
    });

    const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
    if (!tenantId) throw new Error("Barbearia não encontrada");

    // Buscar serviços da barbearia
    const services = await db.service.findMany({
      where: { tenantId },
      include: {
        appointments: {
          where: { status: "COMPLETED" },
          select: { id: true, barber_commission: true },
        },
      },
    });

    if (services.length === 0) {
      return {
        success: true,
        services: [],
        overallAvgProfitPerHour: 0,
      };
    }

    // Calcular estatísticas de demanda
    const totalAppointments = services.reduce(
      (acc, s) => acc + s.appointments.length,
      0
    );
    const avgAppointmentsPerService = Math.max(
      1,
      totalAppointments / services.length
    );

    const calculatedServices: ServiceProfitabilityData[] = services.map((s) => {
      const price = Number(s.price);
      const duration = Math.max(15, s.duration_minutes || 30);
      const count = s.appointments.length;

      // Estimativa de comissão (50% padrão se não especificado)
      const commission = price * 0.5;
      const taxesAndFees = price * 0.10; // 10% (Simples 6% + Gateway 4%)
      const directSupplies = 2.0; // R$ 2,00 por atendimento

      const netMargin = Math.max(1, price - commission - taxesAndFees - directSupplies);
      const profitPerMinute = netMargin / duration;
      const profitPerHour = Math.round(profitPerMinute * 60 * 100) / 100;

      return {
        id: s.id,
        name: s.name,
        price,
        durationMinutes: duration,
        completedCount: count,
        netMargin: Math.round(netMargin * 100) / 100,
        profitPerMinute: Math.round(profitPerMinute * 100) / 100,
        profitPerHour,
        classification: "VACA_LEITEIRA", // será ajustado abaixo
        recommendation: "",
        badgeColor: "",
      };
    });

    // Média de lucro por hora de todos os serviços
    const avgProfitPerHour =
      calculatedServices.reduce((acc, s) => acc + s.profitPerHour, 0) /
      calculatedServices.length;

    // Classificar cada serviço na Matriz BCG
    const classifiedServices = calculatedServices.map((s) => {
      const isHighProfit = s.profitPerHour >= avgProfitPerHour;
      const isHighDemand = s.completedCount >= avgAppointmentsPerService;

      let classification: BCGClassification = "VACA_LEITEIRA";
      let recommendation = "";
      let badgeColor = "";

      if (isHighProfit && isHighDemand) {
        classification = "ESTRELA";
        recommendation =
          "🌟 Carro-chefe lucrativo! Priorize este serviço nos destaques do WhatsApp e ofereça como primeira opção.";
        badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      } else if (!isHighProfit && isHighDemand) {
        classification = "VACA_LEITEIRA";
        recommendation =
          "🐮 Alto volume com margem moderada. Considere reajustar o preço em +R$ 5 a R$ 10 ou reduzir a duração em 5 min.";
        badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
      } else if (isHighProfit && !isHighDemand) {
        classification = "INTERROGACAO";
        recommendation =
          "❓ Altíssima margem horária, mas pouca procura. Promova em combos com corte tradicional e treine a equipe no cross-sell.";
        badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
      } else {
        classification = "ABACAXI";
        recommendation =
          "🍍 Baixo retorno por hora e pouca procura. Reestruture o procedimento, aumente o preço ou substitua por outro mais ágil.";
        badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
      }

      return {
        ...s,
        classification,
        recommendation,
        badgeColor,
      };
    });

    classifiedServices.sort((a, b) => b.profitPerHour - a.profitPerHour);

    return {
      success: true,
      services: classifiedServices,
      overallAvgProfitPerHour: Math.round(avgProfitPerHour * 100) / 100,
      mostProfitableService: classifiedServices[0],
      leastProfitableService: classifiedServices[classifiedServices.length - 1],
    };
  } catch (error: any) {
    console.error("[getProfitabilityMatrix Error]", error);
    return {
      success: false,
      services: [],
      overallAvgProfitPerHour: 0,
      error: error.message,
    };
  }
}
