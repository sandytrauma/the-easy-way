"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, Banknote, BedDouble, 
  ArrowLeft, CheckCircle2, Loader2 
} from "lucide-react";
import { toast } from "sonner";

interface CheckoutViewProps {
  total: number;
  hotelId: string;
  onClose: () => void;
  onSuccess: (roomNumber: string) => void; // Must receive a string
}

export function CheckoutView({ total, hotelId, onClose, onSuccess }: CheckoutViewProps) {
  const [method, setMethod] = useState<"card" | "cash" | "room">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");

  const handleProcess = async () => {
    setIsProcessing(true);

    try {
      if (method === "room") {
        // Validation: Ensure room number is entered
        if (!roomNumber) throw new Error("Please enter a room number");
        
        // Mock verification delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        if (roomNumber === "404") { 
          throw new Error("Room is not currently occupied.");
        }
      }

      // Finalize the transaction simulation
      await new Promise((resolve) => setTimeout(resolve, 700));
      
      toast.success(
        method === "room" 
          ? `Amount charged to Room ${roomNumber}` 
          : "Payment Successful"
      );

      // FIX: Pass the roomNumber (or "Walk-in") to the parent
      // This satisfies the (roomNumber: string) => void requirement
      const finalRoomRef = method === "room" ? roomNumber : "Walk-in";
      onSuccess(finalRoomRef);

    } catch (error: any) {
      toast.error(error.message || "Payment Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-100/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Left: Summary Panel */}
        <div className="w-full md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col justify-between">
          <div>
            <button 
              onClick={onClose} 
              className="mb-8 flex items-center gap-2 text-indigo-100 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm uppercase tracking-widest">Back</span>
            </button>
            <h2 className="text-4xl font-black mb-2 tracking-tight italic">Checkout</h2>
            <p className="text-indigo-100 opacity-80 text-[10px] font-bold uppercase tracking-widest">Property: {hotelId.slice(0, 8)}</p>
          </div>

          <div className="space-y-4">
            <div className="border-t border-indigo-500/50 pt-4">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Total Payable</p>
              <p className="text-5xl font-black mt-1 tracking-tighter italic">${total.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Tax Included (5%)</p>
              <p className="font-bold text-lg">${(total * 0.05).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Right: Payment Options */}
        <div className="flex-1 p-8 md:p-12 space-y-8 bg-white">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Method</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "card", icon: CreditCard, label: "Card" },
                { id: "cash", icon: Banknote, label: "Cash" },
                { id: "room", icon: BedDouble, label: "Room" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id as any)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                    method === item.id 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600 scale-105 shadow-sm" 
                      : "border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Input for Room Charging */}
          <div className="min-h-[120px]">
            {method === "room" ? (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Room Number</Label>
                <Input 
                  placeholder="Ex: 402"
                  autoFocus
                  className="h-14 rounded-xl border-slate-200 text-lg font-bold focus-visible:ring-indigo-600 focus-visible:ring-2 border-2"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
                <p className="text-[9px] text-amber-600 font-black uppercase tracking-tight italic">
                  Verify guest identity before charging
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                  Swipe/Insert Card to proceed
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || (method === 'room' && !roomNumber)}
              className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-indigo-700 text-white font-black text-lg italic shadow-xl transition-all active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 uppercase tracking-tighter">
                  Confirm Payment <CheckCircle2 className="h-5 w-5" />
                </span>
              )}
            </Button>
            <p className="text-center text-[8px] text-slate-300 mt-4 uppercase font-bold tracking-[0.2em]">
              Transaction Encrypted & Synced to ERP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}