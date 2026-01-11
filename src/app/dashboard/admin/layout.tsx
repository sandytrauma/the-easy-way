import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userPlan = (session?.user as any)?.plan;

  // Only allow 'admin' or users with a specific master plan
  // For this template, let's assume the first user is the admin or use an email check
  if (userPlan !== "admin" && session?.user?.email !== "admin@test.com") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="text-muted-foreground">Manage your users and platform components.</p>
      </div>
      {children}
    </div>
  );
}