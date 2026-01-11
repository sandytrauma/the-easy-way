import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("--- 🏁 Seeding started ---");

  // 1. Hash the password correctly
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Insert the user with the hashed password
  try {
    await db.insert(users).values({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword, // Storing the hash, NOT plain text
      plan: "admin", // Giving them admin rights for your new dashboard
    });

    console.log("--- ✅ Seed successful: User admin@test.com created ---");
  } catch (error) {
    console.error("--- ❌ Seed failed (User might already exist):", error);
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});