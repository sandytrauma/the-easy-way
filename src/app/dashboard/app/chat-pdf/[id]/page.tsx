import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ChatPdfPage from "../page";

export default async function SavedChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin");

  const { id } = await params;
  const chatId = parseInt(id);
  if (isNaN(chatId)) return notFound();

  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  if (!chat) return notFound();

  return (
    <ChatPdfPage 
      initialChatId={chat.id}
      initialText={chat.extractedText}
      initialMessages={(chat.messages as any[]) || []}
    />
  );
}