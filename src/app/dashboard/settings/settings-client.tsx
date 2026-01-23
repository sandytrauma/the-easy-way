"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Ensure shadcn progress is installed
import { Check, Zap, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

export default function SettingsClient({ user, planData }: { user: any, planData: any }) {
  const [loading, setLoading] = useState(false);
  const usagePercentage = (planData.usage / planData.limit) * 100;

  return (
    <div className="space-y-10">
      {/* BILLING & UPGRADE SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Subscription & Billing</h2>
        </div>

        <Card className="overflow-hidden border-none shadow-2xl shadow-indigo-100/50 transition-all hover:shadow-indigo-200/50">
          {/* TOP SECTION: THE UPGRADE PITCH */}
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1 fill-current" /> 
                  Currently on {planData.plan} Plan
                </Badge>
                <h3 className="text-3xl font-black tracking-tight">
                  {planData.plan === "free" ? "Upgrade to Pro AI" : "You are a Power User"}
                </h3>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  {planData.plan === "free" 
                    ? "Get unlimited PDF parsing, AI-powered resume building, and instant expense categorization."
                    : "Your subscription is active. Thank you for supporting our AI workspace."}
                </p>
              </div>

              {planData.plan === "free" && (
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-500/20 group"
                >
                  Upgrade Now
                  <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
                </Button>
              )}
            </div>
            
            {/* Background Blur Decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-500/10 blur-[80px]" />
          </div>

          {/* BOTTOM SECTION: USAGE & FEATURES */}
          <CardContent className="p-8 bg-white grid md:grid-cols-2 gap-10">
            {/* Usage Stats */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Usage</p>
                  <p className="text-xs font-bold text-slate-900">{planData.usage} / {planData.limit} PDFs</p>
                </div>
                <Progress value={usagePercentage} className="h-2 bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Billing Cycle</p>
                  <p className="text-sm font-black text-slate-900 italic">Monthly</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                  <p className="text-sm font-black text-green-600">Active</p>
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pro Benefits</p>
               <div className="grid grid-cols-1 gap-3">
                  {[
                    "Unlimited PDF Analysis",
                    "Advanced AI Models",
                    "No File Size Limits",
                    "Priority 24/7 Support"
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      {benefit}
                    </div>
                  ))}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURE FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 grayscale opacity-60">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <ShieldCheck className="h-4 w-4" /> SSL SECURED
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest italic">
             Powered by STRIPE
           </div>
        </div>
      </section>
    </div>
  );
}