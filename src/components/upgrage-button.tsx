"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { upgradeToPro } from "@/lib/actions/upgrade";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function UpgradeButton({ currentPlan }: { currentPlan: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpgrade = () => {
    startTransition(async () => {
      const result = await upgradeToPro();
      if (result.success) {
        router.push("/dashboard");
      }
    });
  };

  if (currentPlan === "pro") {
    return <Button className="w-full" disabled>Active</Button>;
  }

  return (
    <Button className="w-full" onClick={handleUpgrade} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
    </Button>
  );
}