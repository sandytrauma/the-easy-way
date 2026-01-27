"use client";

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Moon, Sun, Sunrise } from "lucide-react";
import { useEffect, useState } from "react";

const SHIFT_HOURS = [0, 4, 8, 12, 16, 20];

export function ShiftRoster({ staff, shifts }: { staff: any[], shifts: any[] }) {
  const [nowPosition, setNowPosition] = useState<number | null>(null);

  // Update the "Current Time" line position
  useEffect(() => {
    const updateMarker = () => {
      const now = new Date();
      const decimalHour = now.getHours() + now.getMinutes() / 60;
      setNowPosition((decimalHour / 24) * 100);
    };

    updateMarker();
    const interval = setInterval(updateMarker, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter text-slate-900">Daily Coverage</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Shift Timeline</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <Sunrise className="h-3 w-3 text-orange-400" /> Morning
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <Sun className="h-3 w-3 text-indigo-400" /> Afternoon
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <Moon className="h-3 w-3 text-slate-900" /> Night
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-100">
        {/* THE "NOW" MARKER LINE */}
        {nowPosition !== null && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none"
            style={{ left: `calc(${nowPosition}% + 128px)` }} // 128px matches the ml-32 label width
          >
            <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-rose-500 shadow-lg shadow-rose-200" />
          </div>
        )}

        <div className="flex border-b border-slate-50 ml-32">
          {SHIFT_HOURS.map((hour) => (
            <div key={hour} className="flex-1 py-4 text-[10px] font-black text-slate-300 border-l border-slate-50 pl-2">
              {hour === 0 ? "12 AM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>

        <div className="divide-y divide-slate-50">
          {staff.map((member) => (
            <div key={member.id} className="flex h-20 group relative">
              <div className="w-32 shrink-0 flex flex-col justify-center border-r border-slate-50 bg-slate-50/30 px-4 group-hover:bg-indigo-50/50 transition-colors z-10">
                <p className="font-bold text-slate-900 text-xs truncate">{member.name}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 italic">{member.role}</p>
              </div>

              <div className="flex-1 relative flex items-center bg-white overflow-hidden">
                {/* Subtle Background Grid for each row */}
                <div className="absolute inset-0 flex">
                  {SHIFT_HOURS.map((h) => <div key={h} className="flex-1 border-l border-slate-50/50" />)}
                </div>

                {shifts
                  .filter((s) => s.staffId === member.id)
                  .map((shift) => {
                    const start = new Date(shift.startTime);
                    const end = new Date(shift.endTime);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;
                    
                    let duration = endHour - startHour;
                    if (duration < 0) duration += 24; 

                    return (
                      <div
                        key={shift.id}
                        className="absolute h-10 bg-slate-900 rounded-2xl flex items-center px-4 border-2 border-white shadow-lg hover:scale-[1.02] transition-transform cursor-pointer z-10 group/bar"
                        style={{ 
                          left: `${(startHour / 24) * 100}%`, 
                          width: `${(duration / 24) * 100}%`,
                          minWidth: '60px' 
                        }}
                      >
                         <div className="hidden group-hover/bar:block absolute -top-12 left-0 bg-slate-900 text-white text-[9px] p-3 rounded-xl z-50 shadow-2xl border border-white/10 min-w-[120px]">
                          <p className="font-black italic uppercase text-indigo-400 mb-1">Shift Details</p>
                          <p className="font-bold opacity-80">{shift.taskNotes || "Standard Duty"}</p>
                        </div>
                        <span className="text-[9px] font-black italic text-white truncate">
                          {format(start, "HH:mm")} - {format(end, "HH:mm")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}