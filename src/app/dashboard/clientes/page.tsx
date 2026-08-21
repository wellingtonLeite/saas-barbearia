import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClientesTabsView, ClientData } from "@/components/dashboard/ClientesTabsView";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await searchParams;
  const initialTab = (resolvedParams.tab === "antichurn" ? "antichurn" : "carteira") as "carteira" | "antichurn";

  const isOwner = session.user.role === "OWNER" || session.user.role === "SUPER_ADMIN";

  // Buscar o Tenant do usuário logado (dono ou funcionário)
  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      units: {
        include: { unit: { include: { tenant: true } } },
      },
    },
  });

  const tenant = userWithUnits?.units[0]?.unit?.tenant;

  if (!tenant) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Barbearia não encontrada.
      </div>
    );
  }

  const tenantData = await db.tenant.findUnique({
    where: { id: tenant.id },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  const plan = tenantData?.subscription?.plan;
  const hasClientsModule = plan?.has_clients_module ?? true; // Defaults to true for backward compat

  if (!hasClientsModule) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 text-center">
        <div className="bg-surface border border-secondary p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Users className="text-secondary w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Gestão de Clientes</h2>
          <p className="text-text-secondary mb-6">
            A gestão de carteira de clientes não está disponível no plano {plan?.name || "Atual"}.
          </p>
          <Link
            href="/dashboard/assinatura"
            className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Fazer Upgrade do Plano
          </Link>
        </div>
      </div>
    );
  }

  // Buscar Clientes (Usuários que têm agendamento nesta barbearia)
  const clientsFromDb = await db.user.findMany({
    where: {
      role: "CLIENT",
      client_appointments: {
        some: {
          tenantId: tenant.id,
          ...(isOwner ? {} : { barberId: session.user.id }), // Barbeiro vê só seus clientes
        },
      },
    },
    include: {
      client_appointments: {
        where: {
          tenantId: tenant.id,
          ...(isOwner ? {} : { barberId: session.user.id }),
        },
        orderBy: { start_time: "desc" },
        include: { service: true, barber: true },
      },
    },
  });

  const clientsData: ClientData[] = clientsFromDb.map((c) => {
    const lastAppt = c.client_appointments[0];
    return {
      id: c.id,
      name: c.name || "Cliente sem nome",
      phone: c.phone,
      appointmentsCount: c.client_appointments.length,
      lastAppointment: lastAppt
        ? {
            dateFormatted: new Date(lastAppt.start_time).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            serviceName: lastAppt.service.name,
          }
        : null,
    };
  });

  return (
    <ClientesTabsView
      clients={clientsData}
      isOwner={isOwner}
      initialTab={initialTab}
    />
  );
}

