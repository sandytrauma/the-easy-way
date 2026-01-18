import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import ExpenseClient from "./expense-client";
import { Card } from "@/components/ui/card";
import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { Download } from "lucide-react";
import ExcelExportBtn from "./excel-export-btn";
import { DeleteExpenseBtn } from "./delete-btn";
// Import the new Chart component
import ExpenseDonutChart from "./expense-chart"; 

export default async function ExpensePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const userPlan = (session?.user as any)?.plan || "free";

  const data = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.createdAt));

  const totalSpent = data.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
        <div className="flex gap-2">
          {userPlan !== "free" && <ExcelExportBtn data={data} />}
          <ExpenseClient userPlan={userPlan} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600"><Wallet /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
            <p className="text-xl font-bold">₹{totalSpent.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Receipt /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Receipts</p>
            <p className="text-xl font-bold">{data.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600"><TrendingUp /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Latest Vendor</p>
            <p className="text-xl font-bold">{data[0]?.vendor || "N/A"}</p>
          </div>
        </Card>
      </div>

      {/* New Layout Section: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (Takes 1/3 of the width on large screens) */}
        <div className="lg:col-span-1">
          <ExpenseDonutChart data={data} />
        </div>

        {/* Table Column (Takes 2/3 of the width on large screens) */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-none shadow-xl bg-white h-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs uppercase text-slate-500 font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      No expenses found. Upload a receipt to get started.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500">{item.date}</td>
                      <td className="p-4 font-bold text-slate-800">{item.vendor}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase tracking-tighter">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-indigo-600">₹{item.amount}</td>
                      <td className="p-4 text-center">
                        <DeleteExpenseBtn id={item.id} userPlan={userPlan} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}