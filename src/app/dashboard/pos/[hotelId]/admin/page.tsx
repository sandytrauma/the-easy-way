"use client";

import { use, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, Users, TrendingUp, 
  Loader2, Activity, ShieldCheck 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";
// UPDATED IMPORT
import { getAdminDashboardData } from "@/lib/actions/pos-admin-actions";

export default function AdminDashboard({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getAdminDashboardData(hotelId);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [hotelId]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest italic">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-100/50 min-h-screen space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
            Property Analytics
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Activity className="h-3 w-3 text-indigo-500" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              Live Feed • ID: {hotelId.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase italic">Audit Verified</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Gross Ledger Revenue" 
          value={`$${data.stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          subText="Lifetime Property Income"
        />
        <StatCard 
          title="7-Day Avg Occupancy" 
          value={`${data.stats.avgOccupancy}%`} 
          icon={Users} 
          subText="Verified via Night Audit"
        />
        <StatCard 
          title="Last Audit Yield" 
          value={`$${data.stats.lastAuditRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          subText={data.stats.lastAuditDate ? `Closed on ${new Date(data.stats.lastAuditDate).toLocaleDateString()}` : "No audit yet"}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 rounded-[3rem] border-none shadow-2xl bg-white">
          <h3 className="text-xl font-black italic tracking-tight mb-8 uppercase text-slate-900">
            Revenue Performance
          </h3>
          <div className="h-[350px] w-full">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} 
                    dy={10} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rev" 
                    stroke="#4f46e5" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Run your first Night Audit to see trends." />
            )}
          </div>
        </Card>

        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-white">
          <h3 className="text-xl font-black italic tracking-tight mb-8 uppercase text-slate-900">
            Occupancy Pulse
          </h3>
          <div className="h-[350px] w-full">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <Bar dataKey="occ" radius={[12, 12, 12, 12]}>
                    {data.chartData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.occ > 75 ? '#4f46e5' : '#e2e8f0'} 
                      />
                    ))}
                  </Bar>
                  <Tooltip cursor={{fill: 'transparent'}} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Occupancy data pending." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subText }: any) {
  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white group hover:-translate-y-1 transition-all">
      <div className="p-3 w-fit rounded-2xl bg-slate-900 text-white mb-6">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter text-slate-900 mt-1 mb-2">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest">{subText}</p>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
  );
}