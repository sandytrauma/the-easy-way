"use client";

import { useState, cloneElement, Children } from "react";
import { Menu, X, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNavToggle({ children }: { children: React.ReactElement }) {
  const [isOpen, setIsOpen] = useState(false);

  // Inject close function into Nav links
  const navContent = cloneElement(children, {
    onLinkClick: () => setIsOpen(false),
    className: "border-r-0 w-full"
  } as any);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-[280px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 border-b">
              <div className="flex items-center gap-2 font-black text-indigo-600">
                <Hotel className="h-5 w-5" />
                <span>SAAP POS</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}