"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createMenuItem, getCategories } from "@/lib/actions/menu-actions"; 

export function AddMenuItemModal({ hotelId, onRefresh }: { hotelId: string, onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      getCategories(hotelId).then(setCategoriesList);
    }
  }, [open, hotelId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMenuItem({
        hotelId,
        name: formData.get("name") as string,
        price: formData.get("price") as string,
        categoryId: formData.get("categoryId") as string,
        color: formData.get("color") as string,
      });
      toast.success("Product added");
      setOpen(false);
      onRefresh();
    } catch (error) {
      toast.error("Error saving product. Ensure category is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 rounded-xl">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="font-black">New Product</DialogTitle></DialogHeader>
        {categoriesList.length === 0 ? (
          <div className="p-6 text-center space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <p className="text-sm text-slate-500">You must create a category first!</p>
            <Button onClick={() => setOpen(false)} variant="outline">Close & Create Category</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Item Name" required className="rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Input name="price" type="number" step="0.01" placeholder="Price" required className="rounded-xl" />
              <Select name="categoryId" required>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categoriesList.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select name="color" defaultValue="bg-slate-100">
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="UI Color" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="bg-orange-100">Orange</SelectItem>
                    <SelectItem value="bg-blue-100">Blue</SelectItem>
                    <SelectItem value="bg-green-100">Green</SelectItem>
                </SelectContent>
            </Select>
            <Button disabled={loading} className="w-full bg-indigo-600 rounded-xl h-12">
              {loading ? <Loader2 className="animate-spin" /> : "Save Product"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}