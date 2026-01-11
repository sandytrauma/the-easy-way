import { db } from "@/db";
import { chats } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { MessageSquare, LayoutDashboard, Settings } from "lucide-react";

export async function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const session = await auth();
  const userId = (session?.user as any).id;

  // Fetch recent chats from Neon
  const history = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt))
    .limit(5);

  return (
    <nav className="px-4 space-y-8 mt-4">
      {/* Main Links */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase px-2">Menu</p>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors">
          <LayoutDashboard className="h-4 w-4 text-indigo-600" />
          Dashboard
        </Link>
      </div>

      {/* Dynamic History Section */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase px-2">Recent Chats</p>
        <div className="space-y-1">
          {history.map((chat) => (
            <Link
              key={chat.id}
              href={`/dashboard/app/chat-pdf/${chat.id}`}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
            >
              <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
              <span className="truncate w-40">{chat.pdfName}</span>
            </Link>
          ))}
          {history.length === 0 && (
            <p className="text-[11px] text-slate-400 italic px-3">No PDFs uploaded yet</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase px-2">Admin</p>
          <Link href="/dashboard/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors">
            <Settings className="h-4 w-4 text-rose-600" />
            Control Center
          </Link>
        </div>
      )}
    </nav>
  );
}