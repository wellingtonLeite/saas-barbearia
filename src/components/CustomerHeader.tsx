"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Compass, CalendarCheck, Menu, X, ArrowRight, Store } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CustomerHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Explorar Barbearias",
      href: "/explorar",
      icon: Compass,
      active: pathname === "/explorar" || pathname.startsWith("/explorar?"),
    },
    {
      name: "Meus Agendamentos",
      href: "/meus-agendamentos",
      icon: CalendarCheck,
      active: pathname === "/meus-agendamentos",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0c]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg shadow-primary/20">
            <Scissors size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-black text-white tracking-tight">
              88<span className="text-primary">barber</span>
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold -mt-1">
              Portal do Cliente
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 bg-surface/60 border border-white/5 p-1.5 rounded-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all",
                  link.active
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons for Barbershop Owners / Sign in */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          >
            <Store size={15} className="text-primary" />
            <span>Cadastrar Minha Barbearia</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-surface border border-secondary text-slate-300 hover:text-white focus:outline-none"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0f1115]/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all",
                    link.active
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
            >
              <Store size={18} /> Cadastrar Barbearia
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-surface hover:bg-surface-hover text-slate-300 border border-secondary rounded-xl font-semibold text-center block text-sm"
            >
              Acessar Painel da Barbearia (Login)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
