"use client";

import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/actions/expense-actions";
import { toast } from "sonner";
import { useState } from "react";

export function DeleteExpenseBtn({ id, userPlan }: { id: number, userPlan: string }) {
  const [loading, setLoading] = useState(false);

  if (userPlan === "free") return null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    setLoading(true);
    const res = await deleteExpense(id);
    if (res.success) toast.success("Deleted!");
    else toast.error(res.error || "Error");
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}