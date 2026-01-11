import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ChatPdfClient from "../page";

export default async function SavedChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> // Params is now a Promise in Next.js 15/16
}) {
  const session = await auth();
  const userId = (session?.user as any).id;

  // 1. Await the params
  const resolvedParams = await params;
  const chatId = parseInt(resolvedParams.id);

  // 2. Safety check: If ID is not a number, show 404
  if (isNaN(chatId)) {
    return notFound();
  }

  // 3. Fetch from Neon
  const [chat] = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.id, chatId),
        eq(chats.userId, userId)
      )
    );

  if (!chat) return notFound();

  return (
    <ChatPdfClient 
      initialChatId={chat.id}
      initialText={chat.extractedText}
      initialMessages={chat.messages as any[]}
    />
  );
}