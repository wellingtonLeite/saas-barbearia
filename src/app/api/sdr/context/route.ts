import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper para obter datas no fuso horário do Brasil (America/Sao_Paulo)
function getBrazilDates() {
  const now = new Date();
  const dateStrFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const displayFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const todayDateStr = dateStrFormatter.format(now); // "YYYY-MM-DD"
  const todayDisplay = displayFormatter.format(now); // "DD/MM/YYYY"

  const [y, m, d] = todayDateStr.split("-").map(Number);

  // Amanhã
  const tomorrowObj = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  const tomorrowDateStr = dateStrFormatter.format(tomorrowObj);
  const tomorrowDisplay = displayFormatter.format(tomorrowObj);

  // Limite para busca no banco (depois de amanhã)
  const dayAfterObj = new Date(Date.UTC(y, m - 1, d + 2, 12, 0, 0));
  const dayAfterDateStr = dateStrFormatter.format(dayAfterObj);

  return {
    now,
    todayDateStr,
    todayDisplay,
    tomorrowDateStr,
    tomorrowDisplay,
    dayAfterDateStr,
  };
}

interface CalculateSlotsParams {
  barberId: string;
  barberName: string;
  dateStr: string; // "YYYY-MM-DD"
  isToday: boolean;
  unitHoursRaw: any;
  barberHoursRaw: any;
  appointments: Array<{ barberId: string; start_time: Date; end_time: Date }>;
  blocks: Array<{ barberId: string; start_time: Date; end_time: Date }>;
  now: Date;
  slotDurationMinutes?: number;
  slotStepMinutes?: number;
}

