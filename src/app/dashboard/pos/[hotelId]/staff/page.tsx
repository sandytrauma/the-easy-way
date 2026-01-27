"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, ShieldCheck, Mail, Phone, Loader2, BadgeCheck } from "lucide-react";
import { getDailyShifts, getStaff } from "@/lib/actions/staff-actions";
import { AddStaffModal } from "@/components/staff/add-staff-modal";
import { ShiftRoster } from "@/components/staff/shift-roster";
import { AssignShiftModal } from "@/components/staff/shift-assign-modal";

export default function StaffPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyShifts, setDailyShifts] = useState<any[]>([]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    const data = await getStaff(hotelId);
    setStaffList(data);
    setLoading(false);
  }, [hotelId]);

  const loadData = useCallback(async () => {
  setLoading(true);
  const [staffData, shiftsData] = await Promise.all([
    getStaff(hotelId),
    getDailyShifts(hotelId, new Date())
  ]);
  setStaffList(staffData);
  setDailyShifts(shiftsData);
  setLoading(false);
}, [hotelId]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Team Directory</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Human Resources & Access</p>
          </div><div className="flex gap-3">
  <AssignShiftModal hotelId={hotelId} staff={staffList} />
  <AddStaffModal hotelId={hotelId} onSuccess={loadStaff} />
</div>
        </div>
        <div className="mb-10">
  <ShiftRoster staff={staffList} shifts={dailyShifts} />
</div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="px-8 font-black uppercase text-[10px] text-slate-400">Employee</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400">Role</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400">Status</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400 text-right">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((member) => (
                  <TableRow key={member.id} className="border-slate-50 group transition-colors">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">ID: {member.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600">On Duty</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Phone className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Mail className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}