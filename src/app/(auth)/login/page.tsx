import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signIn } from "@/lib/auth";
import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const success = params.success;

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
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email");
              const password = formData.get("password");

              try {
                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: "/dashboard",
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  // This catches authentication-specific failures
                  return redirect(`/login?error=CredentialsSignin`);
                }
                // Next.js triggers redirects by throwing a specific error.
                // We MUST re-throw it so the browser actually navigates.
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded">
                Invalid email or password
              </p>
            )}
            
            {success && (
              <p className="text-sm font-medium text-green-600 text-center p-2 bg-green-50 rounded">
                {success}
              </p>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}