function calculateBarberSlots({
  barberId,
  barberName,
  dateStr,
  isToday,
  unitHoursRaw,
  barberHoursRaw,
  appointments,
  blocks,
  now,
  slotDurationMinutes = 30,
  slotStepMinutes = 30,
}: CalculateSlotsParams): { barberId: string; barberName: string; slots: string[]; statusText: string } {
  // Obter dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayDate = new Date(y, m - 1, d);
  const dayOfWeek = dayDate.getDay().toString();

  const defaultHours = { active: true, start: "09:00", end: "20:00" };

  const unitDayHours =
    unitHoursRaw && typeof unitHoursRaw === "object" && unitHoursRaw[dayOfWeek]
      ? unitHoursRaw[dayOfWeek]
      : defaultHours;

  const barberDayHours =
    barberHoursRaw && typeof barberHoursRaw === "object" && barberHoursRaw[dayOfWeek]
      ? barberHoursRaw[dayOfWeek]
      : unitDayHours;

  // Se a unidade ou o profissional não estiverem ativos neste dia da semana
  if (unitDayHours.active === false || barberDayHours.active === false) {
    return {
      barberId,
      barberName,
      slots: [],
      statusText: "Folga / Fechado",
    };
  }

  // Interseção dos horários mais restritivos
  const startStr =
    unitDayHours.start && barberDayHours.start
      ? unitDayHours.start > barberDayHours.start
        ? unitDayHours.start
        : barberDayHours.start
      : barberDayHours.start || unitDayHours.start || "09:00";

  const endStr =
    unitDayHours.end && barberDayHours.end
      ? unitDayHours.end < barberDayHours.end
        ? unitDayHours.end
        : barberDayHours.end
      : barberDayHours.end || unitDayHours.end || "20:00";

  const barberApps = appointments.filter((a) => a.barberId === barberId);
  const barberBlocks = blocks.filter((b) => b.barberId === barberId);

  const durationMs = slotDurationMinutes * 60 * 1000;
  const stepMs = slotStepMinutes * 60 * 1000;

  let currentSlot = new Date(`${dateStr}T${startStr}:00`);
  const endTime = new Date(`${dateStr}T${endStr}:00`);

  const availableSlots: string[] = [];

  while (currentSlot.getTime() + durationMs <= endTime.getTime()) {
    const slotEnd = new Date(currentSlot.getTime() + durationMs);

    // Para hoje: apenas horários futuros (com margem de 5 min para evitar agendamento em cima da hora)
    const isFuture = !isToday || currentSlot.getTime() > now.getTime() + 5 * 60 * 1000;

    if (isFuture) {
      // Checar conflitos com agendamentos existentes
      const hasAppConflict = barberApps.some((a) => {
        const aStart = new Date(a.start_time).getTime();
        const aEnd = new Date(a.end_time).getTime();
        return currentSlot.getTime() < aEnd && slotEnd.getTime() > aStart;
      });

      // Checar conflitos com bloqueios de agenda
      const hasBlockConflict = barberBlocks.some((b) => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        return currentSlot.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      // Checar intervalo de almoço do barbeiro
      let hasLunchConflict = false;
      if (barberDayHours.lunch_active && barberDayHours.lunch_start && barberDayHours.lunch_end) {
        const lunchStart = new Date(`${dateStr}T${barberDayHours.lunch_start}:00`).getTime();
        const lunchEnd = new Date(`${dateStr}T${barberDayHours.lunch_end}:00`).getTime();
        hasLunchConflict = currentSlot.getTime() < lunchEnd && slotEnd.getTime() > lunchStart;
      }

      // Checar intervalo de almoço da unidade
      let hasUnitLunchConflict = false;
      if (unitDayHours.lunch_active && unitDayHours.lunch_start && unitDayHours.lunch_end) {
        const uLunchStart = new Date(`${dateStr}T${unitDayHours.lunch_start}:00`).getTime();
        const uLunchEnd = new Date(`${dateStr}T${unitDayHours.lunch_end}:00`).getTime();
        hasUnitLunchConflict = currentSlot.getTime() < uLunchEnd && slotEnd.getTime() > uLunchStart;
      }

      if (!hasAppConflict && !hasBlockConflict && !hasLunchConflict && !hasUnitLunchConflict) {
        const hours = String(currentSlot.getHours()).padStart(2, "0");
        const minutes = String(currentSlot.getMinutes()).padStart(2, "0");
        availableSlots.push(`${hours}:${minutes}`);
      }
    }

    currentSlot = new Date(currentSlot.getTime() + stepMs);
  }

  const statusText =
    availableSlots.length > 0
      ? availableSlots.join(", ")
      : isToday
      ? "Sem horários livres para hoje"
      : "Sem horários livres";

  return {
    barberId,
    barberName,
    slots: availableSlots,
    statusText,
  };
}

/**
 * GET /api/sdr/context?instance={instanceName}&phone={whatsappPhone}
 * Retorna o contexto completo e formatado da barbearia a partir da instância ou telefone.
 * O n8n chama isso ao receber uma mensagem para alimentar o Agente IA (Groq/LLaMA).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instance = searchParams.get("instance")?.trim();
    const phone = searchParams.get("phone")?.trim();

    const searchTerm = instance || phone;

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Parâmetro 'instance' ou 'phone' é obrigatório" },
        { status: 400 }
      );
    }

    // Limpar números para busca
    const cleanDigits = searchTerm.replace(/\D/g, "");

    // Busca a unidade ou tenant pelo nome da instância, slug ou telefone
    const unit = await db.unit.findFirst({
      where: {
        OR: [
          { phone: searchTerm },
          cleanDigits ? { phone: { contains: cleanDigits } } : {},
          { id: searchTerm },
          { tenant: { slug: searchTerm } },
          { tenantId: searchTerm },
        ].filter(Boolean) as any,
      },
      include: {
        contracts: true, // Contratos com horários específicos por barbeiro
        tenant: {
          include: {
            subscription: { include: { plan: true } },
            services: {
              select: { id: true, name: true, price: true, duration_minutes: true }
            }
          }
        },
        barbers: {
          where: { is_active: true }, // Apenas barbeiros com switcher ATIVO
          include: {
            barber: {
              select: { id: true, name: true, avatar_url: true }
            }
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: `Nenhuma barbearia encontrada para o identificador: ${searchTerm}` },
        { status: 404 }
      );
    }

    // Verifica estritamente se o plano da barbearia tem o SDR habilitado
    const plan = unit.tenant.subscription?.plan as any;
    if (!plan || !plan.has_whatsapp_sdr) {
      return NextResponse.json(
        { 
          active: false,
          allow_ai: false,
          error: "O plano atual desta barbearia é Gratuito e não inclui o Agente IA SDR. Agendamentos automáticos por IA estão desativados.",
          plan: plan?.name || "Plano Gratuito"
        },
        { status: 403 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://88barber.top";
    const bookingUrl = `${appUrl}/${unit.tenant.slug}/agendar`;
    
    // Lista apenas os barbeiros ativos
    const barbersList = unit.barbers
      .map((b: any) => b.barber.name)
      .filter(Boolean)
      .join(", ") || "Profissionais da casa";

    const servicesList = unit.tenant.services
      .map((s: any) => `• ${s.name}: R$ ${Number(s.price).toFixed(2)} (${s.duration_minutes} min)`)
      .join("\n") || "• Corte Tradicional: R$ 40,00\n• Barba Terapia: R$ 30,00";

    const workingHours = unit.working_hours 
      ? (typeof unit.working_hours === 'string' ? unit.working_hours : JSON.stringify(unit.working_hours))
      : "Segunda a Sábado, das 09:00 às 20:00";

    // 1. Obter datas de Hoje e Amanhã
    const {
      now,
      todayDateStr,
      todayDisplay,
      tomorrowDateStr,
      tomorrowDisplay,
      dayAfterDateStr,
    } = getBrazilDates();

    const rangeStart = new Date(`${todayDateStr}T00:00:00`);
    const rangeEnd = new Date(`${dayAfterDateStr}T23:59:59`);

    // 2. Buscar agendamentos e bloqueios em lote para hoje e amanhã
    const [appointments, blocks] = await Promise.all([
      db.appointment.findMany({
        where: {
          unitId: unit.id,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          start_time: { gte: rangeStart, lte: rangeEnd },
        },
        select: {
          barberId: true,
          start_time: true,
          end_time: true,
          status: true,
        },
      }),
      db.scheduleBlock.findMany({
        where: {
          unitId: unit.id,
          start_time: { lte: rangeEnd },
          end_time: { gte: rangeStart },
        },
        select: {
          barberId: true,
          start_time: true,
          end_time: true,
        },
      }),
    ]);

    // 3. Calcular horários livres para cada barbeiro ativo (Hoje e Amanhã)
    const activeBarbers = unit.barbers.map((b: any) => b.barber).filter(Boolean);

    const todayBarberSlots = activeBarbers.map((barber: any) => {
      const contract = unit.contracts?.find((c: any) => c.barberId === barber.id);
      return calculateBarberSlots({
        barberId: barber.id,
        barberName: barber.name,
        dateStr: todayDateStr,
        isToday: true,
        unitHoursRaw: unit.working_hours,
        barberHoursRaw: contract?.working_hours,
        appointments,
        blocks,
        now,
      });
    });

    const tomorrowBarberSlots = activeBarbers.map((barber: any) => {
      const contract = unit.contracts?.find((c: any) => c.barberId === barber.id);
      return calculateBarberSlots({
        barberId: barber.id,
        barberName: barber.name,
        dateStr: tomorrowDateStr,
        isToday: false,
        unitHoursRaw: unit.working_hours,
        barberHoursRaw: contract?.working_hours,
        appointments,
        blocks,
        now,
      });
    });

    // 4. Formatar seção de horários livres em tempo real
    const todayTextLines = todayBarberSlots.length > 0
      ? todayBarberSlots.map((s) => `- ${s.barberName}: ${s.statusText}`).join("\n")
      : "- Nenhum profissional disponível hoje";

    const tomorrowTextLines = tomorrowBarberSlots.length > 0
      ? tomorrowBarberSlots.map((s) => `- ${s.barberName}: ${s.statusText}`).join("\n")
      : "- Nenhum profissional disponível amanhã";

    const realTimeSlotsFormatted = `
HORÁRIOS LIVRES DISPONÍVEIS EM TEMPO REAL:
📅 HOJE (${todayDisplay}):
${todayTextLines}

📅 AMANHÃ (${tomorrowDisplay}):
${tomorrowTextLines}
`.trim();

    // 5. Contexto textual formatado para injeção direta no System Message do n8n / Groq
    const formattedContext = `
========================================
BARBEARIA: ${unit.tenant.name} (${unit.name})
========================================
Endereço: ${unit.address || "Consulte endereço no link de agendamento"}
Telefone / WhatsApp: ${unit.phone || searchTerm}
Horário de Atendimento: ${workingHours}

PROFISSIONAIS / BARBEIROS DISPONÍVEIS:
${barbersList}

SERVIÇOS E TABELA DE PREÇOS:
${servicesList}

${realTimeSlotsFormatted}

LINK OFICIAL DE AGENDAMENTO:
${bookingUrl}
========================================
`.trim();

    return NextResponse.json({
      data: {
        context: formattedContext,
        unit: {
          id: unit.id,
          name: unit.name,
          tenantId: unit.tenantId,
          tenantName: unit.tenant.name,
          slug: unit.tenant.slug,
          address: unit.address,
          phone: unit.phone,
        },
        services: unit.tenant.services,
        barbers: unit.barbers.map((b: any) => ({
          id: b.barber.id,
          name: b.barber.name,
          image: b.barber.avatar_url
        })),
        realtimeAvailability: {
          today: {
            date: todayDateStr,
            display: todayDisplay,
            barbers: todayBarberSlots,
          },
          tomorrow: {
            date: tomorrowDateStr,
            display: tomorrowDisplay,
            barbers: tomorrowBarberSlots,
          },
        },
        bookingUrl
      },
      context: formattedContext
    });
  } catch (error: any) {
    console.error("[SDR /context]", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
