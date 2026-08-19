import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/BookingWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (/\\.(json|ico|xml|png|jpg|jpeg|svg|txt|webmanifest)$/i.test(resolvedParams.slug)) {
    notFound();
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      units: true,
      services: true,
    }
  });

  if (!tenant || tenant.units.length === 0) notFound();

  const primaryUnitId = tenant.units[0].id;

  // Buscar barbeiros disponíveis nesta unidade
  const barberContracts = await db.barberContract.findMany({
    where: { unitId: primaryUnitId },
    include: { barber: true }
  });
  
  const barbers = barberContracts.map(bc => bc.barber);

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href={`/${tenant.slug}`} className="text-text-secondary hover:text-primary flex items-center gap-2 w-fit transition-colors">
        <ArrowLeft size={18} /> Voltar para o início
      </Link>

      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">Novo Agendamento</h1>
        <p className="text-text-secondary text-lg">Siga os passos abaixo para marcar seu horário na <span className="text-primary font-bold">{tenant.name}</span>.</p>
      </div>

      <BookingWizard 
        tenant={tenant}
        services={tenant.services}
        barbers={barbers}
        unitId={primaryUnitId}
      />
    </div>
  );
}
