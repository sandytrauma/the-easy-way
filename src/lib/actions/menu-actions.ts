"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** CATEGORY ACTIONS **/
export async function getCategories(hotelId: string) {
  return await db.select().from(categories).where(eq(categories.hotelId, hotelId));
}

export async function createCategory(hotelId: string, name: string) {
  const result = await db.insert(categories).values({ hotelId, name }).returning();
  revalidatePath(`/dashboard/pos/${hotelId}/menu`);
  return result[0];
}

/** PRODUCT ACTIONS **/
export async function getMenuItems(hotelId: string) {
  return await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      categoryId: products.categoryId,
      categoryName: categories.name,
      color: products.color,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.hotelId, hotelId));
}

export async function createMenuItem(data: { 
  hotelId: string, 
  name: string, 
  price: string, 
  categoryId: string, 
  color?: string 
}) {
  const result = await db.insert(products).values({
    hotelId: data.hotelId,
    name: data.name,
    price: data.price,
    categoryId: data.categoryId,
    color: data.color || "bg-slate-100",
  }).returning();

  revalidatePath(`/dashboard/pos/${data.hotelId}/menu`);
  return result[0];
}

export async function deleteMenuItem(id: string, hotelId: string) {
  await db.delete(products).where(and(eq(products.id, id), eq(products.hotelId, hotelId)));
  revalidatePath(`/dashboard/pos/${hotelId}/menu`);
}