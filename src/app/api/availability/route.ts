import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    const unitId = searchParams.get("unitId");
    const serviceId = searchParams.get("serviceId");

    if (!dateStr || !barberId || !unitId || !serviceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay().toString(); // "0" a "6"

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const contract = await db.barberContract.findUnique({
      where: { barberId_unitId: { barberId, unitId } }
    });

    const unit = await db.unit.findUnique({ where: { id: unitId } });

    // Padrão de funcionamento (se não houver Json)
    const defaultHours = { active: true, start: "09:00", "end": "18:00" };
    
    const unitHoursRaw = unit?.working_hours as any;
    const barberHoursRaw = contract?.working_hours as any;

    const unitDayHours = unitHoursRaw && unitHoursRaw[dayOfWeek] ? unitHoursRaw[dayOfWeek] : defaultHours;
    const barberDayHours = barberHoursRaw && barberHoursRaw[dayOfWeek] ? barberHoursRaw[dayOfWeek] : defaultHours;

    // Se a unidade ou o barbeiro estiverem fechados neste dia
    if (unitDayHours.active === false || barberDayHours.active === false) {
      return NextResponse.json({ availableTimes: [] });
    }

    // Definir horário de início e fim cruzando o mais restritivo
    const startStr = unitDayHours.start > barberDayHours.start ? unitDayHours.start : barberDayHours.start;
    const endStr = unitDayHours.end < barberDayHours.end ? unitDayHours.end : barberDayHours.end;

    // Obter agendamentos do dia
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await db.appointment.findMany({
      where: {
        barberId,
        unitId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        start_time: { gte: date, lt: nextDay }
      }
    });

    // Obter bloqueios do dia
    const blocks = await db.scheduleBlock.findMany({
      where: {
        barberId,
        unitId,
        start_time: { lt: nextDay },
        end_time: { gt: date }
      }
    });

    // Gerar slots a cada 30 minutos
    const availableTimes = [];
    let currentSlot = new Date(`${dateStr}T${startStr}:00`);
    const endTime = new Date(`${dateStr}T${endStr}:00`);
    const durationMs = service.duration_minutes * 60 * 1000;

    const now = new Date();

    while (currentSlot.getTime() + durationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + durationMs);
      
      // Ignorar horários passados
      if (currentSlot > now) {
        // Checar se conflita com agendamentos
        const hasAppointmentConflict = appointments.some(app => {
          return (currentSlot < app.end_time && slotEnd > app.start_time);
        });

        // Checar se conflita com bloqueios
        const hasBlockConflict = blocks.some(block => {
          return (currentSlot < block.end_time && slotEnd > block.start_time);
        });

        // Checar conflito com almoço
        let hasLunchConflict = false;
        if (barberDayHours.lunch_active && barberDayHours.lunch_start && barberDayHours.lunch_end) {
          const lunchStart = new Date(`${dateStr}T${barberDayHours.lunch_start}:00`);
          const lunchEnd = new Date(`${dateStr}T${barberDayHours.lunch_end}:00`);
          hasLunchConflict = (currentSlot < lunchEnd && slotEnd > lunchStart);
        }

        if (!hasAppointmentConflict && !hasBlockConflict && !hasLunchConflict) {
          availableTimes.push(currentSlot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        }
      }
      
      // Incrementar 30 min (intervalo padrão)
      currentSlot = new Date(currentSlot.getTime() + 30 * 60 * 1000);
    }

    return NextResponse.json({ availableTimes });
  } catch (error) {
    console.error("Availability API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
