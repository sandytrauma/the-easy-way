import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const userPlan = (session?.user as any)?.plan || "free";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}</h1>
        <Badge variant="secondary" className="capitalize">{userPlan} Plan</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AI Content Writer</CardTitle>
            <CardDescription>Generate blogs with GPT-4</CardDescription>
          </CardHeader>
          <CardContent>
            {userPlan === "free" ? (
              <p className="text-sm text-amber-600 font-medium">Upgrade to Pro to unlock</p>
            ) : (
              <Badge className="bg-green-500">Active</Badge>
            )}
          </CardContent>
        </Card>
        
        {/* Additional App Components go here */}
      </div>
    </div>
  );
}