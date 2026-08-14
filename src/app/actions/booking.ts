"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBooking(data: {
  tenantId: string;
  unitId: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
}) {
  try {
    // 1. Procurar ou criar o cliente baseado no telefone (MVP simplification)
    // Num sistema real seria pelo telefone sanitizado
    let client = await db.user.findFirst({
      where: { phone: data.clientPhone, role: "CLIENT" }
    });

    if (!client) {
      client = await db.user.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          email: `${data.clientPhone}@temp.com`, // Email fake pro DB (MVP)
          password_hash: "NO_PASSWORD", // Cliente sem senha
          role: "CLIENT"
        }
      });
    }

    // 2. Montar as datas
    const [year, month, day] = data.date.split('-').map(Number);
    const [hours, minutes] = data.time.split(':').map(Number);
    
    const start_time = new Date(year, month - 1, day, hours, minutes);
    
    // Buscar a duração do serviço e valor
    const service = await db.service.findUnique({ where: { id: data.serviceId }});
    if (!service) return { error: "Serviço inválido" };

    const end_time = new Date(start_time.getTime() + service.duration_minutes * 60000);

    // Buscar a comissão configurada para este barbeiro (se houver)
    const barberUnit = await db.barberUnit.findFirst({
      where: { barberId: data.barberId, unitId: data.unitId }
    });
    
    // MVP: Assume 50% de comissão
    const commissionRate = 50; 
    const barber_commission = (Number(service.price) * commissionRate) / 100;

    // 3. Criar o agendamento
    const appointment = await db.appointment.create({
      data: {
        tenantId: data.tenantId,
        unitId: data.unitId,
        barberId: data.barberId,
        clientId: client.id,
        serviceId: data.serviceId,
        start_time,
        end_time,
        status: "PENDING",
        barber_commission // Seta o valor calculado
      }
    });

    // Buscar o Tenant para pegar o dono
    const tenant = await db.tenant.findUnique({ where: { id: data.tenantId } });
    
    // Notificar o barbeiro e os donos
    try {
      const usersToNotify = new Set<string>();
      usersToNotify.add(data.barberId);

      // Buscar donos da barbearia para notificar
      const owners = await db.user.findMany({
        where: {
          role: "OWNER",
          units: {
            some: {
              unit: {
                tenantId: data.tenantId
              }
            }
          }
        }
      });
      owners.forEach(owner => usersToNotify.add(owner.id));

      for (const userId of Array.from(usersToNotify)) {
        await db.notification.create({
          data: {
            userId: userId,
            tenantId: data.tenantId,
            type: "NEW_APPOINTMENT",
            title: "Novo Agendamento",
            message: `${client.name} agendou para ${start_time.toLocaleDateString('pt-BR')} às ${start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          }
        });
      }
    } catch (notifError) {
      console.warn("Notification creation failed (non-critical):", notifError);
    }

    // Revalidar rotas
    revalidatePath("/dashboard");
    revalidatePath(`/[slug]`, 'layout');
    
    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Booking Error:", msg);
    return { error: `Erro ao criar agendamento: ${msg}` };
  }
}
