import { integer, jsonb, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  plan: varchar("plan", { length: 20 }).default("free"), // 'free', 'pro', 'enterprise'
  

  pdfCountToday: integer("pdf_count_today").default(0),
  lastPdfUpload: timestamp("last_pdf_upload").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  pdfName: text("pdf_name").notNull(),
  // Ensure this is exactly like this:
  messages: jsonb("messages").$type<{role: string, content: string}[]>().default([]).notNull(),
  extractedText: text("extracted_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appComponents = pgTable("app_components", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g., 'ai-chat', 'analytics'
  requiredPlan: varchar("required_plan").default("free"),
});