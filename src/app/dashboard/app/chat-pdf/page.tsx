"use client";

import { useState, useEffect } from "react";
import { uploadAndParsePDF } from "@/lib/actions/pdf-actions";
import { askPdfQuestion } from "@/lib/actions/chat-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

type Message = {
  role: "user" | "ai";
  content: string;
};

// Added Props to handle loading saved chats from the [id] route
interface ChatPdfClientProps {
  initialChatId?: number;
  initialText?: string;
  initialMessages?: Message[];
}

export default function ChatPdfClient({ 
  initialChatId, 
  initialText, 
  initialMessages = [] 
}: ChatPdfClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(initialChatId || null);
  const [pdfText, setPdfText] = useState<string | null>(initialText || null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isAsking, setIsAsking] = useState(false);

  // If initial props change (navigating between history items), update state
  useEffect(() => {
    if (initialChatId) {
      setChatId(initialChatId);
      setPdfText(initialText || null);
      setMessages(initialMessages);
    }
  }, [initialChatId, initialText, initialMessages]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAndParsePDF(formData);

    if (res.error) {
      alert(res.error);
    } else if (res.success) {
      setPdfText(res.text || "");
      setChatId(res.chatId || null);
      // Refresh the sidebar to show the new chat in history
      router.refresh(); 
    }
    setLoading(false);
  }

  async function onAsk() {
    if (!question || !chatId || !pdfText) return;
    
    setIsAsking(true);
    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    const res = await askPdfQuestion(chatId, question, pdfText);
    
    if (res.success && res.answer) {
      const aiMsg: Message = { role: "ai", content: res.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      alert(res.error || "Failed to get an answer.");
    }
    setIsAsking(false);
  }

  const resetChat = () => {
    setPdfText(null);
    setMessages([]);
    setChatId(null);
    router.push("/dashboard/app/chat-pdf"); // Go back to base upload page
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {!pdfText ? (
        <Card className="p-12 border-dashed border-2 text-center bg-slate-50/50 transition-all hover:bg-slate-50 hover:border-indigo-300">
          <input 
            type="file" 
            id="pdf-input" 
            hidden 
            accept="application/pdf" 
            onChange={handleFileChange} 
            disabled={loading} 
          />
          <label htmlFor="pdf-input" className="cursor-pointer block space-y-4">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-2" />
                <p className="font-medium text-slate-600">Analyzing Document...</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto shadow-sm flex items-center justify-center border">
                  <FileText className="h-10 w-10 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">Upload your PDF</p>
                  <p className="text-sm text-slate-500">Extract insights instantly with AI</p>
                </div>
                <Button variant="outline" className="pointer-events-none">Select File</Button>
              </>
            )}
          </label>
        </Card>
      ) : (
        <Card className="flex flex-col h-[650px] shadow-xl overflow-hidden border-none ring-1 ring-slate-200">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> 
              <span className="truncate max-w-[200px]">PDF AI Assistant</span>
            </h3>
            <div className="flex gap-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={resetChat}
                    className="bg-indigo-500 hover:bg-indigo-400 border-none text-white"
                >
                    New Chat
                </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6 bg-slate-50">
            <div className="space-y-4">
              {messages.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                      <p className="text-sm">No messages yet. Ask anything about the document!</p>
                  </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}>
                    {msg.role === "ai" ? (
    <article className="prose prose-sm prose-slate max-w-none prose-p:leading-normal prose-p:my-1 prose-headings:text-indigo-600 prose-li:my-0 prose-pre:p-0">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
      >
        {msg.content}
      </ReactMarkdown>
    </article>
  ) : (
    msg.content
  )}
                  </div>
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                    <span className="text-xs prose text-slate-500">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t flex gap-2">
            <Input 
              placeholder="Type your question..." 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isAsking && onAsk()}
              disabled={isAsking}
              className="bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
            <Button onClick={onAsk} disabled={isAsking || !question} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}