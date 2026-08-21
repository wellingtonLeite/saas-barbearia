import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/sdr/book
 * Cria automaticamente o agendamento real na agenda da barbearia a partir da confirmação do SDR.
 * Aceita tanto IDs exatos quanto nomes amigáveis (barberName, serviceName, instance, etc).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { 
      instance, 
      slug, 
      unitId, 
      tenantId, 
      barberId, 
      barberName, 
      serviceId, 
      serviceName, 
      clientPhone, 
      clientName, 
      date, 
      time 
    } = body;

    const identifier = instance || slug || unitId || tenantId;
    if (!identifier) {
      return NextResponse.json(
        { error: "Identificador da barbearia é obrigatório (instance, slug ou unitId)" },
        { status: 400 }
      );
    }

    if (!clientPhone || !time) {
      return NextResponse.json(
        { error: "Telefone do cliente (clientPhone) e horário (time) são obrigatórios" },
        { status: 400 }
      );
    }

    // 1. Localizar Unidade e Barbearia (Tenant)
    const cleanDigits = identifier.replace(/\D/g, "");
    const unit = await db.unit.findFirst({
      where: {
        OR: [
          { id: identifier },
          { tenantId: identifier },
          { tenant: { slug: identifier } },
          { phone: identifier },
          cleanDigits ? { phone: { contains: cleanDigits } } : {},
        ].filter(Boolean) as any,
      },
      include: {
        tenant: {
          include: {
            services: true
          }
        },
        barbers: {
          include: {
            barber: true
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: `Barbearia não encontrada para: ${identifier}` },
        { status: 404 }
      );
    }

    // 2. Identificar o Barbeiro
    let selectedBarber: any = null;
    if (barberId) {
      const found = unit.barbers.find(b => b.barber.id === barberId);
      if (found) selectedBarber = found.barber;
    }

    if (!selectedBarber && barberName) {
      const term = barberName.toLowerCase().trim();
      const found = unit.barbers.find(b => 
        b.barber.name.toLowerCase().includes(term) ||
        term.includes(b.barber.name.toLowerCase())
      );
      if (found) selectedBarber = found.barber;
    }

    // Fallback: se nenhum barbeiro específico foi achado, usa o primeiro disponível da equipe
    if (!selectedBarber && unit.barbers.length > 0) {
      selectedBarber = unit.barbers[0].barber;
    }

    if (!selectedBarber) {
      return NextResponse.json(
        { error: "Nenhum profissional disponível encontrado na barbearia" },
        { status: 404 }
      );
    }

    // 3. Identificar o Serviço
    let selectedService: any = null;
    if (serviceId) {
      selectedService = unit.tenant.services.find(s => s.id === serviceId);
    }

    if (!selectedService && serviceName) {
      const term = serviceName.toLowerCase().trim();
      selectedService = unit.tenant.services.find(s => 
        s.name.toLowerCase().includes(term) ||
        term.includes(s.name.toLowerCase())
      );
    }

    // Fallback: se não achar serviço específico, pega o primeiro serviço cadastrado (ex: corte)
    if (!selectedService && unit.tenant.services.length > 0) {
      selectedService = unit.tenant.services[0];
    }

    if (!selectedService) {
      return NextResponse.json(
        { error: "Nenhum serviço cadastrado na barbearia" },
        { status: 404 }
      );
    }

    // 4. Localizar ou Criar o Cliente
    const cleanClientPhone = clientPhone.replace(/\D/g, "");
    let client = await db.user.findFirst({
      where: {
        OR: [
          { phone: cleanClientPhone },
          { phone: clientPhone },
          { email: `${cleanClientPhone}@temp.com` }
        ]
      }
    });

    if (!client) {
      client = await db.user.create({
        data: {
          name: clientName || "Cliente WhatsApp",
          phone: cleanClientPhone,
          email: `${cleanClientPhone}@temp.com`,
          role: "CLIENT",
          password_hash: "whatsapp_client_sdr_auto"
        }
      });
    } else if (clientName && client.name === "Cliente WhatsApp") {
      await db.user.update({
        where: { id: client.id },
        data: { name: clientName }
      });
    }

    // 5. Montar Data e Horário
    // Normalizar horário (ex: "10:15", "10h15", "10")
    const cleanTime = time.replace("h", ":").trim();
    const [hStr, mStr] = cleanTime.split(":");
    const hours = parseInt(hStr, 10) || 10;
    const minutes = parseInt(mStr, 10) || 0;

    // Normalizar data (formato YYYY-MM-DD ou data atual)
    let appointmentDate: Date;
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      appointmentDate = new Date(`${date}T00:00:00`);
    } else {
      appointmentDate = new Date();
    }

    const startTime = new Date(appointmentDate);
    startTime.setHours(hours, minutes, 0, 0);

    const duration = selectedService.duration_minutes || 30;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // 6. Verificar Conflito de Horário
    const conflict = await db.appointment.findFirst({
      where: {
        barberId: selectedBarber.id,
        unitId: unit.id,
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
        { 
          error: "O horário escolhido já está ocupado com este profissional.",
          conflict: true,
          barber: selectedBarber.name,
          time: cleanTime
        },
        { status: 409 }
      );
    }

    // 7. Criar Agendamento Oficial no Banco de Dados
    const appointment = await db.appointment.create({
      data: {
        clientId: client.id,
        barberId: selectedBarber.id,
        unitId: unit.id,
        serviceId: selectedService.id,
        tenantId: unit.tenantId,
        start_time: startTime,
        end_time: endTime,
        status: "CONFIRMED"
      },
      include: {
        barber: true,
        service: true,
        unit: true,
        tenant: true
      }
    });

    const dateStr = startTime.toLocaleDateString("pt-BR");
    const timeStr = startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // 8. Criar Notificações na tabela Notification (Barbeiro + Donos/Admins)
    try {
      const usersToNotify = new Set<string>();
      if (appointment.barberId) {
        usersToNotify.add(appointment.barberId);
      }

      const ownersAndAdmins = await db.user.findMany({
        where: {
          OR: [
            {
              role: "OWNER",
              units: {
                some: {
                  unit: {
                    tenantId: appointment.tenantId
                  }
                }
              }
            },
            {
              role: "SUPER_ADMIN"
            }
          ]
        },
        select: { id: true }
      });

      ownersAndAdmins.forEach(owner => usersToNotify.add(owner.id));

      const notificationTitle = "🚨 Novo Agendamento Recebido (SDR WhatsApp)!";
      const notificationMessage = `Cliente: ${client.name} | Serviço: ${appointment.service.name} | Barbeiro: ${appointment.barber.name} | Horário: ${dateStr} às ${timeStr}`;

      const notificationsData = Array.from(usersToNotify).map(userId => ({
        userId,
        tenantId: appointment.tenantId,
        type: "NEW_APPOINTMENT" as const,
        title: notificationTitle,
        message: notificationMessage,
        is_read: false
      }));

      if (notificationsData.length > 0) {
        await db.notification.createMany({
          data: notificationsData
        });
      }
    } catch (notifError) {
      console.warn("[SDR /book] Falha não-crítica ao criar notificações:", notifError);
    }

    // 8. Revalidar rotas do dashboard para atualização instantânea na tela
    try {
      revalidatePath("/dashboard");
      revalidatePath("/[slug]", "layout");
    } catch (revalError) {
      console.warn("[SDR /book] Revalidação não-crítica:", revalError);
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento criado com sucesso!",
      appointment: {
        id: appointment.id,
        clientName: client.name,
        clientPhone: client.phone,
        barberName: appointment.barber.name,
        serviceName: appointment.service.name,
        price: Number(appointment.service.price),
        date: dateStr,
        time: timeStr,
        unitName: appointment.unit.name,
        address: appointment.unit.address,
        status: appointment.status
      }
    });

  } catch (error: any) {
    console.error("[SDR /book Error]", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar agendamento", details: error.message },
      { status: 500 }
    );
  }
}
