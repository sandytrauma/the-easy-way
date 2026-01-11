"use server";

import { db } from "@/db";
import { users, chats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function uploadAndParsePDF(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  try {
    // 1. Dynamic import of pdfjs-dist (required for Next.js Server Components)
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // 2. Load the document
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";

    // 3. Loop through pages and extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    const extractedText = fullText.trim();

    if (!extractedText) {
      return { error: "Could not extract text. The PDF might be an image." };
    }

    // 4. Save to Database (Neon)
    const userId = (session.user as any).id;
    const [newChat] = await db.insert(chats).values({
      userId: userId,
      pdfName: file.name,
      extractedText: extractedText,
      messages: [],
    }).returning({ insertedId: chats.id });

    return { 
      success: true, 
      text: extractedText.substring(0, 1000), // Return snippet for UI
      chatId: newChat.insertedId 
    };

  } catch (err) {
    console.error("PDFJS Error:", err);
    return { error: "Failed to parse PDF. Please ensure it's a valid document." };
  }
}