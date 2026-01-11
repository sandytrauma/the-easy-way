import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signIn } from "@/lib/auth"; // Import the sign-in function
import { AuthError } from "next-auth";
import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We wrap the fields in a form with a Server Action */}
          <form
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  // Handle specific errors or redirect back with query param
                  return; 
                }
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input 
                name="email" // name attribute is vital for formData
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Input 
                name="password" // name attribute is vital for formData
                id="password" 
                type="password" 
                required 
              />
            </div>
            {searchParams?.error && (
              <p className="text-sm text-red-500 text-center">Invalid credentials</p>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <div className="mt-4 text-center text-sm">
  Don&apos;t have an account?{" "}
  <Link href="/register" className="text-indigo-600 hover:underline">
    Sign up
  </Link>
</div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}