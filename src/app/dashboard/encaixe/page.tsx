import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function EncaixePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  // Fetch tenantId and unitId
  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: {
        include: { unit: true }
      }
    }
  });

  const unit = userWithUnits?.units[0]?.unit;
  if (!unit) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in p-8 text-center text-text-secondary">
        Unidade não encontrada.
      </div>
    );
  }

  const tenantId = unit.tenantId;
  const unitId = unit.id;
  const isOwner = session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN';

  // Fetch Services
  const services = await db.service.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' }
  });

  // Fetch Barbers
  let barbers = [];
  if (isOwner) {
    const barbersUnits = await db.barberUnit.findMany({
      where: { unitId },
      include: { barber: true }
    });
    barbers = barbersUnits.map(bu => bu.barber);
  } else {
    barbers = [{ id: session.user.id, name: session.user.name }];
  }

  // Fetch Clients
  const recentAppointments = await db.appointment.findMany({
    where: { unitId },
    select: { client: true },
    distinct: ['clientId'],
    take: 50
  });
  
  const clients = recentAppointments.map(a => a.client);

  async function createEncaixe(formData: FormData) {
    "use server";
    
    // Check auth again inside server action for safety
    const actionSession = await auth();
    if (!actionSession?.user) return;

    let clientId = formData.get("clientId") as string;
    const newClientName = formData.get("newClientName") as string;
    const newClientPhone = formData.get("newClientPhone") as string;

    const serviceId = formData.get("serviceId") as string;
    const barberId = formData.get("barberId") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;

    // Create a new client if no existing one was selected
    if (!clientId && newClientName) {
      const dummyEmail = `cliente_${Date.now()}@barbearia.com`;
      const dummyPassword = "dummy_password_hash";
      
      const newUser = await db.user.create({
        data: {
          name: newClientName,
          phone: newClientPhone,
          email: dummyEmail,
          password_hash: dummyPassword,
          role: "CLIENT"
        }
      });
      clientId = newUser.id;
    }

    if (!clientId || !serviceId || !barberId || !dateStr || !timeStr) {
      // Basic validation fallback
      console.error("Missing required fields for Encaixe");
      return;
    }

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) return;

    const start_time = new Date(`${dateStr}T${timeStr}:00`);
    const end_time = new Date(start_time.getTime() + service.duration_minutes * 60000);

    await db.appointment.create({
      data: {
        tenantId,
        unitId,
        barberId,
        clientId,
        serviceId,
        start_time,
        end_time,
        status: "CONFIRMED"
      }
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-xl transition-colors text-text-secondary hover:text-text-primary">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Novo Encaixe</h1>
          <p className="text-text-secondary">Adicione um agendamento rápido (status: confirmado)</p>
        </div>
      </div>

      <div className="bg-surface border border-secondary p-8 rounded-2xl shadow-lg">
        <form action={createEncaixe} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cliente */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-secondary">Cliente Existente</label>
              <select name="clientId" className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors">
                <option value="">-- Cadastrar Novo Cliente --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.phone ? `(${client.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Nome do Novo Cliente</label>
              <input type="text" name="newClientName" placeholder="João Silva" className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Telefone (opcional)</label>
              <input type="text" name="newClientPhone" placeholder="(11) 99999-9999" className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Serviço</label>
              <select name="serviceId" required className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors">
                <option value="">Selecione um serviço...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R$ {Number(s.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Barbeiro */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Barbeiro</label>
              <select name="barberId" required className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors">
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Data e Hora */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Data</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Hora</label>
              <input type="time" name="time" required className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
            </div>
            
          </div>

          <div className="pt-4 border-t border-secondary flex justify-end gap-4 mt-6">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-secondary transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/30">
              Confirmar Encaixe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
