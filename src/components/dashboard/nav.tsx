import Link from "next/link";
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  ReceiptText, 
  CreditCard,
  ChevronRight
} from "lucide-react";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface DashboardNavProps {
  isAdmin: boolean;
}

export async function DashboardNav({ isAdmin }: DashboardNavProps) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  // Defensive database fetch to prevent runtime crashes
  let recentChats: any[] = [];
  try {
    if (userId) {
      recentChats = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(desc(chats.createdAt))
        .limit(4);
    }
  } catch (error) {
    console.error("Sidebar Fetch Error:", error);
  }

  const mainApps = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-slate-500" },
    { name: "Chat PDF", href: "/dashboard/app/chat-pdf", icon: FileSearch, color: "text-indigo-500" },
    { name: "Resume Maker", href: "/dashboard/app/resume-maker", icon: FileText, color: "text-emerald-500", badge: <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" /> },
    { name: "Expense AI", href: "/dashboard/app/expenses", icon: ReceiptText, color: "text-orange-500", badge: <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">New</span> },
  ];

  return (
    <nav 
      suppressHydrationWarning // Add this to handle minor HTML differences
      className="flex flex-col h-full py-6 px-4 space-y-8 bg-white dark:bg-slate-950 border-r border-slate-200/60"
    >
      
      {/* SECTION: MAIN APPS */}
      <div className="space-y-2">
        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          Workspace
        </p>
        <div className="space-y-1">
          {mainApps.map((app) => (
            <Link
              key={app.name}
              href={app.href}
              className="group flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 hover:text-slate-900"
            >
              <div className="flex items-center gap-3">
                <app.icon className={`h-4 w-4 ${app.color} transition-transform group-hover:scale-110`} />
                {app.name}
              </div>
              {app.badge && app.badge}
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION: RECENT CHATS */}
      {recentChats.length > 0 && (
        <div className="space-y-3">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="h-3 w-3" /> History
          </p>
          <div className="space-y-1 pl-2">
            {recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/app/chat-pdf/${chat.id}`}
                className="group flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-all"
              >
                <div className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                <span className="truncate max-w-[140px]">{chat.pdfName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER: SYSTEM & SETTINGS */}
      <div className="mt-auto pt-6 space-y-4">
        {isAdmin && (
          <Link 
            href="/dashboard/admin" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <ShieldAlert className="h-4 w-4" />
            Admin Control
          </Link>
        )}

        <div className="space-y-1">
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          >
            <CreditCard className="h-4 w-4 text-slate-400" />
            Billing
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Settings
          </Link>
        </div>

        {/* PRO UPGRADE PROMPT */}
        <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-lg shadow-indigo-200">
           <p className="text-xs font-bold opacity-80 mb-1">Unleash AI</p>
           <p className="text-[10px] leading-tight opacity-90 mb-3">Get unlimited PDF parsing and AI resumes.</p>
           <Link href="/pricing" className="text-[10px] font-black bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center justify-between transition-all">
             UPGRADE NOW <ChevronRight className="h-3 w-3" />
           </Link>
        </div>
      </div>
    </nav>
  );
}