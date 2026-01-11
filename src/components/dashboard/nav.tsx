import Link from "next/link";
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings, 
  CreditCard 
} from "lucide-react";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function DashboardNav() {
  const session = await auth();
  const userId = (session?.user as any).id;

  // Optional: Fetch the 3 most recent chats for a "Quick Access" look
  const recentChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt))
    .limit(3);

  return (
    <nav className="flex flex-col h-full py-4 px-3 space-y-6">
      {/* Main Apps Section */}
      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Apps
        </p>
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            Overview
          </Link>
          
          {/* THE NEW TAB */}
          <Link
            href="/dashboard/app/chat-pdf"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <FileSearch className="h-4 w-4 text-indigo-600" />
            Chat with PDF
          </Link>
        </div>
      </div>

      {/* History / Recent Chats Section */}
      {recentChats.length > 0 && (
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <History className="h-3 w-3" /> Recent Documents
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

      {/* Bottom Settings Section */}
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