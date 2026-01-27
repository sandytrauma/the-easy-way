"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BedDouble, Plus, Loader2, UserCheck, RefreshCw, Calendar as CalendarIcon, LayoutGrid, Wrench } from "lucide-react";
import { getRooms, createRoom, updateRoomStatus, checkOutGuest, getDateRangeBookings, getMonthlyRevenue } from "@/lib/actions/room-actions";
import { CheckInModal } from "@/components/bookings/check-in-modal";
import { GuestProfileModal } from "@/components/bookings/guest-profile-modal"; 
import { RoomCalendar } from "@/components/bookings/room-calendar"; // Ensure you create this component
import { toast } from "sonner";
import { endOfMonth, startOfMonth } from "date-fns";
import { RevenueChart } from "@/components/bookings/revenue-chart";

export default function BookingsPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [guestProfile, setGuestProfile] = useState<{ name: string } | null>(null);
  const [view, setView] = useState<'grid' | 'calendar'>('grid');
  const [allBookings, setAllBookings] = useState<any[]>([]);

  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Calculate stats from your existing roomsList
  const totalRooms = roomsList.length;
  const occupiedCount = roomsList.filter(r => r.status === 'occupied').length;
  const cleaningCount = roomsList.filter(r => r.status === 'cleaning').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Replaced loadRooms with loadData to fetch everything for the calendar
  const loadData = useCallback(async () => {
  setLoading(true);
  const [roomsData, bookingsData, revenue] = await Promise.all([
    getRooms(hotelId),
    getDateRangeBookings(hotelId, startOfMonth(new Date()), endOfMonth(new Date())),
    getMonthlyRevenue(hotelId) // Fetch revenue data
  ]);
  setRoomsList(roomsData);
  setAllBookings(bookingsData);
  setRevenueData(revenue);
  setLoading(false);
}, [hotelId]);

  const handleMassClean = async () => {
    if (confirm("Mark all cleaning rooms as Available?")) {
      const cleaningRooms = roomsList.filter(r => r.status === 'cleaning');
      
      if (cleaningRooms.length === 0) {
        toast.error("No rooms currently need cleaning");
        return;
      }

      try {
        await Promise.all(
          cleaningRooms.map(r => updateRoomStatus(r.id, hotelId, 'available'))
        );
        loadData();
        toast.success("All rooms are now ready!");
      } catch (error) {
        toast.error("Failed to reset rooms");
      }
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  const handleRoomAction = (room: any) => {
  if (room.status === "available") {
    setSelectedRoom(room);
  } 
  else if (room.status === "occupied") {
    setGuestProfile({ name: room.currentGuest });
  } 
  else if (room.status === "maintenance") {
    // Maintenance Resolve Flow
    if (confirm(`Is Room ${room.number} fixed and ready for cleaning?`)) {
      // Set to cleaning first so housekeeping can double-check it
      updateRoomStatus(room.id, hotelId, "cleaning").then(loadData);
      toast.success("Maintenance cleared. Room sent to Housekeeping.");
    }
  }
  else if (room.status === "cleaning") {
    if (confirm(`Mark Room ${room.number} as ready?`)) {
      updateRoomStatus(room.id, hotelId, "available").then(loadData);
      toast.success("Room ready for new guest");
    }
  }
};

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b p-6 px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">Room Status</h1>
            
            {/* View Switcher Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <Button 
                variant={view === 'grid' ? 'default' : 'ghost'} 
                onClick={() => setView('grid')}
                className={`rounded-xl px-4 h-9 font-bold text-xs transition-all ${view === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <LayoutGrid className="h-4 w-4 mr-2" /> Grid
              </Button>
              <Button 
                variant={view === 'calendar' ? 'default' : 'ghost'} 
                onClick={() => setView('calendar')}
                className={`rounded-xl px-4 h-9 font-bold text-xs transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleMassClean} 
              className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 font-bold"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset Cleaning
            </Button>

            <Input 
              placeholder="Add Room #" 
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
              className="w-32 rounded-xl bg-slate-100 border-none font-bold"
            />
            <Button onClick={async () => {
              if(!newRoomNumber) return;
              await createRoom({ hotelId, number: newRoomNumber, type: "Standard" });
              setNewRoomNumber("");
              loadData();
            }} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto py-6 px-4 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-indigo-600 text-white">
            <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Occupancy</p>
            <h2 className="text-4xl font-black">{occupancyRate}%</h2>
          </Card>
          
          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">To Clean</p>
            <h2 className="text-4xl font-black text-amber-500">{cleaningCount}</h2>
          </Card>

          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Rooms</p>
            <h2 className="text-4xl font-black text-slate-900">{totalRooms}</h2>
          </Card>

          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Live Guests</p>
            <h2 className="text-4xl font-black text-emerald-500">{occupiedCount}</h2>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
       <RevenueChart data={revenueData} />
    </div>
    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-indigo-900 text-white flex flex-col justify-center">
       <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Total Earnings</p>
       <h2 className="text-5xl font-black italic tracking-tighter">
         ${revenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
       </h2>
       <p className="text-xs mt-4 font-medium opacity-60 italic">Summary of the last 6 months</p>
    </Card>
  </div>
</div>

      <div className="p-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {roomsList.sort((a,b) => a.number.localeCompare(b.number)).map((room) => (
                  <Card 
  key={room.id} 
  onClick={() => handleRoomAction(room)}
  className={`p-6 rounded-[2.5rem] border-none shadow-sm cursor-pointer transition-all hover:shadow-xl active:scale-95 relative overflow-hidden ${
    room.status === 'available' ? 'bg-white' : 
    room.status === 'occupied' ? 'bg-indigo-600 text-white' : 
    room.status === 'maintenance' ? 'bg-orange-500 text-white' : // Added Maintenance Color
    'bg-amber-100 text-amber-800' // Cleaning color
  }`}
>
  <div className="flex justify-between items-start mb-6">
    <div className={`p-2 rounded-xl ${
      room.status === 'available' ? 'bg-slate-100 text-slate-400' : 'bg-white/20'
    }`}>
      {/* Icon Logic Update */}
      {room.status === 'occupied' ? (
        <UserCheck className="h-6 w-6" />
      ) : room.status === 'maintenance' ? (
        <Wrench className="h-6 w-6" /> // Added Wrench icon (Import from lucide-react)
      ) : (
        <BedDouble className="h-6 w-6" />
      )}
    </div>
    
    {/* NEW: Badge for Maintenance */}
    {room.status === 'maintenance' && (
      <span className="text-[8px] font-black uppercase bg-white/20 px-2 py-1 rounded-lg">
        Out of Order
      </span>
    )}
  </div>

  <h3 className="text-4xl font-black tracking-tighter">{room.number}</h3>
  
  <p className={`text-[10px] font-black uppercase tracking-widest ${
    room.status === 'occupied' || room.status === 'maintenance' ? 'text-white/60' : 'text-slate-400'
  }`}>
    {room.type}
  </p>
  
  <div className="mt-4 pt-4 border-t border-black/5 text-[10px] font-bold uppercase">
    {room.status === 'maintenance' ? "Under Repair" : (room.currentGuest || room.status)}
  </div>
</Card>
                ))}
              </div>
            ) : (
              <RoomCalendar rooms={roomsList} bookings={allBookings} />
            )}
          </>
        )}
      </div>

      <CheckInModal 
        room={selectedRoom} 
        hotelId={hotelId} 
        isOpen={!!selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
        onSuccess={loadData} 
      />

      <GuestProfileModal 
        guestName={guestProfile?.name}
        hotelId={hotelId}
        room={roomsList.find(r => r.currentGuest === guestProfile?.name)} 
        isOpen={!!guestProfile}
        onClose={() => setGuestProfile(null)}
        onCheckoutSuccess={() => {
          setGuestProfile(null);
          loadData(); 
        }}
      />
    </div>
  );
}