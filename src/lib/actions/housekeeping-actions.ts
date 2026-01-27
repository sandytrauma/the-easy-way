"use server";

import { db } from "@/db";
import { rooms, staff } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getHousekeepingData(hotelId: string) {
  // Fetch rooms that need attention
  const dirtyRooms = await db.select()
    .from(rooms)
    .where(
      and(
        eq(rooms.hotelId, hotelId),
        or(eq(rooms.status, "cleaning"), eq(rooms.status, "maintenance"))
      )
    );

  // Fetch only staff who are cleaners/housekeepers
  const cleaningStaff = await db.select()
    .from(staff)
    .where(
      and(
        eq(staff.hotelId, hotelId),
        eq(staff.role, "cleaner")
      )
    );

  return { dirtyRooms, cleaningStaff };
}

export async function updateRoomToClean(roomId: string, hotelId: string) {
  await db.update(rooms)
    .set({ status: "available" })
    .where(eq(rooms.id, roomId));

  revalidatePath(`/dashboard/pos/${hotelId}/housekeeping`);
}