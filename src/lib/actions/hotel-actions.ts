"use server";

import { db } from "@/db";
import { hotels } from "@/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createHotel(name: string, location: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [newHotel] = await db.insert(hotels).values({
      name,
      location,
      adminId: (session.user as any).id,
    }).returning();

    revalidatePath("/dashboard/hotels");
    return { success: true, data: newHotel };
  } catch (e) {
    return { success: false, error: "Failed to create hotel" };
  }
}