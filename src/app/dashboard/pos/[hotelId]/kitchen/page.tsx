"use client";

import { useEffect, useState, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getKitchenOrders, completeOrder } from "@/lib/actions/kitchen-actions";
import { CheckCircle2, Clock, Utensils, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function KitchenKDS({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const data = await getKitchenOrders(hotelId);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, [hotelId]);

  const handleBump = async (orderId: string, items: any[]) => {
    try {
      await completeOrder(orderId, hotelId, items);
      toast.success("Order pushed to service");
      fetchOrders();
    } catch (e) {
      toast.error("Process failed");
    }
  };

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Kitchen <span className="text-indigo-500">Live</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Active Prep Queue</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">Syncing with POS Terminal</span>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-slate-800 border-none p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between border-t-4 border-indigo-500">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-slate-400">
                    #{order.id.slice(-4).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 font-black italic text-2xl tracking-tighter">
                    <Utensils className="h-4 w-4" /> Room {order.roomNumber}
                  </div>
                </div>

                <div className="space-y-4">
                  {(order.orderItems as any[]).map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white leading-none">{item.name}</span>
                        {item.notes && <span className="text-[10px] text-amber-500 font-bold italic mt-1">{item.notes}</span>}
                      </div>
                      <span className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                        {item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                  <Clock className="h-3 w-3" /> Received {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button 
                  onClick={() => handleBump(order.id, order.orderItems as any[])}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic shadow-lg shadow-indigo-900/20"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Bump to Ready
                </Button>
              </div>
            </Card>
          ))}
          
          {orders.length === 0 && (
            <div className="col-span-full py-40 flex flex-col items-center opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
              <Utensils className="h-16 w-16 mb-4" />
              <h2 className="text-3xl font-black italic uppercase tracking-widest">Kitchen Clear</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}