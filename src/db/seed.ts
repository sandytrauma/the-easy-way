import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("--- Seeding started ---");

  await db.insert(users).values({
    name: "Test Admin",
    email: "admin@test.com",
    password: "password123", // Note: In a real app, hash this!
    plan: "pro",
  });

  console.log("--- Seed successful: User admin@test.com created ---");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});