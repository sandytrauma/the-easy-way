"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Added for redirect
import { Button } from "@/components/ui/button";
import { uploadAndProcessExpense } from "@/lib/actions/expense-actions";
import { Loader2, Plus, Lock } from "lucide-react"; // Added Lock icon
import { toast } from "sonner";

interface ExpenseClientProps {
  userPlan: string;
}

export default function ExpenseClient({ userPlan }: ExpenseClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if user has access
  const isPro = userPlan === "pro" || userPlan === "admin";

  const handleButtonClick = (e: React.MouseEvent) => {
    if (!isPro) {
      e.preventDefault();
      toast.error("AI Receipt Tracking is a Pro feature!");
      // Change this to your actual checkout or billing route
      router.push("/dashboard/billing"); 
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAndProcessExpense(formData);
    
    if (res.success) {
      toast.success("Expense added successfully!");
    } else {
      toast.error(res.error || "Error uploading");
    }
    
    setLoading(false);
  };

  return (
    <div>
      {/* Input only works if Pro */}
      <input 
        type="file" 
        id="exp-up" 
        hidden 
        onChange={handleUpload} 
        disabled={loading || !isPro} 
        accept=".pdf,image/jpeg,image/png,image/webp"
      />
      
      <Button 
        asChild 
        onClick={handleButtonClick} 
        variant={isPro ? "default" : "secondary"}
        className={!isPro ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" : ""}
      >
        <label htmlFor={isPro ? "exp-up" : ""} className="cursor-pointer flex items-center gap-2">
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : isPro ? (
            <Plus size={18} />
          ) : (
            <Lock size={16} /> 
          )}
          {loading ? "AI is Extracting..." : isPro ? "Add Receipt" : "Upgrade to Unlock AI"}
        </label>
      </Button>
    </div>
  );
}