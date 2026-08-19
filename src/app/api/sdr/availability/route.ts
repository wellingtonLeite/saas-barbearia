import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function authSDR(request: Request) {
  const key = request.headers.get("x-sdr-key");
  const expected = process.env.SDR_INTERNAL_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/sdr/availability?unitId=&barberId=&serviceId=&date=YYYY-MM-DD
 * Retorna os horários disponíveis — wrapper do endpoint existente com auth SDR.
 */
export async function GET(request: Request) {
  const authError = authSDR(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    const unitId = searchParams.get("unitId");
    const serviceId = searchParams.get("serviceId");

    if (!dateStr || !barberId || !unitId || !serviceId) {
      return NextResponse.json({ error: "Missing required parameters: unitId, barberId, serviceId, date" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay().toString();

    const [service, contract, unit] = await Promise.all([
      db.service.findUnique({ where: { id: serviceId } }),
      db.barberContract.findUnique({ where: { barberId_unitId: { barberId, unitId } } }),
      db.unit.findUnique({ where: { id: unitId } })
    ]);

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const defaultHours = { active: true, start: "09:00", end: "18:00" };
    const unitHoursRaw = unit?.working_hours as any;
    const barberHoursRaw = contract?.working_hours as any;
    const unitDayHours = unitHoursRaw?.[dayOfWeek] ?? defaultHours;
    const barberDayHours = barberHoursRaw?.[dayOfWeek] ?? defaultHours;

    if (unitDayHours.active === false || barberDayHours.active === false) {
      return NextResponse.json({ availableTimes: [], message: "Fechado neste dia" });
    }

    const startStr = unitDayHours.start > barberDayHours.start ? unitDayHours.start : barberDayHours.start;
    const endStr = unitDayHours.end < barberDayHours.end ? unitDayHours.end : barberDayHours.end;

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const [appointments, blocks] = await Promise.all([
      db.appointment.findMany({
        where: {
          barberId, unitId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          start_time: { gte: date, lt: nextDay }
        }
      }),
      db.scheduleBlock.findMany({
        where: { barberId, unitId, start_time: { lt: nextDay }, end_time: { gt: date } }
      })
    ]);

    const availableTimes: string[] = [];
    let currentSlot = new Date(`${dateStr}T${startStr}:00`);
    const endTime = new Date(`${dateStr}T${endStr}:00`);
    const durationMs = service.duration_minutes * 60 * 1000;
    const now = new Date();

    while (currentSlot.getTime() + durationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + durationMs);

      if (currentSlot > now) {
        const hasConflict =
          appointments.some(a => currentSlot < a.end_time && slotEnd > a.start_time) ||
          blocks.some(b => currentSlot < b.end_time && slotEnd > b.start_time);

        let hasLunchConflict = false;
        if (barberDayHours.lunch_active && barberDayHours.lunch_start && barberDayHours.lunch_end) {
          const lunchStart = new Date(`${dateStr}T${barberDayHours.lunch_start}:00`);
          const lunchEnd = new Date(`${dateStr}T${barberDayHours.lunch_end}:00`);
          hasLunchConflict = currentSlot < lunchEnd && slotEnd > lunchStart;
        }

        if (!hasConflict && !hasLunchConflict) {
          availableTimes.push(currentSlot.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
        }
      }

      currentSlot = new Date(currentSlot.getTime() + 30 * 60 * 1000);
    }

    return NextResponse.json({ availableTimes, date: dateStr, barberId, serviceId });
  } catch (error) {
    console.error("[SDR /availability]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
