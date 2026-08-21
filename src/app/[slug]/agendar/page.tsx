import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/BookingWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BookingPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams?: Promise<{ serviceId?: string; barberId?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  if (/\.(json|ico|xml|png|jpg|jpeg|svg|txt|webmanifest)$/i.test(resolvedParams.slug)) {
    notFound();
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      units: true,
      services: {
        orderBy: { createdAt: 'desc' }
      },
    }
  });

  if (!tenant || tenant.units.length === 0) notFound();

  const primaryUnitId = tenant.units[0].id;

  // Buscar apenas barbeiros com status ATIVO nesta unidade, com suas avaliações
  const barberUnits = await db.barberUnit.findMany({
    where: { 
      unitId: primaryUnitId,
      is_active: true
    },
    include: { 
      barber: {
        include: {
          barber_reviews: true
        }
      } 
    }
  });
  
  const barbers = barberUnits.map(bu => ({
    id: bu.barber.id,
    name: bu.barber.name,
    email: bu.barber.email,
    phone: bu.barber.phone,
    avatar_url: bu.barber.avatar_url,
    bio: bu.barber.bio,
    reviews: bu.barber.barber_reviews || [],
    averageRating: bu.barber.barber_reviews && bu.barber.barber_reviews.length > 0
      ? (bu.barber.barber_reviews.reduce((acc, r) => acc + r.rating, 0) / bu.barber.barber_reviews.length).toFixed(1)
      : "5.0",
    reviewCount: bu.barber.barber_reviews?.length || 0
  }));

  const services = tenant.services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: Number(s.price),
    duration_minutes: s.duration_minutes,
    image_url: s.image_url,
    categoryId: s.categoryId
  }));

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto px-4 py-6">
      <Link href={`/${tenant.slug}`} className="text-text-secondary hover:text-primary flex items-center gap-2 w-fit transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Voltar para o início
      </Link>

      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">Novo Agendamento</h1>
        <p className="text-text-secondary text-sm sm:text-base">Siga os passos abaixo para marcar seu horário na <span className="text-primary font-bold">{tenant.name}</span>.</p>
      </div>

      <BookingWizard 
        tenant={tenant}
        services={services}
        barbers={barbers}
        unitId={primaryUnitId}
        initialServiceId={resolvedSearchParams?.serviceId}
        initialBarberId={resolvedSearchParams?.barberId}
      />
    </div>
  );
}
