import { auth } from "@/lib/auth";
import ResumeMakerClient from "./resume-client";
import { redirect } from "next/navigation";

export default async function ResumeMakerPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user is admin based on your schema logic
  const isAdmin = (session.user as any)?.plan === "admin";

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Resume Builder</h1>
        <p className="text-slate-500 text-sm">Create a professional, ATS-optimized resume in seconds.</p>
      </div>
      
      {/* This renders the UI logic we built earlier */}
      <ResumeMakerClient isAdmin={isAdmin} />
    </div>
  );
}