"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ExpenseDonutChart({ data }: { data: any[] }) {
  // 1. Group data by category and sum amounts
  const chartData = data.reduce((acc: any[], curr) => {
    const amount = parseFloat(curr.amount) || 0;
    const existing = acc.find((item) => item.name === curr.category);
    
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: curr.category || "Other", value: amount });
    }
    return acc;
  }, []);

  return (
    <Card className="col-span-1 border-none shadow-md bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number | undefined) => value !== undefined ? `₹${value.toLocaleString()}` : '₹0'}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}