"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PropertySubNav() {
  const params = useParams();
  const pathname = usePathname();
  const hotelId = params.hotelId;

  const tabs = [
    { name: "Terminal", href: `/dashboard/pos/${hotelId}/terminal` },
    { name: "Bookings", href: `/dashboard/pos/${hotelId}/bookings` },
    { name: "Kitchen", href: `/dashboard/pos/${hotelId}/kitchen` },
    { name: "Inventory", href: `/dashboard/pos/${hotelId}/inventory` },
    { name: "Housekeeping", href: `/dashboard/pos/${hotelId}/housekeeping` }, // NEW
    { name: "Staff", href: `/dashboard/pos/${hotelId}/staff` },
    { name: "Menu", href: `/dashboard/pos/${hotelId}/menu` },
  ];

  return (
    <div className="flex border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 px-10 py-1 gap-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.name.toLowerCase());
        
        return (
          <Link 
            key={tab.name} 
            href={tab.href}
            className={cn(
              "relative py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-indigo-600 whitespace-nowrap",
              isActive ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <span className={cn(isActive && "italic")}>{tab.name}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}