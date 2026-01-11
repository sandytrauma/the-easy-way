"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upgradeToPro() {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "You must be logged in to upgrade." };
  }

  try {
    // Update the user's plan to 'pro'
    await db
      .update(users)
      .set({ plan: "pro" })
      .where(eq(users.email, session.user.email));

    // Refresh the dashboard data so the UI updates immediately
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (err) {
    return { error: "Failed to update plan. Please try again." };
  }
}