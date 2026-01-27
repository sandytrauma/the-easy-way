"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);

  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Financial Performance
          </p>
          <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">
            Monthly Revenue
          </h3>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="font-black text-xs">Live Data</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 h-48 px-2">
        {data.length > 0 ? data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div className="relative w-full flex justify-center items-end h-32">
              {/* Tooltip */}
              <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ${item.revenue.toLocaleString()}
              </div>
              {/* Bar */}
              <div 
                className="w-full max-w-[40px] bg-indigo-600 rounded-t-xl transition-all duration-500 group-hover:bg-indigo-400"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {item.month}
            </p>
          </div>
        )) : (
          <div className="w-full flex items-center justify-center italic text-slate-300">
            No revenue data recorded yet
          </div>
        )}
      </div>
    </Card>
  );
}