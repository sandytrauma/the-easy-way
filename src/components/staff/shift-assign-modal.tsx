"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock } from "lucide-react";
import { createShift } from "@/lib/actions/staff-actions";
import { toast } from "sonner";

export function AssignShiftModal({ hotelId, staff }: { hotelId: string, staff: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Logic to combine current date with the selected hours
    const today = new Date();
    const startHour = parseInt(formData.get("start") as string);
    const endHour = parseInt(formData.get("end") as string);

    const startTime = new Date(today.setHours(startHour, 0, 0, 0));
    const endTime = new Date(today.setHours(endHour, 0, 0, 0));

    try {
      await createShift({
        staffId: formData.get("staffId") as string,
        hotelId,
        startTime,
        endTime,
        taskNotes: formData.get("notes") as string,
      });
      toast.success("Shift assigned successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to assign shift");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-2 border-slate-100 font-black italic">
          <CalendarDays className="mr-2 h-4 w-4" /> Assign Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter text-slate-900">
            Schedule Work Hours
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Employee</label>
            <Select name="staffId" required>
              <SelectTrigger className="rounded-xl h-12 border-slate-100 font-bold">
                <SelectValue placeholder="Who is working?" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="font-bold">
                    {s.name} ({s.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Time (24h)</label>
              <Input name="start" type="number" min="0" max="23" defaultValue="9" className="rounded-xl h-12 border-slate-100 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Time (24h)</label>
              <Input name="end" type="number" min="0" max="23" defaultValue="17" className="rounded-xl h-12 border-slate-100 font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duty Notes</label>
            <Input name="notes" placeholder="e.g. Focus on inventory audit" className="rounded-xl h-12 border-slate-100 font-bold" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 rounded-2xl font-black italic text-lg shadow-xl shadow-slate-200">
            {loading ? "Assigning..." : "Confirm Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}