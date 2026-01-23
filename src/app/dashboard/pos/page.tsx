import { db } from "@/db";
import { hotels } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Building2, ArrowRight, MapPin } from "lucide-react";

export default async function PosSelectionPage() {
  const session = await auth();
  const userHotels = await db
    .select()
    .from(hotels)
    .where(eq(hotels.adminId, (session?.user as any).id));

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Select Hotel Property</h2>
        <p className="text-slate-500 mb-8">Choose a location to launch the POS terminal.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {userHotels.map((hotel) => (
            <Link key={hotel.id} href={`/dashboard/pos/${hotel.id}`}>
              <Card className="p-5 group hover:border-indigo-600 transition-all cursor-pointer relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                    <Building2 className="h-6 w-6 text-slate-600 group-hover:text-indigo-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-lg text-slate-900">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                    <MapPin className="h-3 w-3" /> {hotel.location}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Add New Property Card */}
          <Link href="/dashboard/pos/setup">
            <Card className="p-5 border-dashed border-2 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all h-full min-h-[160px]">
              <div className="p-2 rounded-full border border-current mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-sm">Add New Property</span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}