import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

async function reset() {
  console.log("⚠️  Resetting Database...");

  // 1. Clear existing users
  await db.delete(users);
  console.log("🗑️  Cleaned 'users' table.");

  // 2. Hash default admin password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Insert fresh admin
  await db.insert(users).values({
    name: "Platform Admin",
    email: "admin@test.com",
    password: hashedPassword,
    plan: "admin",
  });

  console.log("✅ Database reset and Admin re-seeded!");
  process.exit(0);
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});