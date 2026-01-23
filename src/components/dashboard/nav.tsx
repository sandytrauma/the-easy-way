import Link from "next/link";
import { 
  LayoutDashboard, FileSearch, History, Settings, FileText, 
  ShieldAlert, Sparkles, ReceiptText, CreditCard, ChevronRight,
  Store, Building2, PlusCircle
} from "lucide-react";
import { db } from "@/db";
import { chats, hotels } from "@/db/schema"; // Import hotels schema
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface DashboardNavProps {
  isAdmin: boolean;
  onLinkClick?: () => void;
  className?: string;
}

export async function DashboardNav({ isAdmin, onLinkClick, className }: DashboardNavProps) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  let recentChats: any[] = [];
  let userHotels: any[] = [];

  try {
    if (userId) {
      // Fetch recent chats for history
      recentChats = await db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.createdAt)).limit(3);
      
      // Fetch hotels owned by this user/chain
      userHotels = await db.select().from(hotels).where(eq(hotels.adminId, userId));
    }
  } catch (error) {
    console.error("Sidebar Fetch Error:", error);
  }

  const mainApps = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-slate-500" },
    { name: "Hotel POS", href: "/dashboard/pos", icon: Store, color: "text-blue-600" },
    { name: "Chat PDF", href: "/dashboard/app/chat-pdf", icon: FileSearch, color: "text-indigo-500" },
    { name: "Expense AI", href: "/dashboard/app/expenses", icon: ReceiptText, color: "text-orange-500", badge: <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">New</span> },
  ];

  return (
    <nav className={`flex flex-col h-full py-6 px-4 space-y-8 bg-white dark:bg-slate-950 border-r border-slate-200/60 ${className}`}>
      
      {/* SECTION: WORKSPACE */}
      <div className="space-y-2">
        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Workspace</p>
        <div className="space-y-1">
          {mainApps.map((app) => (
            <Link key={app.name} href={app.href} onClick={onLinkClick} className="group flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all hover:bg-slate-100 text-slate-600 hover:text-slate-900">
              <div className="flex items-center gap-3">
                <app.icon className={`h-4 w-4 ${app.color} transition-transform group-hover:scale-110`} />
                {app.name}
              </div>
              {app.badge}
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION: HOTEL CHAIN MANAGEMENT */}
      <div className="space-y-3">
        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
          Your Hotels
          <Link href="/dashboard/pos/setup"><PlusCircle className="h-3 w-3 text-indigo-500 hover:scale-125 transition-transform" /></Link>
        </p>
        <div className="space-y-1">
          {userHotels.length > 0 ? (
            userHotels.map((hotel) => (
              <Link key={hotel.id} href={`/dashboard/pos/${hotel.id}`} onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-all">
                <Building2 className="h-3.5 w-3.5 opacity-70" />
                <span className="truncate">{hotel.name}</span>
              </Link>
            ))
          ) : (
            <Link href="/dashboard/pos/setup" className="px-3 py-2 text-[11px] italic text-slate-400 block">Add your first hotel +</Link>
          )}
        </div>
      </div>

      {/* FOOTER: SETTINGS & PRO */}
      <div className="mt-auto pt-6 space-y-4">
        {isAdmin && (
          <Link href="/dashboard/admin" onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl text-rose-600 bg-rose-50 border border-rose-100">
            <ShieldAlert className="h-4 w-4" /> Admin Control
          </Link>
        )}
        <div className="space-y-1">
          <Link href="/dashboard/billing" onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 text-slate-600">
            <CreditCard className="h-4 w-4 text-slate-400" /> Billing
          </Link>
          <Link href="/dashboard/settings" onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 text-slate-600">
            <Settings className="h-4 w-4 text-slate-400" /> Settings
          </Link>
        </div>

        <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-lg shadow-indigo-200">
           <p className="text-xs font-bold opacity-80 mb-1">POS Pro</p>
           <p className="text-[10px] leading-tight opacity-90 mb-3">Manage unlimited hotel chains & real-time analytics.</p>
           <Link href="/pricing" onClick={onLinkClick} className="text-[10px] font-black bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center justify-between transition-all">
             UPGRADE <ChevronRight className="h-3 w-3" />
           </Link>
        </div>
      </div>
    </nav>
  );
}