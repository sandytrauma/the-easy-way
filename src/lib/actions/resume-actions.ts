"use server";

import { db } from "@/db";
import { resumes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function saveResumeToDB(data: any) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const existing = await db.query.resumes.findFirst({ where: eq(resumes.userId, userId) });

    if (existing) {
      await db.update(resumes).set({ data }).where(eq(resumes.userId, userId));
    } else {
      await db.insert(resumes).values({ userId, data, title: data?.personalInfo?.name || "Resume" });
    }
    revalidatePath("/dashboard/app/resume-maker");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "DB Error" };
  }
}

export async function optimizeResumeWithAI(currentData: any, targetField: string) {
  try {
    // Corrected to a stable production model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert ATS (Applicant Tracking System) optimizer. 
    Optimize the following "${targetField}" content for a Public Transport Professional resume. 
    Focus on professional terminology (e.g., SLA, AFCS, Transit Operations, Fleet Management).
    
    CONTENT TO OPTIMIZE: 
    ${currentData}
    
    IMPORTANT: Return ONLY the optimized plain text. No markdown, no bolding, no "Here is your text".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Remove AI-generated markdown like ** or #
    const text = response.text().trim().replace(/[*#]/g, '');

    if (!text) throw new Error("AI returned empty content");
    return { success: true, text: text };
  } catch (error: any) {
    console.error("AI Optimization Error:", error.message);
    return { success: false, error: error.message || "AI Error" };
  }
}