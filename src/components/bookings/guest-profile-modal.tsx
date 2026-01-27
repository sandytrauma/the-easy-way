"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getGuestHistory, checkOutGuest, createMaintenanceTicket } from "@/lib/actions/room-actions";
import { Calendar, Wallet, Loader2, LogOut, Printer, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function GuestProfileModal({ guestName, hotelId, room, isOpen, onClose, onCheckoutSuccess }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (guestName && isOpen) {
      getGuestHistory(guestName, hotelId).then(setHistory);
    }
  }, [guestName, isOpen, hotelId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCheckOut = async () => {
    console.log("Attempting checkout for Room Object:", room);

    if (!room?.id) {
      toast.error("Room data is missing. Cannot check out.");
      return;
    }

    setIsCheckingOut(true);
    try {
      await checkOutGuest(room.id, hotelId);
      toast.success("Checkout Successful!");
      onCheckoutSuccess();
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-[2.5rem] max-w-lg p-8 border-none shadow-2xl print:hidden">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shrink-0">
              {guestName?.[0]}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-black italic tracking-tighter">{guestName}</DialogTitle>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Guest Folio</p>
            </div>
          </DialogHeader>

          {/* QUICK ACTIONS BAR */}
          <div className="mt-6 p-4 bg-orange-50 rounded-3xl flex items-center justify-between border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-xl text-white">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="text-xs font-black uppercase text-orange-700">Room Status Issues</p>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => {
                const issue = prompt("Describe the issue (e.g., Broken AC):");
                if (issue && room?.id) {
                  createMaintenanceTicket({
                    roomId: room.id,
                    hotelId: hotelId,
                    issue: issue,
                    priority: "high"
                  }).then(() => {
                    toast.success("Maintenance reported. Room locked.");
                    onClose();
                    onCheckoutSuccess();
                  });
                }
              }}
              className="text-orange-600 hover:bg-orange-100 font-black text-[10px] uppercase tracking-wider"
            >
              Report Issue
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="h-14 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50"
            >
              <Printer className="h-5 w-5 mr-2" /> Bill
            </Button>
            
            <Button 
              onClick={handleCheckOut}
              disabled={isCheckingOut}
              className="col-span-2 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-rose-100"
            >
              {isCheckingOut ? <Loader2 className="animate-spin" /> : <><LogOut className="mr-2 h-5 w-5" /> Check Out</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* HIDDEN PRINTABLE INVOICE */}
      <div className="hidden print:block p-10 bg-white text-black font-sans w-full">
        <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Invoice</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Official Stay Summary</p>
          </div>
          <div className="text-right">
             <h2 className="text-xl font-black uppercase tracking-tighter italic">Hotel POS System</h2>
             <p className="text-xs font-bold text-slate-400">Transaction Date: {mounted ? new Date().toLocaleDateString() : "--/--/----"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Bill To:</p>
            <p className="text-xl font-black">{guestName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Room Details:</p>
            <p className="text-xl font-black uppercase tracking-tighter italic">Room {room?.number} - {room?.type}</p>
          </div>
        </div>

        <div className="w-full border-t-2 border-black pt-6">
          <div className="flex justify-between items-center py-2">
            <p className="font-bold uppercase tracking-tighter">Stay Total</p>
            <p className="text-2xl font-black italic tracking-tighter">
              ${Number(history[0]?.totalPrice || 0).toFixed(2)}
            </p>
          </div>
          <div className="mt-20 text-center border-t border-slate-100 pt-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Thank you for your stay. Please visit us again.</p>
          </div>
        </div>
      </div>
    </>
  );
}