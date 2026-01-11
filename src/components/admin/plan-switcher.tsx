"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updatePlanAdmin } from "@/lib/actions/admin-actions";
import { Loader2, ArrowUpCircle } from "lucide-react";

export function PlanSwitcher({ userId, currentPlan }: { userId: string, currentPlan: string }) {
  const [isPending, startTransition] = useTransition();

  const togglePlan = () => {
    const nextPlan = currentPlan === "free" ? "pro" : "free";
    startTransition(async () => {
      await updatePlanAdmin(userId, nextPlan);
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={togglePlan} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4 mr-2" />}
      Set to {currentPlan === "free" ? "Pro" : "Free"}
    </Button>
  );
}