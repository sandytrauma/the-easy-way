"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { addInventoryItem } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";

export function AddInventoryModal({ hotelId, onSuccess }: { hotelId: string, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addInventoryItem({
        hotelId,
        itemName: formData.get("name") as string,
        category: formData.get("category") as string,
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit") as string,
        minStockLevel: Number(formData.get("min")),
      });
      toast.success("Item added to stock");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-indigo-600 font-bold">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-none p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter">New Stock Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input name="name" placeholder="Item Name (e.g. Flour)" className="rounded-xl border-slate-100 font-bold" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="category" placeholder="Category" className="rounded-xl border-slate-100 font-bold" required />
            <Input name="unit" placeholder="Unit (kg, L, pcs)" className="rounded-xl border-slate-100 font-bold" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="quantity" type="number" placeholder="Initial Qty" className="rounded-xl border-slate-100 font-bold" required />
            <Input name="min" type="number" placeholder="Min Alert Lvl" className="rounded-xl border-slate-100 font-bold" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 h-12 font-black italic">
            {loading ? "Registering..." : "Add to Inventory"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}