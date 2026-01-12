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
    // 1. Fixed Model Name: Changed gemini-2.5-flash to gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Enhanced Prompt: Added explicit instructions to avoid markdown or conversational intro
    const prompt = `You are an expert ATS (Applicant Tracking System) optimizer. 
    Optimize the following "${targetField}" content for a Public Transport Professional resume. 
    Focus on professional terminology, transit metrics, and industry standards.
    
    CONTENT TO OPTIMIZE: 
    ${currentData}
    
    IMPORTANT: Return ONLY the optimized plain text. Do not include quotes, markdown bolding, or introductory sentences like "Here is the result."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text) throw new Error("AI returned empty content");

    return { success: true, text: text };
  } catch (error: any) {
    // 3. Detailed Error Logging for your server console
    console.error("AI Optimization Error:", error.message);
    return { success: false, error: error.message || "AI Error" };
  }
}