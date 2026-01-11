import { auth, signOut } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Get the session on the server
  const session = await auth();

  

  // 2. Safety check (though middleware handles this, it's good practice)
  if (!session) {
    redirect("/login");
  }

  const isAdmin = (session.user as any)?.plan === "admin";
  const userEmail = session.user?.email;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-slate-50/50 hidden md:block">
        <div className="flex h-full flex-col gap-4">
          <div className="h-14 flex items-center px-6 font-bold text-indigo-600 border-b">
            SAAP : Pro Template
          </div>
          <div className="flex-1">
            {/* Pass the isAdmin prop to show/hide the Admin menu */}
            <DashboardNav isAdmin={isAdmin} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-8 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Platform
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              {userEmail}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" className="text-slate-600">
                Logout
              </Button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-8 bg-slate-50/30 flex-1 overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}