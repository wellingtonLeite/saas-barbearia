"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export interface AntiChurnClient {
  clientId: string;
  clientName: string;
  clientPhone: string;
  averageCycleDays: number; // IMV_i
  daysSinceLastVisit: number;
  lastVisitDate: string;
  preferredBarberName: string;
  preferredBarberId?: string;
  totalCompletedVisits: number;
  averageTicket: number;
  riskLevel: "CRITICO" | "MODERADO" | "RECUPERADO";
  customMessage: string;
  lastContactedAt?: string | null;
}

export interface AntiChurnSummaryResponse {
  success: boolean;
  totalAtRisk: number;
  totalRecoveredMonth: number;
  estimatedRevenueAtRisk: number;
  rescuedRevenueMonth: number;
  clients: AntiChurnClient[];
  error?: string;
}

export async function getAntiChurnClients(): Promise<AntiChurnSummaryResponse> {
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
              include: { tenant: true },
            },
          },
        },
      },
    });

    let tenantId = userWithUnits?.units[0]?.unit?.tenantId;
    if (!tenantId) {
      const { getUserTenant } = await import("@/lib/tenant");
      const tenant = await getUserTenant(userId);
      if (!tenant) throw new Error("Barbearia não encontrada");
      tenantId = tenant.id;
    }

    // Buscar clientes que já tiveram agendamentos concluídos na barbearia
    const appointments = await db.appointment.findMany({
      where: {
        tenantId,
        status: { in: ["COMPLETED", "CONFIRMED", "PENDING"] },
      },
      include: {
        client: true,
        barber: true,
        service: true,
      },
      orderBy: { start_time: "asc" },
    });

    type ApptItem = typeof appointments[number];

    const now = new Date();

    // Agrupar agendamentos por cliente
    const clientMap = new Map<string, ApptItem[]>();
    appointments.forEach((appt) => {
      if (!appt.client) return;
      const cId = appt.client.id;
      if (!clientMap.has(cId)) {
        clientMap.set(cId, []);
      }
      clientMap.get(cId)?.push(appt);
    });

    const atRiskClients: AntiChurnClient[] = [];
    let totalRecoveredCount = 0;
    let rescuedRevenue = 0;
    let totalRiskRevenue = 0;

    for (const [, appts] of clientMap.entries()) {
      const client = appts[0].client;
      if (!client) continue;

      const completedAppts = appts
        .filter((a) => a.status === "COMPLETED")
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      // Se tiver pelo menos 2 visitas concluídas, podemos calcular o ciclo
      if (completedAppts.length >= 2) {
        // Calcular Intervalo Médio de Visita (IMV)
        let totalIntervalDays = 0;
        for (let i = 0; i < completedAppts.length - 1; i++) {
          const d1 = new Date(completedAppts[i].start_time).getTime();
          const d2 = new Date(completedAppts[i + 1].start_time).getTime();
          const diffDays = Math.max(1, (d2 - d1) / (1000 * 60 * 60 * 24));
          totalIntervalDays += diffDays;
        }

        const averageCycleDays = Math.max(
          7,
          Math.round(totalIntervalDays / (completedAppts.length - 1))
        );

        const lastCompleted = completedAppts[completedAppts.length - 1];
        const lastVisitDateObj = new Date(lastCompleted.start_time);
        const daysSinceLastVisit = Math.floor(
          (now.getTime() - lastVisitDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Verificar se o cliente tem agendamento futuro marcado
        const hasFutureAppt = appts.some(
          (a) =>
            (a.status === "CONFIRMED" || a.status === "PENDING") &&
            new Date(a.start_time) > now
        );

        // Identificar barbeiro preferido (mais frequente)
        const barberCounts: Record<string, { count: number; name: string; id: string }> = {};
        completedAppts.forEach((a) => {
          if (!a.barber) return;
          if (!barberCounts[a.barber.id]) {
            barberCounts[a.barber.id] = { count: 0, name: a.barber.name, id: a.barber.id };
          }
          barberCounts[a.barber.id].count += 1;
        });

        const sortedBarbers = Object.values(barberCounts).sort((a, b) => b.count - a.count);
        const preferredBarber = sortedBarbers[0]?.name || "Profissional da casa";
        const preferredBarberId = sortedBarbers[0]?.id;

        // Ticket médio do cliente
        const avgTicket =
          completedAppts.reduce((acc, a) => acc + Number(a.service?.price || 40), 0) /
          completedAppts.length;

        // Se tem agendamento futuro marcado, consideramos recuperado
        if (hasFutureAppt && daysSinceLastVisit > averageCycleDays) {
          totalRecoveredCount += 1;
          rescuedRevenue += avgTicket;
          continue;
        }

        // Gatilho de Churn: dias sem vir >= ciclo médio + 3 dias
        if (!hasFutureAppt && daysSinceLastVisit >= averageCycleDays + 3) {
          const isCritical = daysSinceLastVisit >= averageCycleDays * 1.8;
          totalRiskRevenue += avgTicket;

          const firstName = client.name.split(" ")[0];
          const customMessage = `Fala ${firstName}, tudo na paz, meu parceiro? 💈 Notei que já faz ${daysSinceLastVisit} dias do seu último corte com o ${preferredBarber}. Ele abriu horários hoje e amanhã. Quer que eu já reserve a sua cadeira?`;

          atRiskClients.push({
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone || "",
            averageCycleDays,
            daysSinceLastVisit,
            lastVisitDate: lastVisitDateObj.toLocaleDateString("pt-BR"),
            preferredBarberName: preferredBarber,
            preferredBarberId,
            totalCompletedVisits: completedAppts.length,
            averageTicket: Math.round(avgTicket),
            riskLevel: isCritical ? "CRITICO" : "MODERADO",
            customMessage,
          });
        }
      }
    }

    // Ordenar clientes pelo maior atraso
    atRiskClients.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);

    return {
      success: true,
      totalAtRisk: atRiskClients.length,
      totalRecoveredMonth: totalRecoveredCount,
      estimatedRevenueAtRisk: Math.round(totalRiskRevenue),
      rescuedRevenueMonth: Math.round(rescuedRevenue),
      clients: atRiskClients,
    };
  } catch (error: any) {
    console.error("[getAntiChurnClients Error]", error);
    return {
      success: false,
      totalAtRisk: 0,
      totalRecoveredMonth: 0,
      estimatedRevenueAtRisk: 0,
      rescuedRevenueMonth: 0,
      clients: [],
      error: error.message,
    };
  }
}

export async function sendAntiChurnWhatsApp(
  clientId: string,
  clientPhone: string,
  message: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Não autorizado");

    const userWithUnits = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        units: {
          include: { unit: { include: { tenant: true } } },
        },
      },
    });

    let unit = userWithUnits?.units[0]?.unit;
    let instance = unit?.tenant?.slug;
    if (!instance) {
      const { getUserTenant } = await import("@/lib/tenant");
      const tenant = await getUserTenant(session.user.id);
      instance = tenant?.slug || "ms-barber";
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    if (evolutionUrl && evolutionKey && clientPhone) {
      const cleanPhone = clientPhone.replace(/\D/g, "");
      await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
        method: "POST",
        headers: {
          apikey: evolutionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
        }),
      });
    }

    return { success: true, message: "Mensagem SDR enviada com sucesso!" };
  } catch (error: any) {
    console.error("[sendAntiChurnWhatsApp Error]", error);
    return { success: false, error: error.message };
  }
}
