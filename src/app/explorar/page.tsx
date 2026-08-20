import { db } from "@/lib/db";
import CustomerHeader from "@/components/CustomerHeader";
import ExplorarClient, { TenantExploreItem } from "@/components/ExplorarClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorar Barbearias | 88barber",
  description: "Encontre as melhores barbearias perto de você, compare serviços e agende seu horário online em segundos.",
  keywords: ["barbearias", "agendar corte", "barbeiro", "encontrar barbearia", "88barber"],
};

export const dynamic = "force-dynamic";

export default async function ExplorarPage() {
  // Busca todas as barbearias ativas no sistema
  const rawTenants = await db.tenant.findMany({
    where: {
      active: true
    },
    include: {
      units: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          working_hours: true
        }
      },
      services: {
        select: {
          id: true,
          name: true,
          price: true,
          duration_minutes: true
        },
        orderBy: {
          price: "asc"
        },
        take: 4
      },
      reviews: {
        select: {
          rating: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Serializa campos decimais para tipos compatíveis com o Client Component
  const tenants: TenantExploreItem[] = rawTenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo_url: tenant.logo_url,
    about_text: tenant.about_text,
    units: tenant.units,
    services: tenant.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      duration_minutes: s.duration_minutes
    })),
    reviews: tenant.reviews
  }));

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/30 selection:text-white">
      <CustomerHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <ExplorarClient initialTenants={tenants} />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0c] py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} 88barber. Portal de Experiência e Descoberta de Barbearias.</p>
          <div className="flex gap-4">
            <a href="/login" className="hover:text-white transition-colors">Painel da Barbearia</a>
            <a href="/register" className="hover:text-white transition-colors">Cadastrar Barbearia</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
