"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Menu, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export const MobileSidebarContext = createContext({
  isOpen: false,
  setIsOpen: (val: boolean) => {},
  closeSidebar: () => {}
});

export const useMobileSidebar = () => useContext(MobileSidebarContext);

interface MobileSidebarWrapperProps {
  children: React.ReactNode;
  headerChildren?: React.ReactNode;
}

export function MobileSidebarWrapper({ children, headerChildren }: MobileSidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const closeSidebar = () => setIsOpen(false);

  // Close sidebar when pathname or search params change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen, closeSidebar }}>
      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-surface sticky top-0 z-[60]">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-text-primary hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1 flex justify-end">
          {headerChildren}
        </div>
      </div>

      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-[100] h-[100dvh] md:h-auto
      `}>
        {/* Close button for mobile */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-white hover:text-red-400 bg-slate-800/50 rounded-lg z-[60]"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </MobileSidebarContext.Provider>
  );
}
