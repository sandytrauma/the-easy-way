"use server";

import { db } from "@/db";
import { bookings, transactions, dailyReports, rooms } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function runNightAudit(hotelId: string) {
  try {
    // 1. Fetch all currently checked-in bookings
    const activeBookings = await db.select()
      .from(bookings)
      .where(and(eq(bookings.hotelId, hotelId), eq(bookings.status, "checked_in")));

    if (activeBookings.length === 0) {
       return { success: true, processed: 0, message: "No active bookings to post." };
    }

    let totalDayRevenue = 0;

    // 2. Post Room Charges for each booking
    for (const booking of activeBookings) {
      const dailyRate = Number(booking.totalPrice); // In a real app, this might be a dynamic rate
      totalDayRevenue += dailyRate;

      await db.insert(transactions).values({
        hotelId,
        bookingId: booking.id,
        amount: dailyRate.toString(),
        type: "room_charge",
        description: `Night Audit Room Charge - ${new Date().toLocaleDateString()}`,
      });
    }

    // 3. Generate a Daily Report Snapshot
    const totalRooms = await db.select({ count: sql`count(*)` }).from(rooms).where(eq(rooms.hotelId, hotelId));
    const occupancy = (activeBookings.length / Number(totalRooms[0].count)) * 100;

    await db.insert(dailyReports).values({
      hotelId,
      totalRevenue: totalDayRevenue.toString(),
      occupancyRate: occupancy,
      roomsOccupied: activeBookings.length.toString(),
    });

    revalidatePath(`/dashboard/pos/${hotelId}/admin`);
    return { success: true, processed: activeBookings.length, revenue: totalDayRevenue };
  } catch (error) {
    console.error("Audit Error:", error);
    throw new Error("Critical failure during financial rollover.");
  }
}