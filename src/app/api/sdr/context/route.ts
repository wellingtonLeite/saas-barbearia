import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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
        tenant: {
          include: {
            subscription: { include: { plan: true } },
            services: {
              select: { id: true, name: true, price: true, duration_minutes: true }
            }
          }
        },
        barbers: {
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

    // Verifica se o plano da barbearia tem o SDR habilitado
    const plan = unit.tenant.subscription?.plan as any;
    if (plan && !plan.has_whatsapp_sdr) {
      return NextResponse.json(
        { error: "O plano atual da barbearia não inclui o Agente SDR" },
        { status: 403 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://88barber.top";
    const bookingUrl = `${appUrl}/${unit.tenant.slug}/agendar`;
    const barbersList = unit.barbers.map((b: any) => b.barber.name).filter(Boolean).join(", ") || "Profissionais da casa";
    const servicesList = unit.tenant.services
      .map((s: any) => `• ${s.name}: R$ ${Number(s.price).toFixed(2)} (${s.duration_minutes} min)`)
      .join("\n") || "• Corte Tradicional: R$ 40,00\n• Barba Terapia: R$ 30,00";

    const workingHours = unit.working_hours 
      ? (typeof unit.working_hours === 'string' ? unit.working_hours : JSON.stringify(unit.working_hours))
      : "Segunda a Sábado, das 09:00 às 20:00";

    // Contexto textual formatado para injeção direta no System Message do n8n / Groq
    const formattedContext = `
========================================
BARBEARIA: ${unit.tenant.name} (${unit.name})
========================================
Endereço: ${unit.address || "Consulte endereço no link de agendamento"}
Telefone / WhatsApp: ${unit.phone || searchTerm}
Horário de Atendimento: ${workingHours}

PROFISSIONAIS / BARBEIROS:
${barbersList}

SERVIÇOS E TABELA DE PREÇOS:
${servicesList}

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
        bookingUrl
      },
      context: formattedContext
    });
  } catch (error: any) {
    console.error("[SDR /context]", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
