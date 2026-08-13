"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, CalendarCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Explorar", href: "/explore", icon: Compass },
  { name: "Agendamentos", href: "/bookings", icon: CalendarCheck },
  { name: "Perfil", href: "/profile", icon: User },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col bg-background relative pb-16 md:pb-0">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-center p-4 bg-surface border-b border-secondary sticky top-0 z-30">
        <span className="font-display font-bold text-lg text-primary tracking-wide">
          SaaS Barbearia
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation (App-like) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-secondary px-6 py-2 flex justify-between items-center">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors",
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar (optional, if we want to support desktop for clients) */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-surface border-r border-secondary flex-col">
        <div className="p-6">
          <span className="text-2xl font-display font-bold text-primary">SaaS Barbearia</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary hover:bg-secondary/50 hover:text-text-primary"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
