import { sql } from "drizzle-orm";
import { boolean, customType, doublePrecision, integer, jsonb, numeric, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const pgVector = customType<{ data: number[] }>({
  dataType() {
    return "vector(768)"; 
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown) {
    if (typeof value === 'string') {
      return JSON.parse(value) as number[];
    }
    return value as number[];
  }
});

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

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  vendor: text("vendor"),
  date: text("date"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  category: text("category"), // e.g., Travel, Food, Software
  taxAmount: numeric("taxAmount", { precision: 10, scale: 2 }),
  currency: text("currency").default("INR"),
  rawText: text("rawText"), // Store full text just in case
  createdAt: timestamp("created_at").defaultNow(),
});



export const salarySlips = pgTable("salary_slips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // Ensure userId exists here
  userId: text("user_id").notNull(), 
  employeeName: text("employee_name").notNull(),
  month: text("month").notNull(),
  
  // These must match the keys used in your .values() block
  basic: doublePrecision("basic").notNull(),
  hra: doublePrecision("hra").notNull(),
  specialAllowance: doublePrecision("special_allowance").notNull(),
  
  // Change 'taxAmount' to 'tds' if you prefer, or keep it consistent
  taxAmount: doublePrecision("tax_amount").default(0),
  deductions: doublePrecision("deductions").default(0),
  netPay: doublePrecision("net_pay").notNull(),
  
  complianceAuditLog: text("compliance_audit_log"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceDocs = pgTable("compliance_docs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  region: text("region").default("General"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceEmbeddings = pgTable("compliance_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  docId: uuid("doc_id").references(() => complianceDocs.id),
  content: text("content").notNull(), // The actual text (e.g., "Section 80C limit is ₹1.5L")
  embedding: pgVector("embedding").notNull(), 
  metadata: text("metadata"),// e.g., { page: 5, region: "India" }
});