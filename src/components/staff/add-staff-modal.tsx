"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { addStaffMember } from "@/lib/actions/staff-actions";
import { toast } from "sonner";

export function AddStaffModal({ hotelId, onSuccess }: { hotelId: string, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addStaffMember({
        hotelId,
        name: formData.get("name") as string,
        role: formData.get("role") as string,
      });
      toast.success("New employee registered");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to hire staff");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-slate-900 font-black italic">
          <UserPlus className="mr-2 h-4 w-4" /> Hire Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-none p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter">New Employee Onboarding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input name="name" placeholder="Full Name" className="rounded-xl border-slate-100 font-bold" required />
          <Select name="role" required>
            <SelectTrigger className="rounded-xl border-slate-100 font-bold">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="chef">Chef</SelectItem>
              <SelectItem value="cleaner">Housekeeper</SelectItem>
              <SelectItem value="maintenance">Maintenance Technician</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 h-12 font-black italic">
            {loading ? "Registering..." : "Onboard Staff"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}