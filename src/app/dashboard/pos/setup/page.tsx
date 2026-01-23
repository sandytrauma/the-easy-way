"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHotel } from "@/lib/actions/hotel-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function HotelSetupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;

    const result = await createHotel(name, location);

    if (result.success) {
      toast.success("Hotel Property Added!");
      router.push("/dashboard/pos");
      router.refresh();
    } else {
      toast.error(result.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md space-y-4">
        <Link 
          href="/dashboard/pos" 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-indigo-600 w-full" />
          <CardHeader className="space-y-1 pt-8 px-8">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo-600" />
              Add Property
            </CardTitle>
            <CardDescription>
              Register a new hotel location in your chain.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hotel Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="e.g. Grand Plaza New York" 
                    required 
                    className="pl-10 h-11 bg-slate-50 border-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location / City
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="location" 
                    name="name" 
                    placeholder="e.g. Manhattan, NY" 
                    required 
                    className="pl-10 h-11 bg-slate-50 border-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Property"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}