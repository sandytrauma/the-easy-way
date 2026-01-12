"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function optimizeResumeText(text: string, type: "bio" | "experience") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are a professional resume writer. Rewrite the following ${type} to be more professional, 
      impactful, and keyword-optimized for ATS systems. 
      Keep it concise but powerful.
      
      Original Text: ${text}
      
      Optimized Text:
    `;

    const result = await model.generateContent(prompt);
    return { success: true, data: result.response.text().trim() };
  } catch (error) {
    return { success: false, error: "Failed to optimize text" };
  }
}