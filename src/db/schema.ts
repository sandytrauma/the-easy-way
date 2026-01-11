import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  plan: varchar("plan", { length: 20 }).default("free"), // 'free', 'pro', 'enterprise'
  createdAt: timestamp("created_at").defaultNow(),
});

export const appComponents = pgTable("app_components", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g., 'ai-chat', 'analytics'
  requiredPlan: varchar("required_plan").default("free"),
});