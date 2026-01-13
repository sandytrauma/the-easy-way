"use server";

import { db } from "@/db";
import { expenses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function uploadAndProcessExpense(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const user = session?.user as any;
  
  if (!userId) return { error: "Unauthorized" };

  // 1. Guard: Check Plan
  if (!user || (user.plan !== "pro" && user.plan !== "admin")) {
    return { error: "Pro Plan Required" };
  }

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  try {
    // 2. Extract Text using PDF.js
    // @ts-ignore
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
    }

    // 3. AI Structured Extraction (FIXED MODEL NAME)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Extract invoice data from this text into a JSON object.
    Fields: vendor (company name), date (DD/MM/YYYY), totalAmount (number), taxAmount (number), category (Food, Travel, Office, Fuel, or Other).
    
    TEXT: ${fullText}
    
    RETURN ONLY RAW JSON. No markdown backticks.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Safety check for JSON parsing
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(cleanJson);

    // 4. Save to Database
    await db.insert(expenses).values({
      userId,
      vendor: extracted.vendor || "Unknown",
      date: extracted.date || "N/A",
      amount: extracted.totalAmount?.toString() || "0",
      taxAmount: extracted.taxAmount?.toString() || "0",
      category: extracted.category || "Other",
    });

    revalidatePath("/dashboard/app/expenses");
    return { success: true };
  } catch (error: any) {
    console.error("Expense Error:", error);
    return { error: "Failed to process receipt: " + error.message };
  }
}

export async function deleteExpense(id: number) {
  const session = await auth();
  const user = session?.user as any;

  if (!user || (user.plan !== "pro" && user.plan !== "admin")) {
    return { error: "Pro Plan Required" };
  }

  try {
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/dashboard/app/expenses");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete" };
  }
}