import { auth } from "@/lib/auth";
import { SettingsClient } from "./settings-client";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, (session.user as any).id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account, billing, and preferences.</p>
      </div>
      
      <SettingsClient user={user} />
    </div>
  );
}