"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Explicitly defining the return type fixes the TypeScript 'res.chatId' error
export async function uploadAndParsePDF(formData: FormData): Promise<
  { error: string } | { success: true; chatId: number }
> {
  let newChatId: number | null = null;

  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    // Vercel Limit Guard
    if (file.size > 4.5 * 1024 * 1024) {
      return { error: "File too large for serverless processing (Max 4.5MB)." };
    }

    // 1. EXTRACTION LOGIC
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // @ts-ignore
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";
    const maxPages = Math.min(pdf.numPages, 25);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str || "");
      fullText += strings.join(" ") + "\n";
      if (fullText.length > 120000) break;
    }

    if (!fullText.trim()) {
      return { error: "Could not extract text from this PDF." };
    }

    // 2. DATABASE INSERT
    const [newChat] = await db.insert(chats).values({
      userId: userId,
      pdfName: file.name,
      extractedText: fullText,
      messages: [],
    }).returning({ id: chats.id });

    newChatId = newChat.id;

    // 3. CACHE REVALIDATION (Fixes "Chat not showing" issue)
    revalidatePath("/dashboard/app", "layout");

  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    console.error("PDF_PARSE_ERROR:", error);
    return { error: "Server error during PDF parsing." };
  }

  // 4. REDIRECT
  if (newChatId) {
    redirect(`/dashboard/app/chat-pdf/${newChatId}`);
  }

  return { error: "Failed to initialize chat session." };
}