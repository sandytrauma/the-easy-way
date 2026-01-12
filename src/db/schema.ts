import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  image: text("image"),
  // --- New Settings & Permission Fields ---
  plan: text("plan").default("free").notNull(), // 'free', 'pro', 'admin'
  pdfCountToday: integer("pdf_count_today").default(0),
  lastPdfUpload: timestamp("last_pdf_upload"),
  // -----------------------------------------  
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
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


export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").default("My Resume"),
  data: jsonb("data").$type<{
    personalInfo: { name: string, email: string, phone: string, bio: string },
    experience: { company: string, role: string, duration: string, desc: string }[],
    education: { school: string, degree: string, year: string }[],
    skills: string[]
  }>().notNull(),
  template: text("template").default("vibrant"),
  isPaid: boolean("is_paid").default(false), // Track payment status
  createdAt: timestamp("created_at").defaultNow(),
});