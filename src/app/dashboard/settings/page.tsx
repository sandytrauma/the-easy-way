import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, chats } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session?.user as any).id;

  // 1. Fetch User Plan
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 2. Fetch Usage Stats (e.g., number of PDFs uploaded)
  const [chatCount] = await db
    .select({ value: count() })
    .from(chats)
    .where(eq(chats.userId, userId));

  const planData = {
    plan: user?.plan || "free",
    usage: chatCount.value,
    limit: user?.plan === "pro" ? 1000 : 3, // Logic for limits
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your workspace and billing preferences.</p>
      </div>
      
      <SettingsClient 
        user={session?.user} 
        planData={planData} 
      />
    </div>
  );
}