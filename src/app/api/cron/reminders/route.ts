import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    // Procurar agendamentos que vão ocorrer daqui a 2.5h a 3.5h (~3 horas de antecedência)
    const twoAndHalfHoursFromNow = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
    const threeAndHalfHoursFromNow = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);

    const upcomingAppointments = await db.appointment.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        start_time: {
          gte: twoAndHalfHoursFromNow,
          lt: threeAndHalfHoursFromNow
        }
      },
      include: {
        client: true,
        tenant: {
          include: {
            units: true,
            subscription: { include: { plan: true } }
          }
        },
        unit: true,
        barber: true,
      }
    });

    if (upcomingAppointments.length === 0) {
      return NextResponse.json({ message: "Nenhum lembrete para a janela de 3 horas agora." });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_REMINDER_URL;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    const results = await Promise.allSettled(
      upcomingAppointments.map(async (appt) => {
        const timeStr = appt.start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const instance = appt.tenant.slug || appt.unit?.phone || appt.tenant.id;
        const clientPhone = appt.client?.phone?.replace(/\D/g, "");

        if (!clientPhone) {
          return { id: appt.id, status: 'SKIPPED_NO_PHONE' };
        }

        // Se tiver URL do n8n configurada, dispara o webhook
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instance,
              evolution_url: evolutionUrl,
              evolution_apikey: evolutionApiKey,
              cliente_whatsapp: clientPhone,
              cliente_nome: appt.client.name,
              horario: timeStr,
              barbeiro: appt.barber.name
            })
          });
          return { id: appt.id, client: appt.client.name, status: 'SENT_TO_N8N' };
        }

        // Caso direto via Evolution API se configurada
        if (evolutionUrl && evolutionApiKey && instance) {
          await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
            method: 'POST',
            headers: {
              'apikey': evolutionApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              number: clientPhone,
              text: `Fala ${appt.client.name}! Passando pra lembrar que seu horário na ${appt.tenant.name} é HOJE às ${timeStr} com o ${appt.barber.name}. 💈\n\nTá confirmado? Responde com um 👍 que a gente te espera!`
            })
          });
          return { id: appt.id, client: appt.client.name, status: 'SENT_DIRECT_EVOLUTION' };
        }

        return { id: appt.id, client: appt.client.name, status: 'SIMULATED_NO_CREDENTIALS' };
      })
    );

    return NextResponse.json({ 
      message: `${upcomingAppointments.length} lembretes (3h antecedência) processados.`,
      results
    });

  } catch (error: any) {
    console.error("Erro no cron job de lembretes:", error);
    return NextResponse.json({ error: "Falha ao processar lembretes.", details: error.message }, { status: 500 });
  }
}
