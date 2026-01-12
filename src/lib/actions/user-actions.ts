"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: { name: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const userId = (session.user as any).id;

    await db.update(users)
      .set({ name: formData.name })
      .where(eq(users.id, userId));

    // Refresh the page data so the sidebar/header shows the new name
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}