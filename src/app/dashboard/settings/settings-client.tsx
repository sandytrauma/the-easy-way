"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/user";
import { updateProfile } from "@/lib/actions/user-actions";
import { toast } from "sonner"; // Ensure you have sonner or change to alert

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

export function SettingsClient({ user }: { user: any }) {
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Setup Form with Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  // 2. Handle Save
  const onSaveProfile = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    const res = await updateProfile(data);
    setIsUpdating(false);

    if (res.success) {
      toast.success("Profile updated!");
    } else {
      toast.error(res.error || "Update failed");
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-slate-100 p-1 border">
        <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <User className="h-4 w-4" /> Profile
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <CreditCard className="h-4 w-4" /> Billing
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <ShieldCheck className="h-4 w-4" /> Security
        </TabsTrigger>
      </TabsList>

      {/* PROFILE SECTION */}
      <TabsContent value="profile" className="space-y-6">
        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-slate-500">PDFs Processed Today</CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-600">
                {user.pdfCountToday || 0} <span className="text-slate-300 text-lg font-normal">/</span> {user.plan === 'free' ? '1' : '∞'}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Member Status</CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                {user.plan === 'free' ? 'Standard' : 'Premium'}
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>This is your public identity on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-600"}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user.email} disabled className="bg-slate-50 text-slate-500 border-dashed" />
                <p className="text-[11px] text-slate-400">Email is linked to your login provider.</p>
              </div>

              <Button 
                type="submit" 
                disabled={isUpdating || !isDirty}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* BILLING SECTION */}
      <TabsContent value="billing">
        <Card className="border-none shadow-sm ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>You are currently on the <strong>{user.plan}</strong> tier.</CardDescription>
              </div>
              <Badge className={user.plan === 'pro' ? 'bg-indigo-600' : 'bg-slate-500'}>
                {user.plan.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.plan === "free" ? (
              <div className="p-6 bg-white border border-indigo-100 rounded-xl shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-3">Why Upgrade to Pro?</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {["Unlimited PDF Uploads", "Gemini 1.5 Pro Model", "Faster AI Processing", "Priority Email Support"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3 w-3 text-indigo-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                  Upgrade Now
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full">Manage Stripe Subscription</Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* SECURITY SECTION */}
      <TabsContent value="security">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage how you access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
              <div>
                <p className="text-sm font-semibold">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Protect your account with an extra security layer.</p>
              </div>
              <Button variant="outline" size="sm" className="bg-white">Enable</Button>
            </div>
            
            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold text-rose-600 uppercase tracking-tight mb-2">Danger Zone</h4>
              <div className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
                <p className="text-xs text-slate-600 mb-4">Deleting your account will permanently remove all your PDFs and chat history from Neon.</p>
                <Button variant="destructive" size="sm" className="bg-rose-600">Delete Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}