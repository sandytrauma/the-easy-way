"use server";

import { db } from "@/db";
import { dailyReports, transactions } from "@/db/schema";
import { eq, desc, sql, gte } from "drizzle-orm";

export async function getAdminDashboardData(hotelId: string) {
  try {
    // 1. Calculate Date Range (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 2. Fetch Daily Reports from the database
    const reports = await db
      .select()
      .from(dailyReports)
      .where(
        sql`${dailyReports.hotelId} = ${hotelId} AND ${dailyReports.reportDate} >= ${sevenDaysAgo}`
      )
      .orderBy(desc(dailyReports.reportDate));

    // 3. Aggregate Total Lifetime Revenue from Ledger
    const revenueResult = await db
      .select({ total: sql<string>`sum(amount)` })
      .from(transactions)
      .where(eq(transactions.hotelId, hotelId));

    // 4. Format data for Recharts (Chronological order)
    const chartData = [...reports].reverse().map(r => ({
      date: new Date(r.reportDate!).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      rev: Number(r.totalRevenue),
      occ: Number(r.occupancyRate)
    }));

    // 5. Calculate Metrics based on Database content
    const avgOccupancy = reports.length > 0 
      ? reports.reduce((acc, curr) => acc + Number(curr.occupancyRate), 0) / reports.length 
      : 0;

    const lastAudit = reports[0]; // Most recent audit since it's desc

    return {
      chartData,
      stats: {
        totalRevenue: Number(revenueResult[0]?.total || 0),
        avgOccupancy: avgOccupancy.toFixed(1),
        lastAuditRevenue: Number(lastAudit?.totalRevenue || 0),
        lastAuditDate: lastAudit?.reportDate || null
      }
    };
  } catch (error) {
    console.error("Database Fetch Error:", error);
    throw new Error("Failed to retrieve administrative data.");
  }
}