import Link from "next/link";
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings, 
  FileText, // Icon for Resume
  ShieldAlert, // Icon for Admin
  Sparkles
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
  const userId = (session?.user as any).id;

  const recentChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt))
    .limit(3);

  return (
    <nav className="flex flex-col h-full py-4 px-3 space-y-6">
      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Core Apps
        </p>
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            Overview
          </Link>
          
          <Link
            href="/dashboard/app/chat-pdf"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FileSearch className="h-4 w-4 text-indigo-500" />
            Chat with PDF
          </Link>

          <Link
            href="/dashboard/app/resume-maker"
            className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-indigo-600" />
              Resume Maker
            </div>
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
          </Link>
        </div>
      </div>

      {recentChats.length > 0 && (
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <History className="h-3 w-3" /> Recent Chats
          </p>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/app/chat-pdf/${chat.id}`}
                className="block px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-600 truncate rounded-md hover:bg-slate-50"
              >
                {chat.pdfName}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="pt-4 border-t">
          <p className="px-3 text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">System</p>
          <Link 
            href="/dashboard/admin" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      )}

      <div className="mt-auto border-t pt-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Settings className="h-4 w-4 text-slate-500" />
          Settings
        </Link>
      </div>
    </nav>
  );
}