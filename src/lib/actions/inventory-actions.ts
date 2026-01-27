"use server";

import { db } from "@/db";
import { inventory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addInventoryItem(data: {
  hotelId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
}) {
  await db.insert(inventory).values({
    hotelId: data.hotelId,
    itemName: data.itemName,
    category: data.category,
    quantity: data.quantity,
    unit: data.unit,
    minStockLevel: data.minStockLevel,
  });
  
  revalidatePath(`/dashboard/inventory/${data.hotelId}`);
}

export async function updateStock(itemId: string, hotelId: string, amount: number) {
  await db.update(inventory)
    .set({ 
      quantity: sql`${inventory.quantity} + ${amount}`,
      updatedAt: new Date() 
    })
    .where(eq(inventory.id, itemId));

  revalidatePath(`/dashboard/inventory/${hotelId}`);
}