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
 * POST /api/sdr/book
 * Cria um agendamento a partir do agente SDR.
 * Body: { unitId, barberId, serviceId, clientPhone, clientName, date, time }
 */
export async function POST(request: Request) {
  const authError = authSDR(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { unitId, barberId, serviceId, clientPhone, clientName, date, time } = body;

    if (!unitId || !barberId || !serviceId || !clientPhone || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields: unitId, barberId, serviceId, clientPhone, date, time" },
        { status: 400 }
      );
    }

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: { tenant: true }
    });
    if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

    // Busca ou cria o cliente pelo telefone
    let client = await db.user.findFirst({
      where: { phone: clientPhone, role: "CLIENT" }
    });

    if (!client) {
      client = await db.user.create({
        data: {
          phone: clientPhone,
          name: clientName || "Cliente WhatsApp",
          role: "CLIENT",
          email: `whatsapp_${clientPhone}@88barber.app`,
        }
      });
    }

    // Montar data/hora do agendamento
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(`${date}T00:00:00`);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + service.duration_minutes * 60 * 1000);

    // Verificar se o horário ainda está disponível (evitar duplo agendamento)
    const conflict = await db.appointment.findFirst({
      where: {
        barberId,
        unitId,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        OR: [
          { start_time: { gte: startTime, lt: endTime } },
          { end_time: { gt: startTime, lte: endTime } },
          { start_time: { lte: startTime }, end_time: { gte: endTime } }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Horário não disponível — já foi reservado", conflict: true },
        { status: 409 }
      );
    }

    // Criar o agendamento
    const appointment = await db.appointment.create({
      data: {
        clientId: client.id,
        barberId,
        unitId,
        serviceId,
        tenantId: unit.tenantId,
        start_time: startTime,
        end_time: endTime,
        status: "CONFIRMED",
        notes: `Agendado pelo Agente SDR via WhatsApp (${clientPhone})`
      },
      include: {
        service: { select: { name: true, price: true } },
        barber: { select: { name: true } },
        unit: { select: { name: true, address: true } }
      }
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        clientName: client.name,
        clientPhone,
        service: appointment.service.name,
        barber: appointment.barber.name,
        unit: appointment.unit.name,
        address: appointment.unit.address,
        date,
        time,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error("[SDR /book]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
