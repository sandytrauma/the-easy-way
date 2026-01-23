import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hotel, Calculator, Package, History, LogOut } from "lucide-react";
import Link from "next/link";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-100 overflow-hidden">
      {/* POS Top Navigation Bar */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="bg-indigo-600 p-1 rounded">
              <Hotel className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">POS TERMINAL</span>
          </Link>
          <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <Link href="/dashboard/pos" className="text-slate-400 hover:text-white flex items-center gap-1">
              <Calculator className="h-3 w-3" /> Terminal
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white flex items-center gap-1">
              <Package className="h-3 w-3" /> Inventory
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white flex items-center gap-1">
              <History className="h-3 w-3" /> Recent Orders
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right hidden xs:block">
            <p className="font-bold leading-none">{session.user?.name}</p>
            <p className="text-[10px] text-slate-400">Station 01</p>
          </div>
          <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Main App Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}