"use server";

import { db } from "@/db";
import { expenses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ObjectSchema } from "@google/generative-ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Define a schema to force Gemini to follow your structure exactly
const extractionSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    vendor: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    totalAmount: { type: SchemaType.NUMBER },
    taxAmount: { type: SchemaType.NUMBER },
    category: { type: SchemaType.STRING },
  },
  required: ["vendor", "date", "totalAmount", "category"],
};

export async function uploadAndProcessExpense(formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  const userId = user?.id;
  
  if (!userId || (user.plan !== "pro" && user.plan !== "admin")) {
    return { error: "Pro Plan Required" };
  }

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  try {
    let contentToAnalyze: any;

    if (file.type === "application/pdf") {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableFontFace: true,
      }).promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str || "").join(" ") + "\n";
      }
      contentToAnalyze = text;
    } else if (file.type.startsWith("image/")) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      contentToAnalyze = [
        { inlineData: { data: base64Data, mimeType: file.type } },
        "Extract invoice data from this image."
      ];
    }

    // Force JSON Mode using generationConfig
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
      }
    });

    const result = await model.generateContent(contentToAnalyze);
    const responseText = result.response.text();
    
    // Safety check for empty or malformed responses
    if (!responseText) throw new Error("AI returned an empty response.");
    
    const extracted = JSON.parse(responseText);

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
    console.error("Extraction Error:", error);
    return { error: error.message };
  }
}

export async function deleteExpense(id: number) {
  const session = await auth();
  const user = session?.user as any;

  if (!user || (user.plan !== "pro" && user.plan !== "admin")) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/dashboard/app/expenses");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense" };
  }
}