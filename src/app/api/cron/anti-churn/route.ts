import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/cron/anti-churn
 * Cron diário que identifica clientes de todos os tenants cujo ciclo de visita (IMV) expirou há mais de 3 dias,
 * e dispara automaticamente mensagens humanizadas de resgate pelo WhatsApp via Evolution API.
 */
export async function GET() {
  try {
    const now = new Date();
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    // Buscar todos os tenants ativos que possuem WhatsApp ativado no plano
    const activeTenants = await db.tenant.findMany({
      where: {
        active: true,
        subscription: {
          status: "ACTIVE",
          plan: {
            has_whatsapp_sdr: true,
          },
        },
      },
      include: {
        units: true,
      },
    });

    let totalDispatched = 0;
    const report: any[] = [];

    for (const tenant of activeTenants) {
      const instance = tenant.slug;

      // Buscar agendamentos de clientes deste tenant
      const appointments = await db.appointment.findMany({
        where: { tenantId: tenant.id },
        include: { client: true, barber: true, service: true },
        orderBy: { start_time: "asc" },
      });

      const clientMap = new Map<string, any[]>();
      appointments.forEach((a) => {
        if (!a.client || !a.client.phone) return;
        if (!clientMap.has(a.client.id)) clientMap.set(a.client.id, []);
        clientMap.get(a.client.id)?.push(a);
      });

      for (const [clientId, appts] of clientMap.entries()) {
        const client = appts[0].client;
        const completedAppts = appts
          .filter((a: any) => a.status === "COMPLETED")
          .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        if (completedAppts.length >= 2) {
          let totalIntervalDays = 0;
          for (let i = 0; i < completedAppts.length - 1; i++) {
            const d1 = new Date(completedAppts[i].start_time).getTime();
            const d2 = new Date(completedAppts[i + 1].start_time).getTime();
            totalIntervalDays += Math.max(1, (d2 - d1) / (1000 * 60 * 60 * 24));
          }

          const avgCycle = Math.max(7, Math.round(totalIntervalDays / (completedAppts.length - 1)));
          const lastVisit = new Date(completedAppts[completedAppts.length - 1].start_time);
          const daysSince = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

          const hasFuture = appts.some(
            (a: any) => (a.status === "CONFIRMED" || a.status === "PENDING") && new Date(a.start_time) > now
          );

          // Disparar exatamente no 3º dia após expirar o ciclo médio (evita spam diário)
          if (!hasFuture && (daysSince === avgCycle + 3 || daysSince === avgCycle + 7)) {
            const preferredBarber = completedAppts[completedAppts.length - 1]?.barber?.name || "seu barbeiro";
            const firstName = client.name.split(" ")[0];
            const cleanPhone = client.phone.replace(/\D/g, "");

            const text = `Fala ${firstName}, tudo na paz, meu parceiro? 💈 Notei que já faz ${daysSince} dias do seu último corte com o ${preferredBarber}. Ele abriu horários hoje e amanhã. Quer que eu já reserve a sua cadeira?`;

            if (evolutionUrl && evolutionApiKey && instance && cleanPhone) {
              await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
                method: "POST",
                headers: {
                  apikey: evolutionApiKey,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  number: cleanPhone,
                  text,
                }),
              });
              totalDispatched++;
              report.push({ tenant: tenant.name, client: client.name, phone: cleanPhone, status: "SENT" });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalDispatched} mensagens anti-churn processadas e disparadas com sucesso.`,
      dispatchedCount: totalDispatched,
      report,
    });
  } catch (error: any) {
    console.error("[Anti-Churn Cron Error]", error);
    return NextResponse.json({ error: "Erro no cron anti-churn", details: error.message }, { status: 500 });
  }
}
