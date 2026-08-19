import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Middleware de autenticação por API Key interna
function authSDR(request: Request) {
  const key = request.headers.get("x-sdr-key");
  const expected = process.env.SDR_INTERNAL_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/sdr/context?phone={whatsappPhone}
 * Retorna o contexto completo da barbearia a partir do número de WhatsApp registrado.
 * O n8n chama isso ao receber uma mensagem para saber com qual barbearia está lidando.
 */
export async function GET(request: Request) {
  const authError = authSDR(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone"); // Número WhatsApp da barbearia (ex: 5511999999999)

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    // Busca a unidade pelo número de whatsapp registrado
    const unit = await db.unit.findFirst({
      where: { whatsapp_number: phone },
      include: {
        tenant: {
          include: {
            subscription: { include: { plan: true } }
          }
        },
        services: {
          where: { active: true },
          select: { id: true, name: true, price: true, duration_minutes: true }
        },
        barbers: {
          include: {
            barber: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Nenhuma barbearia encontrada com este número de WhatsApp" },
        { status: 404 }
      );
    }

    // Verifica se o plano da barbearia tem o SDR habilitado
    const plan = unit.tenant.subscription?.plan as any;
    if (!plan?.has_whatsapp_sdr) {
      return NextResponse.json(
        { error: "Plano da barbearia não inclui o Agente SDR" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      unit: {
        id: unit.id,
        name: unit.name,
        tenantId: unit.tenantId,
        tenantName: unit.tenant.name,
        address: unit.address,
        phone: unit.phone,
      },
      services: unit.services,
      barbers: unit.barbers.map(b => ({
        id: b.barber.id,
        name: b.barber.name,
        image: b.barber.image
      }))
    });
  } catch (error) {
    console.error("[SDR /context]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
