"use client";

import { Button } from "@/components/ui/button";
import { Zap, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  currentPlan: string;
}

export function UpgradeButton({ currentPlan }: UpgradeButtonProps) {
  const router = useRouter();
  const isPro = currentPlan === "pro";

  return (
    <Button 
      onClick={() => router.push("/dashboard/settings/billing")}
      className="group relative w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-black py-6 rounded-2xl shadow-xl shadow-indigo-200 flex flex-col items-start px-6 gap-0"
      variant={isPro ? "outline" : "default"}
      disabled={isPro}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs uppercase tracking-tighter opacity-80 flex items-center gap-1">
          <Zap className="h-3 w-3 fill-current" /> Upgrade to Pro
        </span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
      <span className="text-lg tracking-tight">Unlock AI Power</span>
      {isPro ? "Current Plan" : "Upgrade to Pro"}
    </Button>
  );
}