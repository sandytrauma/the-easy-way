import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  Sparkles, 
  LayoutDashboard, 
  ArrowRight, 
  UserSquare2, 
  Receipt, 
  TrendingUp 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userPlan = (session?.user as any)?.plan || "free";
  const userName = session?.user?.name?.split(" ")[0] || "User";

  const tools = [
    {
      title: "Chat with PDF",
      description: "Summarize complex documents, extract key data points, and chat with your files in real-time.",
      href: "/dashboard/app/chat-pdf",
      icon: FileText,
      color: "bg-indigo-600",
      shadow: "shadow-indigo-200",
      accent: "from-indigo-50/50",
      status: "Ready",
      isPro: false,
    },
    {
      title: "Resume Builder",
      description: "AI-powered resume maker that crafts professional, ATS-friendly templates tailored to job descriptions.",
      href: "/dashboard/app/resume-maker",
      icon: UserSquare2,
      color: "bg-emerald-600",
      shadow: "shadow-emerald-200",
      accent: "from-emerald-50/50",
      status: "AI Enabled",
      isPro: true,
    },
    {
      title: "Expense Tracker",
      description: "Scan receipts and automatically categorize your spending with intelligent financial insights.",
      href: "/dashboard/app/expenses",
      icon: Receipt,
      color: "bg-rose-600",
      shadow: "shadow-rose-200",
      accent: "from-rose-50/50",
      status: "New",
      isPro: true,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Overview</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Hi, {userName}
          </h1>
          <p className="text-slate-500 text-lg">Your intelligent workspace is ready.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1.5 border-slate-200 bg-white shadow-sm font-semibold capitalize">
            {userPlan} Plan
          </Badge>
          {userPlan === "free" && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
              Upgrade to Pro
            </Button>
          )}
        </div>
      </header>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Usage Limit", value: "72%", icon: TrendingUp, color: "text-indigo-600" },
          { label: "Active Tools", value: "3", icon: LayoutDashboard, color: "text-emerald-600" },
          { label: "Saved Docs", value: "24", icon: FileText, color: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TOOLS GRID */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Productivity Suite</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.title} className="group">
              <Card className="relative h-full overflow-hidden border-slate-200 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <CardContent className="p-8 space-y-5">
                  <div className={`h-14 w-14 ${tool.color} rounded-2xl flex items-center justify-center shadow-lg ${tool.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {tool.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400 group-hover:text-indigo-600" />
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-tighter">
                      {tool.isPro && userPlan === "free" ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">PRO ONLY</Badge>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 uppercase">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                          {tool.status}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}