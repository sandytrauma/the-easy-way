"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function askPdfQuestion(chatId: number, question: string) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const [chatData] = await db.select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

    if (!chatData) return { success: false, error: "Chat not found" };

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
    });

    // Provide a safe window of context
    const context = chatData.extractedText.substring(0, 30000);
    const prompt = `Context: ${context}\n\nQuestion: ${question}`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    const updatedMessages = [
      ...chatData.messages,
      { role: "user", content: question },
      { role: "ai", content: aiResponse },
    ];

    await db.update(chats)
      .set({ messages: updatedMessages })
      .where(eq(chats.id, chatId));

    revalidatePath(`/dashboard/app/chat-pdf/${chatId}`);
    return { success: true, answer: aiResponse };
  } catch (error) {
    return { success: false, error: "AI Assistant failed." };
  }
}