"use server";

import { db } from "@/db";
import { staff, shifts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStaff(hotelId: string) {
  return await db.select().from(staff).where(eq(staff.hotelId, hotelId));
}

export async function addStaffMember(data: { hotelId: string; name: string; role: string }) {
  await db.insert(staff).values(data);
  revalidatePath("/dashboard/pos/[hotelId]/staff", "page");
}

export async function getDailyShifts(hotelId: string, date: Date) {
  // Logic to fetch shifts for a specific 24-hour window
  return await db.select()
    .from(shifts)
    .where(eq(shifts.hotelId, hotelId));
}

export async function createShift(data: {
  staffId: string;
  hotelId: string;
  startTime: Date;
  endTime: Date;
  taskNotes?: string;
}) {
  await db.insert(shifts).values(data);
  revalidatePath(`/dashboard/pos/[hotelId]/staff`, "page");
}