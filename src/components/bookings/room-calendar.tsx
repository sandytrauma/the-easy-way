"use client";

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval,
  startOfDay
} from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RoomCalendar({ rooms, bookings }: { rooms: any[], bookings: any[] }) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  return (
    <Card className="p-0 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="inline-block min-w-full align-middle">
          
          {/* CALENDAR HEADER: DATES */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <div className="w-32 shrink-0 p-6 border-r border-slate-100 bg-white sticky left-0 z-10">
              <p className="font-black italic text-[10px] uppercase tracking-widest text-slate-400">Room</p>
            </div>
            {days.map((day) => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "w-16 shrink-0 py-4 text-center border-r border-slate-100/50",
                  isSameDay(day, today) && "bg-indigo-50/50"
                )}
              >
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{format(day, "EEE")}</p>
                <p className={cn(
                  "text-sm font-black tracking-tighter",
                  isSameDay(day, today) ? "text-indigo-600" : "text-slate-900"
                )}>
                  {format(day, "d")}
                </p>
              </div>
            ))}
          </div>

          {/* CALENDAR BODY: ROOM ROWS */}
          <div className="relative">
            {rooms.sort((a,b) => a.number.localeCompare(b.number)).map((room) => (
              <div key={room.id} className="flex h-16 border-b border-slate-50 group relative">
                
                {/* Fixed Room Number Column */}
                <div className="w-32 shrink-0 p-4 border-r border-slate-100 font-black text-slate-900 bg-white sticky left-0 z-10 flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-xs">
                    {room.number}
                  </div>
                  <span className="text-xs uppercase tracking-tighter opacity-40">{room.type[0]}</span>
                </div>

                {/* Grid Cells (Background) */}
                {days.map((day) => (
                  <div 
                    key={day.toISOString()} 
                    className={cn(
                      "w-16 shrink-0 border-r border-slate-50/50",
                      isSameDay(day, today) && "bg-indigo-50/20"
                    )}
                  />
                ))}

                {/* Booking Bars (Absolute Positioned) */}
                {bookings
                  .filter((b) => b.roomId === room.id)
                  .map((booking) => {
                    const checkIn = startOfDay(new Date(booking.checkIn));
                    const checkOut = startOfDay(new Date(booking.checkOut));
                    
                    // Logic to find grid position
                    const startIndex = days.findIndex(d => isSameDay(d, checkIn));
                    const endIndex = days.findIndex(d => isSameDay(d, checkOut));
                    
                    // If booking is outside current month view, skip or clip
                    if (startIndex === -1 && endIndex === -1) return null;

                    const displayStart = startIndex === -1 ? 0 : startIndex;
                    const displayEnd = endIndex === -1 ? days.length - 1 : endIndex;
                    const duration = (displayEnd - displayStart) + 1;

                    return (
                      <div
                        key={booking.id}
                        className="absolute top-3 h-10 bg-indigo-600 rounded-full text-[10px] font-black text-white flex items-center px-4 shadow-md shadow-indigo-100/50 hover:bg-indigo-700 transition-all cursor-pointer z-0 group-hover:z-20 truncate border-2 border-white"
                        style={{
                          left: `${128 + (displayStart * 64)}px`, // 128px (Room Col) + (Index * Cell Width)
                          width: `${duration * 64 - 4}px`, // Cell Width * Duration - small gap
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          {booking.guestName}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}