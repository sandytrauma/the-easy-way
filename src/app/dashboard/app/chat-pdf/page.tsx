"use client";

import { useState, useEffect, useRef } from "react";
import { uploadAndParsePDF } from "@/lib/actions/pdf-actions";
import { askPdfQuestion } from "@/lib/actions/chat-actions"; 
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Send, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChatPdfProps {
  initialChatId?: number;
  initialText?: string | null;
  initialMessages?: any[];
}

export default function ChatPdfPage({
  initialChatId,
  initialText,
  initialMessages = [],
}: ChatPdfProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // States
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [chatId, setChatId] = useState<number | null>(initialChatId || null);
  const [pdfText, setPdfText] = useState<string | null>(initialText || null);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [isAsking, setIsAsking] = useState(false);

  // PREVENT INFINITE LOOP: Only sync when initialChatId actually changes
  useEffect(() => {
    if (initialChatId && initialChatId !== chatId) {
      setChatId(initialChatId);
      setPdfText(initialText || null);
      setMessages(initialMessages || []);
    }
  }, [initialChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAsking]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      toast.error("File is too large (Max 4.5MB)");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAndParsePDF(formData);
    if (res && "error" in res) {
      toast.error(res.error);
      setLoading(false);
    } else if (res && "chatId" in res) {
      router.refresh();
      router.push(`/dashboard/app/chat-pdf/${res.chatId}`);
    }
  }

  async function onSendMessage() {
    if (!query.trim() || !chatId || isAsking) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsAsking(true);

    try {
      const res = await askPdfQuestion(chatId, query);
      if (res.success) {
        setMessages((prev) => [...prev, { role: "ai", content: res.answer }]);
      } else {
        toast.error(res.error || "AI failed to respond");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setIsAsking(false);
    }
  }

  // UI: CHAT MODE
  if (pdfText) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto p-4">
        <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl border-indigo-100">
          <div className="p-4 border-b bg-white flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              PDF Assistant
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/app/chat-pdf")}>
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-indigo-600" : "bg-white border shadow-sm"}`}>
                    {m.role === "user" ? <User className="h-4 w-4 text-white" /> : <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border"
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start mb-6 animate-pulse">
                <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-400 font-medium">Gemini is thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </ScrollArea>

          <div className="p-4 border-t bg-white flex gap-3 items-center">
            <Input 
              placeholder="Ask a question about this PDF..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
              className="bg-slate-50 border-none focus-visible:ring-indigo-500 h-12"
            />
            <Button onClick={onSendMessage} disabled={isAsking} size="icon" className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // UI: UPLOAD MODE
  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="p-16 border-dashed border-2 text-center bg-white w-full max-w-xl group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
        <input type="file" id="pdf-input" hidden accept="application/pdf" onChange={handleFileUpload} disabled={loading} />
        <label htmlFor="pdf-input" className="cursor-pointer block space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="animate-spin h-16 w-16 text-indigo-600" />
                <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-lg">Processing PDF</p>
                <p className="text-sm text-slate-500">Extracting text for the AI model...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-indigo-50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-12 w-12 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-800">Chat with any PDF</p>
                <p className="text-sm text-slate-500 max-w-[280px] mx-auto">Click to upload a document (Max 4.5MB). Best for research papers and contracts.</p>
              </div>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-full shadow-lg shadow-indigo-200">
                Select PDF
              </Button>
            </>
          )}
        </label>
      </Card>
    </div>
  );
}