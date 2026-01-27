"use server";

import { db } from "@/db";
import { inventory, kitchenOrders } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. GET PENDING ORDERS
export async function getKitchenOrders(hotelId: string) {
  try {
    return await db.select()
      .from(kitchenOrders)
      .where(
        and(
          eq(kitchenOrders.hotelId, hotelId),
          eq(kitchenOrders.status, "pending")
        )
      )
      .orderBy(desc(kitchenOrders.createdAt));
  } catch (e) {
    return [];
  }
}

// 2. PLACE ORDER (Call this from Terminal/POS)
export async function placeKitchenOrder(data: {
  hotelId: string;
  roomNumber: string;
  items: any[];
}) {
  await db.insert(kitchenOrders).values({
    hotelId: data.hotelId,
    roomNumber: data.roomNumber,
    orderItems: data.items,
    status: "pending",
  });
  revalidatePath(`/dashboard/pos/${data.hotelId}/kitchen`);
}

// 3. COMPLETE ORDER & DEDUCT INVENTORY
export async function completeOrder(orderId: string, hotelId: string, items: any[]) {
  // Update Order Status
  await db.update(kitchenOrders)
    .set({ status: "ready" })
    .where(eq(kitchenOrders.id, orderId));

  // Loop through items and deduct from inventory
  for (const item of items) {
    if (item.inventoryId) {
      await db.update(inventory)
        .set({ 
          quantity: sql`${inventory.quantity} - ${item.qty}`,
          updatedAt: new Date() 
        })
        .where(eq(inventory.id, item.inventoryId));
    }
  }

  revalidatePath(`/dashboard/pos/${hotelId}/kitchen`);
  revalidatePath(`/dashboard/pos/${hotelId}/inventory`);
}

// 4. INVENTORY FETCH (For the Inventory Page)
export async function getInventory(hotelId: string) {
  return await db.select().from(inventory).where(eq(inventory.hotelId, hotelId));
}