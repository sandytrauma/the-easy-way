import { DashboardNav } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-slate-50/50 hidden md:block">
        <div className="flex h-full flex-col gap-4">
          <div className="h-14 flex items-center px-6 font-bold text-indigo-600 border-b">
            SAAP CORE
          </div>
          <DashboardNav />
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-8 bg-white">
          <span className="text-sm font-medium text-slate-500">Platform / Dashboard</span>
          <form action={async () => { "use server"; await signOut(); }}>
            <Button variant="ghost" size="sm">Logout</Button>
          </form>
        </header>
        <section className="p-8 bg-slate-50/30 flex-1">{children}</section>
      </main>
    </div>
  );
}