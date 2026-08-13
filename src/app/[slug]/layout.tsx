import { ReactNode } from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Scissors } from "lucide-react";

export default async function PublicTenantLayout({ 
  children,
  params 
}: { 
  children: ReactNode,
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const tenant = await db.tenant.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!tenant || !tenant.active) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="bg-surface border-b border-secondary">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Scissors size={24} />
              </div>
            )}
            <h1 className="text-2xl font-display font-bold text-primary">{tenant.name}</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Public Footer */}
      <footer className="py-8 text-center text-text-secondary text-sm border-t border-secondary mt-12">
        <p>Powered by BarberSaaS &copy; 2026</p>
      </footer>
    </div>
  );
}
