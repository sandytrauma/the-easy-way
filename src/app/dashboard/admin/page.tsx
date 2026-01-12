import { db } from "@/db";
import { users } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { desc, sql } from "drizzle-orm";
import { PlanSwitcher } from "@/components/admin/plan-switcher";
import { Users, Crown, Zap, Clock } from "lucide-react";

export default async function AdminPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  // Calculate quick stats
  const totalUsers = allUsers.length;
  const proUsers = allUsers.filter(u => u.plan === "pro").length;
  const newThisMonth = allUsers.filter(u => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return u.createdAt && u.createdAt > monthAgo;
  }).length;

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Control Center</h1>
        <p className="text-slate-500">Manage user permissions, monitor plans, and track platform growth.</p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-400 mt-1">Users across all tiers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Pro Subscribers</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proUsers}</div>
            <p className="text-xs text-slate-400 mt-1">
              {((proUsers / totalUsers) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">New (30 Days)</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newThisMonth}</div>
            <p className="text-xs text-slate-400 mt-1">Recent platform growth</p>
          </CardContent>
        </Card>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <Card className="shadow-xl border-none overflow-hidden bg-white">
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent Activity
            </h2>
            <Badge variant="outline" className="bg-white">{totalUsers} Users Total</Badge>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[250px]">User Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Subscription Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.plan === "pro" ? "default" : "secondary"} 
                    className={`capitalize shadow-sm ${user.plan === 'pro' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  >
                    {user.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 text-sm italic">
                  {user.createdAt?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <PlanSwitcher userId={user.id} currentPlan={user.plan!} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}