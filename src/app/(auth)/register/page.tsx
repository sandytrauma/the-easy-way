"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerUser } from "@/lib/actions/register";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  // state returns the return value of registerUser
  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/login?success=Account created! Please login.");
    }
  }, [state, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to start using your AI workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input name="name" placeholder="Full Name" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Input name="email" type="email" placeholder="email@example.com" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Input name="password" type="password" placeholder="Password" required disabled={isPending} />
            </div>

            {state?.error && (
              <p className="text-sm font-medium text-destructive text-center">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}