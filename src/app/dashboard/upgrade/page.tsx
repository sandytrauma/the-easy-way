import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { UpgradeButton } from "@/components/upgrage-button";



export default async function UpgradePage() {
  const session = await auth();
  const currentPlan = (session?.user as any)?.plan;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Simple Pricing</h1>
        <p className="text-muted-foreground mt-2">Unlock all AI components and apps</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className={currentPlan === "free" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic AI tools for individuals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$0 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basic Text Summarizer</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 5 AI Generations/day</li>
            </ul>
          </CardContent>
          <CardFooter>
             <div className="w-full text-center text-sm font-medium text-muted-foreground">
               {currentPlan === "free" ? "Current Plan" : ""}
             </div>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={currentPlan === "pro" ? "border-primary shadow-lg" : "shadow-lg"}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Pro
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Popular</span>
            </CardTitle>
            <CardDescription>Advanced AI power for professionals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$19 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Everything in Free</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> AI Image Generator</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <UpgradeButton currentPlan={currentPlan} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}