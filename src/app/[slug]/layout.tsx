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
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Background decorativo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none -z-10" />
      
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
