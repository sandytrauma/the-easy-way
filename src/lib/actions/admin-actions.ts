"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updatePlanAdmin(userId: string, newPlan: string) {
  await db.update(users).set({ plan: newPlan }).where(eq(users.id, userId));
  revalidatePath("/dashboard/admin");
}