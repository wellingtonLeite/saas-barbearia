import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const tenant = await db.tenant.findFirst();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
  }

  // Find the owner/admin user
  const user = await db.user.findFirst({
    where: {
      role: 'OWNER',
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Owner not found." }, { status: 404 });
  }

  // Insert test notification for new appointment
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  await db.notification.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      type: 'NEW_APPOINTMENT',
      title: '🚨 NOVO AGENDAMENTO RECEBIDO!',
      message: `Cliente: Gabriel Medina | Serviço: Barba & Cabelo VIP | Barbeiro: Marcos Barbeiro | Horário: ${dateStr} às ${timeStr}`
    }
  });

  await db.notification.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      type: 'SYSTEM_ALERT',
      title: 'Teste: Vencimento (Sons)',
      message: 'Este é um alerta normal. Você deve ouvir um som suave.'
    }
  });

  return NextResponse.json({ success: true, user: user.name });
}
