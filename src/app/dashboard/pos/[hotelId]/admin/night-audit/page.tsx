"use client";

import { useState, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, AlertTriangle, Moon, 
  FileText, ShieldCheck, Loader2, TrendingUp 
} from "lucide-react";
import { runNightAudit } from "@/lib/actions/audit-actions";
import { toast } from "sonner";

export default function NightAuditPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [isSyncing, setIsSyncing] = useState(false);
  const [auditResult, setAuditResult] = useState<{processed: number, revenue: number} | null>(null);

  const handleAudit = async () => {
    setIsSyncing(true);
    try {
      const result = await runNightAudit(hotelId);
      setAuditResult({
        processed: result.processed || 0,
        revenue: result.revenue || 0
      });
      toast.success("Financial Rollover Successful");
    } catch (e) {
      toast.error("Audit failed. Check database logs.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Moon className="h-5 w-5" />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
                Night Audit
              </h1>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
              Close Business Day: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <ShieldCheck className="text-emerald-500 h-5 w-5" />
            <span className="text-[10px] font-black uppercase text-slate-500 italic">System Secure</span>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Step 1: Pre-Audit Check */}
          <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white relative overflow-hidden">
            <div className="flex gap-6">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black italic text-slate-900">1. Verification Phase</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md font-medium">
                  The system will automatically scan for pending check-outs. Ensure all guests who departed have been marked "Checked Out" to avoid erroneous charges.
                </p>
                <div className="flex gap-3 mt-6">
                   <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100">
                     AUTO-SCAN ACTIVE
                   </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 2: The Execute Action */}
          <Card className="p-10 rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <TrendingUp className="h-32 w-32" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black italic tracking-tight mb-2">2. Financial Rollover</h3>
              <p className="text-slate-400 text-sm mb-8 max-w-sm">
                Executing the audit will post daily room rates to all guest folios and finalize the Ledger for the day. This action cannot be undone.
              </p>
              
              <Button 
                onClick={handleAudit}
                disabled={isSyncing || !!auditResult}
                className="h-16 px-12 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black italic text-lg transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Ledger...
                  </>
                ) : auditResult ? (
                  "Day Closed"
                ) : (
                  "Run Audit & Post Charges"
                )}
              </Button>
            </div>
          </Card>

          {/* Step 3: Success State & Reporting */}
          {auditResult && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
               <Card className="p-8 rounded-[2.5rem] border-none bg-emerald-500 text-white shadow-2xl shadow-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic tracking-tight uppercase">Audit Complete</h3>
                      <p className="text-emerald-100 font-bold text-xs uppercase tracking-widest">Property Books Balanced</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60">Total Daily Revenue</p>
                    <p className="text-4xl font-black italic tracking-tighter">${auditResult.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}