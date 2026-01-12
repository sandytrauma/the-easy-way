import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import ResumeMakerClient from "./resume-client";
import { redirect } from "next/navigation";

export default async function ResumeMakerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email!),
  });

  if (!dbUser) redirect("/login");

  const existingResume = await db.query.resumes.findFirst({
    where: eq(resumes.userId, dbUser.id),
  });

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <ResumeMakerClient 
        user={dbUser} 
        initialData={existingResume?.data} 
      />
    </div>
  );
}