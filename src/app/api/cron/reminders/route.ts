import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    // Procurar agendamentos que vão ocorrer daqui a 10 a 11 horas
    const tenHoursFromNow = new Date(now.getTime() + 10 * 60 * 60 * 1000);
    const elevenHoursFromNow = new Date(now.getTime() + 11 * 60 * 60 * 1000);

    const upcomingAppointments = await db.appointment.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        start_time: {
          gte: tenHoursFromNow,
          lt: elevenHoursFromNow
        }
      },
      include: {
        client: true,
        tenant: true,
        barber: true,
      }
    });

    if (upcomingAppointments.length === 0) {
      return NextResponse.json({ message: "Nenhum lembrete para enviar agora." });
    }

    // Simulando o envio de mensagens (WhatsApp / SMS / E-mail)
    const logs = upcomingAppointments.map(appt => {
      const apptUrl = `http://localhost:3000/agendamento/${appt.id}`;
      const message = `
      Olá ${appt.client.name}, tudo bem?
      Lembrando do seu horário hoje às ${appt.start_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com ${appt.barber.name} na ${appt.tenant.name}.
      
      Precisa cancelar ou reagendar? Acesse:
      ${apptUrl}
      `;
      
      console.log("=========================================");
      console.log(`[SIMULAÇÃO WHATSAPP PARA: ${appt.client.name}]`);
      console.log(message);
      console.log("=========================================");

      return {
        client: appt.client.name,
        time: appt.start_time,
        status: "SENT_SIMULATION"
      };
    });

    return NextResponse.json({ 
      message: `${logs.length} lembretes processados.`,
      logs
    });

  } catch (error) {
    console.error("Erro no cron job de lembretes:", error);
    return NextResponse.json({ error: "Falha ao processar lembretes." }, { status: 500 });
  }
}
