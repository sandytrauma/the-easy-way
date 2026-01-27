"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eraser, Loader2, Sparkles } from "lucide-react";
import { getHousekeepingData, updateRoomToClean } from "@/lib/actions/housekeeping-actions";
import { toast } from "sonner";

export default function HousekeepingPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [data, setData] = useState<any>({ dirtyRooms: [], cleaningStaff: [] });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getHousekeepingData(hotelId);
    setData(res);
    setLoading(false);
  }, [hotelId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleComplete = async (roomId: string) => {
    try {
      await updateRoomToClean(roomId, hotelId);
      toast.success("Room marked as Available!");
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Housekeeping</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Floor Operations</p>
          </div>
          <div className="bg-indigo-600 px-4 py-2 rounded-2xl text-white font-black italic text-sm">
            {data.dirtyRooms.length} Pending Rooms
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.dirtyRooms.map((room: any) => (
              <Card key={room.id} className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                      <Eraser className="h-6 w-6" />
                    </div>
                    <Badge className="bg-slate-900 text-white font-black italic rounded-lg">
                      {room.type}
                    </Badge>
                  </div>
                  <h3 className="text-5xl font-black tracking-tighter mb-1">Room {room.number}</h3>
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-6">
                    Requires Deep Clean
                  </p>
                </div>

                <Button 
                  onClick={() => handleComplete(room.id)}
                  className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black italic text-lg shadow-lg shadow-emerald-100"
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Mark as Ready
                </Button>
              </Card>
            ))}

            {data.dirtyRooms.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-black italic text-slate-900">All Rooms Cleaned</h2>
                <p className="text-slate-400 font-bold text-xs uppercase">Great job, team!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}