"use server";

import { db } from "@/db";
import { rooms, bookings, roomCharges, maintenanceTasks, inventory } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRooms(hotelId: string) {
  return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
}

export async function createRoom(data: { hotelId: string; number: string; type: string }) {
  const result = await db.insert(rooms).values({
    hotelId: data.hotelId,
    number: data.number,
    type: data.type,
    status: "available",
  }).returning();
  
  revalidatePath(`/dashboard/pos/${data.hotelId}/bookings`);
  return result[0];
}

/**
 * 1. Fetch Guest History
 * Uses snake_case variables mapped from your schema
 */
export async function getGuestHistory(guestName: string, hotelId: string) {
  try {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.guestName, guestName),
          eq(bookings.hotelId, hotelId)
        )
      )
      .orderBy(desc(bookings.checkIn));
  } catch (error) {
    console.error("Guest History Query Failed:", error);
    return [];
  }
}

/**
 * 2. Check-In Guest
 * Uses .batch() for Neon HTTP compatibility
 */
export async function checkInGuest(data: { 
  hotelId: string; 
  roomId: string; 
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: string;
}) {
  try {
    const sanitizedPrice = data.totalPrice.replace(/[^\d.]/g, "");

    await db.batch([
      db.insert(bookings).values({
        hotelId: data.hotelId,
        roomId: data.roomId,
        guestName: data.guestName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalPrice: sanitizedPrice,
      }),
      db.update(rooms)
        .set({ 
          status: "occupied", 
          currentGuest: data.guestName 
        })
        .where(eq(rooms.id, data.roomId))
    ]);

    revalidatePath(`/dashboard/pos/${data.hotelId}/bookings`);
    return { success: true };
  } catch (error: any) {
    console.error("Check-in Error:", error);
    throw new Error(error.message);
  }
}

/**
 * 3. Check-Out Guest
 */
export async function checkOutGuest(roomId: string, hotelId: string) {
  if (!roomId || !hotelId) {
    console.error("Missing Room ID or Hotel ID for checkout");
    throw new Error("Missing required identifiers");
  }

  try {
    await db.batch([
      // Update the room to cleaning status and remove guest link
      db.update(rooms)
        .set({ 
          status: "cleaning", 
          currentGuest: null 
        })
        .where(
          and(
            eq(rooms.id, roomId), 
            eq(rooms.hotelId, hotelId)
          )
        )
    ]);
    
    revalidatePath(`/dashboard/pos/${hotelId}/bookings`);
    return { success: true };
  } catch (error: any) {
    console.error("DATABASE CHECKOUT ERROR:", error);
    throw new Error("Checkout failed at database level");
  }
}

export async function updateRoomStatus(roomId: string, hotelId: string, status: any) {
  await db.update(rooms)
    .set({ status })
    .where(and(eq(rooms.id, roomId), eq(rooms.hotelId, hotelId)));
  revalidatePath(`/dashboard/pos/${hotelId}/bookings`);
}

export async function addChargeToRoom(bookingId: string, hotelId: string, amount: string, description: string) {
  await db.insert(roomCharges).values({
    bookingId,
    hotelId,
    amount: amount.replace(/[^\d.]/g, ""),
    description,
  });
  revalidatePath(`/dashboard/pos/${hotelId}/bookings`);
}

export async function getDateRangeBookings(hotelId: string, startDate: Date, endDate: Date) {
  return await db.select()
    .from(bookings)
    .where(
      and(
        eq(bookings.hotelId, hotelId),
        sql`${bookings.checkIn} <= ${endDate}`,
        sql`${bookings.checkOut} >= ${startDate}`
      )
    );
}

export async function getMonthlyRevenue(hotelId: string) {
  try {
    // This SQL query groups bookings by month and sums the revenue
    const data = await db.execute(sql`
      SELECT 
        to_char(check_in, 'Mon') as month,
        SUM(total_price) as revenue,
        check_in
      FROM bookings
      WHERE hotel_id = ${hotelId}
      GROUP BY to_char(check_in, 'Mon'), check_in
      ORDER BY check_in ASC
      LIMIT 6
    `);

    return data.rows.map((row: any) => ({
      month: row.month,
      revenue: parseFloat(row.revenue || 0),
    }));
  } catch (error) {
    console.error("Revenue Query Error:", error);
    return [];
  }
}

export async function reportMaintenance(roomId: string, hotelId: string, issue: string) {
  await db.batch([
    db.insert(maintenanceTasks).values({
      roomId,
      hotelId,
      issue,
      priority: "high"
    }),
    db.update(rooms)
      .set({ status: "maintenance" })
      .where(eq(rooms.id, roomId))
  ]);
  revalidatePath(`/dashboard/pos/${hotelId}/bookings`);
}

export async function getLowStockAlerts(hotelId: string) {
  return await db.select()
    .from(inventory)
    .where(
      and(
        eq(inventory.hotelId, hotelId),
        sql`${inventory.quantity} <= ${inventory.minStockLevel}`
      )
    );
}

export async function createMaintenanceTicket(data: {
  roomId: string;
  hotelId: string;
  issue: string;
  priority: "low" | "medium" | "high" | "urgent";
}) {
  try {
    await db.batch([
      // 1. Create the ticket
      db.insert(maintenanceTasks).values({
        roomId: data.roomId,
        hotelId: data.hotelId,
        issue: data.issue,
        priority: data.priority,
        status: "pending",
      }),
      // 2. Put room into maintenance status
      db.update(rooms)
        .set({ status: "maintenance" })
        .where(eq(rooms.id, data.roomId))
    ]);

    revalidatePath(`/dashboard/pos/${data.hotelId}/bookings`);
    return { success: true };
  } catch (error) {
    throw new Error("Failed to report maintenance issue");
  }
}

export async function resolveMaintenance(taskId: string, roomId: string, hotelId: string) {
  try {
    await db.batch([
      // 1. Mark task as completed
      db.update(maintenanceTasks)
        .set({ status: "completed" })
        .where(eq(maintenanceTasks.id, taskId)),
      // 2. Make room available again
      db.update(rooms)
        .set({ status: "available" })
        .where(eq(rooms.id, roomId))
    ]);

    revalidatePath(`/dashboard/pos/${hotelId}/bookings`);
    return { success: true };
  } catch (error) {
    throw new Error("Failed to resolve maintenance");
  }
}