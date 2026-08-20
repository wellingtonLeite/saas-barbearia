"use server";

import { db } from "@/lib/db";

export interface SerializedClientAppointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  start_time: string;
  end_time: string;
  createdAt: string;
  barber_commission: number;
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  unit: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
  barber: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  review: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export interface SearchAppointmentsResult {
  success: boolean;
  error?: string;
  appointments?: SerializedClientAppointment[];
}

export async function searchClientAppointments(identifier: string): Promise<SearchAppointmentsResult> {
  if (!identifier || identifier.trim().length < 3) {
    return { success: false, error: "Informe um telefone (WhatsApp) ou e-mail válido para consultar." };
  }

  const query = identifier.trim();
  const digitsOnly = query.replace(/\D/g, "");

  try {
    // Monta as condições flexíveis de busca para encontrar o usuário
    const userOrConditions: Array<{ phone?: { contains: string } | { equals: string }; email?: { contains: string; mode?: "insensitive" } | { equals: string; mode?: "insensitive" } }> = [];

    if (query.includes("@")) {
      userOrConditions.push({ email: { equals: query, mode: "insensitive" } });
    }

    if (digitsOnly.length >= 8) {
      // Telefone exato ou parcial
      userOrConditions.push({ phone: { contains: digitsOnly } });
      // Email gerado automaticamente pelo sistema (ex: 11999999999@temp.com)
      userOrConditions.push({ email: { contains: digitsOnly } });
    }

    // Busca literal pelo que o usuário digitou
    userOrConditions.push({ phone: { contains: query } });
    userOrConditions.push({ email: { contains: query, mode: "insensitive" } });

    // Localiza os usuários correspondentes
    const matchingUsers = await db.user.findMany({
      where: {
        OR: userOrConditions
      },
      select: { id: true, name: true, phone: true, email: true }
    });

    const userIds = matchingUsers.map(u => u.id);

    if (userIds.length === 0) {
      return { success: true, appointments: [] };
    }

    // Busca os agendamentos vinculados a estes IDs de cliente
    const appointments = await db.appointment.findMany({
      where: {
        clientId: { in: userIds }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        barber: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_minutes: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true
          }
        }
      },
      orderBy: {
        start_time: "desc"
      }
    });

    // Serializa os dados para o Client Component
    const serialized: SerializedClientAppointment[] = appointments.map(appt => ({
      id: appt.id,
      status: appt.status as SerializedClientAppointment["status"],
      start_time: appt.start_time.toISOString(),
      end_time: appt.end_time.toISOString(),
      createdAt: appt.createdAt.toISOString(),
      barber_commission: Number(appt.barber_commission),
      tenant: appt.tenant,
      unit: appt.unit,
      barber: appt.barber,
      service: {
        ...appt.service,
        price: Number(appt.service.price)
      },
      review: appt.review
    }));

    return { success: true, appointments: serialized };
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    return { success: false, error: "Ocorreu um erro ao carregar os agendamentos. Tente novamente." };
  }
}
