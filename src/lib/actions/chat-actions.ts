"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm"; // Added and for security
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

export async function askPdfQuestion(chatId: number, question: string, pdfText: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    
    // TRY THIS MODEL STRING: "gemini-1.5-flash-latest" or "gemini-1.5-flash"
    // Sometimes 'gemini-1.5-flash' requires the latest SDK version
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an AI assistant. Use the following context to answer the question.
      Context: ${pdfText.substring(0, 25000)}
      
      Question: ${question}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // 1. Fetch the existing chat record
    // Added a security check: ensure the chat belongs to the user
    const [existingChat] = await db.select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, (session.user as any).id)
        )
      );

    if (!existingChat) {
      return { success: false, error: "Chat not found" };
    }

    const currentMessages = (existingChat.messages as any[]) || [];

    const updatedMessages = [
      ...currentMessages,
      { role: "user", content: question },
      { role: "ai", content: aiText },
    ];

    // 2. Update database
    await db.update(chats)
      .set({ messages: updatedMessages })
      .where(eq(chats.id, chatId));

    return { success: true, answer: aiText };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // This will help you see if it's a safety filter issue or API issue
    return { success: false, error: "AI Assistant is currently unavailable. Check console." };
  }
}