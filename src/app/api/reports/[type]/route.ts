import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const resolvedParams = await params;
  const { type } = resolvedParams;

  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  if (!startParam || !endParam) {
    return new NextResponse("Start and end dates are required", { status: 400 });
  }

  const startDate = new Date(startParam + "T00:00:00");
  const endDate = new Date(endParam + "T23:59:59");

  const userWithUnits = await db.user.findUnique({
    where: { id: session.user.id },
    include: { units: { include: { unit: true } } }
  });
  
  const tenantId = userWithUnits?.units[0]?.unit?.tenantId;
  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  const tenant = await db.tenant.findUnique({ 
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });
  
  const plan = tenant?.subscription?.plan;
  const isOuro = (plan?.max_barbers ?? 0) >= 50;

  if (!isOuro) {
    return new NextResponse("Upgrade required", { status: 403 });
  }

  let csvContent = "";
  let filename = `${type}.csv`;

  if (type === "faturamento") {
    const sales = await db.sale.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { barber: true }
    });

    csvContent = "ID,Data,Barbeiro,Total,Comissao\n";
    sales.forEach(sale => {
      csvContent += `"${sale.id}","${sale.createdAt.toISOString()}","${sale.barber?.name || 'N/A'}","${sale.total_amount}","${sale.barber_commission}"\n`;
    });
  } 
  else if (type === "comissoes") {
    const sales = await db.sale.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { barber: true }
    });

    const byBarber = sales.reduce((acc: any, sale: any) => {
      const bName = sale.barber.name;
      if (!acc[bName]) acc[bName] = 0;
      acc[bName] += Number(sale.barber_commission);
      return acc;
    }, {});

    csvContent = "Barbeiro,Comissao Total\n";
    for (const [barber, total] of Object.entries(byBarber)) {
      csvContent += `"${barber}","${(total as number).toFixed(2)}"\n`;
    }
  }
  else if (type === "atendimentos") {
    const appointments = await db.appointment.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        start_time: { gte: startDate, lte: endDate }
      },
      include: { barber: true, service: true, client: true }
    });

    csvContent = "Data,Cliente,Barbeiro,Servico,Preco\n";
    appointments.forEach(app => {
      csvContent += `"${app.start_time.toISOString()}","${app.client.name}","${app.barber.name}","${app.service.name}","${app.service.price}"\n`;
    });
  }
  else {
    return new NextResponse("Report type not found", { status: 404 });
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
