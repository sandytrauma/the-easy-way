import { sql } from "drizzle-orm";
import { boolean, customType, decimal, doublePrecision, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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



// 1. Hotels (The Tenant)
export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location"),
  adminId: text("admin_id").notNull(), // Links to the User who owns the chain
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Menu Categories (linked to hotel)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name").notNull(), // e.g., "Starters", "Drinks"
});

// 3. Products/Items
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  color: text("color").default("bg-slate-100"),
});

// 4. Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  tableNumber: text("table_number"),
  status: text("status").default("pending"), // pending, paid, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ... existing hotels, products, orders tables

export const roomStatusEnum = pgEnum("room_status", ["available", "occupied", "cleaning", "maintenance"]);

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id).notNull(),
  number: text("number").notNull(),
  type: text("type").notNull(), // e.g., Deluxe, Suite
  status: roomStatusEnum("status").default("available").notNull(),
  currentGuest: text("current_guest"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  roomId: uuid("room_id").references(() => rooms.id),
  guestName: text("guest_name").notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  source: text("source").default("direct"), // direct, booking.com (future)
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  status: text("status").default("reserved").notNull(), // 'reserved', 'checked_in', 'checked_out', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const roomCharges = pgTable("room_charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  hotelId: uuid("hotel_id").references(() => hotels.id).notNull(),
  description: text("description").notNull(), // e.g., "Breakfast - Room Service"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 1. Maintenance & Housekeeping
export const maintenanceTasks = pgTable("maintenance_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  roomId: uuid("room_id").references(() => rooms.id),
  issue: text("issue").notNull(), // e.g., "AC not cooling"
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, in-progress, completed
  assignedTo: text("assigned_to"), // Staff Name
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Kitchen & Inventory
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  itemName: text("item_name").notNull(), // e.g., "Basmati Rice"
  category: text("category").notNull(), // e.g., "Kitchen", "Housekeeping"
  quantity: doublePrecision("quantity").default(0),
  unit: text("unit").default("kg"), // kg, liters, units
  minStockLevel: doublePrecision("min_stock_level").default(5), // Alert threshold
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kitchenOrders = pgTable("kitchen_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  roomNumber: text("room_number"),
  orderItems: jsonb("order_items").notNull(), // e.g. [{ name: "Burger", qty: 1 }]
  status: text("status").default("pending"), // pending, cooking, ready, served
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Staff Rostering
export const staffRoster = pgTable("staff_roster", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  staffName: text("staff_name").notNull(),
  role: text("role").notNull(), // Chef, Cleaner, Receptionist
  shiftStart: timestamp("shift_start").notNull(),
  shiftEnd: timestamp("shift_end").notNull(),
  status: text("status").default("scheduled"), // scheduled, present, absent
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'chef', 'housekeeper', 'receptionist', 'maintenance'
  phone: text("phone"),
  status: text("status").default("active"), // 'active', 'on-leave', 'terminated'
  createdAt: timestamp("created_at").defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  taskNotes: text("task_notes"), // e.g., "Deep clean 3rd floor"
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").notNull(),
  bookingId: uuid("booking_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'room_charge', 'food_bev', 'tax', 'payment'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyReports = pgTable("daily_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id").notNull(),
  reportDate: timestamp("report_date").defaultNow(),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }),
  occupancyRate: doublePrecision("occupancy_rate"),
  roomsOccupied: numeric("rooms_occupied"),
});