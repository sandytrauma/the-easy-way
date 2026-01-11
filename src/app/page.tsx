import { redirect } from "next/navigation";

export default function RootPage() {
  // Since your middleware protects /dashboard, 
  // redirecting here will trigger the auth check.
  redirect("/dashboard");
}