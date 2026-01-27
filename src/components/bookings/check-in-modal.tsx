"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInGuest } from "@/lib/actions/room-actions";
import { toast } from "sonner";
import { Loader2, User, DollarSign } from "lucide-react";

export function CheckInModal({ room, hotelId, isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await checkInGuest({
        hotelId,
        roomId: room.id,
        guestName: formData.get("guestName") as string,
        checkIn: new Date(formData.get("checkIn") as string),
        checkOut: new Date(formData.get("checkOut") as string),
        totalPrice: formData.get("totalPrice") as string,
      });
      toast.success(`Room ${room.number} is now Occupied`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to process check-in");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic tracking-tighter">Check-in</DialogTitle>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Room {room?.number} • {room?.type}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Guest Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input name="guestName" required className="pl-10 h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Check-in</Label>
              <Input name="checkIn" type="date" defaultValue={today} required className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Check-out</Label>
              <Input name="checkOut" type="date" defaultValue={tomorrow} required className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Stay Total Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <Input name="totalPrice" type="number" step="0.01" required className="pl-10 h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" />
            </div>
          </div>

          <Button disabled={loading} className="w-full h-16 bg-indigo-600 rounded-2xl text-xl font-black shadow-lg shadow-indigo-100 mt-4">
            {loading ? <Loader2 className="animate-spin" /> : "Confirm Arrival"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}