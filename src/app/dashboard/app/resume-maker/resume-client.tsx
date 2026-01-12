"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Sparkles, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { optimizeResumeText } from "@/lib/actions/resume-actions";
import { useReactToPrint } from "react-to-print";

export default function ResumeMakerClient({ isAdmin }: { isAdmin: boolean }) {
  const [resumeData, setResumeData] = useState({
    personalInfo: { name: "John Doe", email: "john@example.com", phone: "+1 234 567", bio: "Full Stack Developer..." },
    experience: [{ company: "Tech Corp", role: "Senior Dev", duration: "2020 - Present", desc: "Built scalable apps..." }],
    skills: ["React", "Next.js", "PostgreSQL"]
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

const handleAIOptimize = async () => {
  setIsOptimizing(true);
  const result = await optimizeResumeText(resumeData.personalInfo.bio, "bio");
  setIsOptimizing(false);
  
  if (result.success && result.data) {
    setResumeData({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, bio: result.data }
    });
    toast.success("Bio optimized by AI!");
  }
};

const handlePrint = useReactToPrint({
    contentRef: resumeRef, // Point to the resume
    documentTitle: `${resumeData.personalInfo.name}_Resume`,
    onAfterPrint: () => toast.success("Resume exported successfully!"),
  });
  const onDownloadClick = () => {
    if (!isAdmin) {
      toast.error("Upgrade to Pro", {
        description: "Payment integration coming soon, but currently locked for non-admins."
      });
      return;
    }
    handlePrint(); // Trigger the print/save dialog
  };

  const canDownload = isAdmin || false; // Initially check if Admin allowed

  const handleDownload = () => {
    if (!canDownload) {
      toast.error("Upgrade to Pro to download your high-quality PDF!", {
        description: "Admins can bypass this for testing.",
        action: { label: "Upgrade", onClick: () => console.log("Upgrade") }
      });
      return;
    }
    window.print(); // Simple PDF generation for now
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-6 p-2">
      {/* LEFT: EDITOR */}
      <Card className="flex-1 p-6 overflow-y-auto space-y-6 border-none shadow-xl bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Resume Editor
          </h2>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
            AI Powered
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <Input 
              value={resumeData.personalInfo.name} 
              onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, name: e.target.value}})}
              className="focus-visible:ring-indigo-500"
            />
          </div>

          {/* Bio Input with AI Polish */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700">Professional Bio</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAIOptimize}
                disabled={isOptimizing}
                className="text-xs text-indigo-600 hover:text-indigo-700 h-7 hover:bg-indigo-50"
              >
                {isOptimizing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                AI Polish
              </Button>
            </div>
            <Textarea 
              value={resumeData.personalInfo.bio} 
              onChange={(e) => setResumeData({
                ...resumeData, 
                personalInfo: {...resumeData.personalInfo, bio: e.target.value}
              })}
              placeholder="Write a brief bio..."
              className="resize-none border-slate-200 focus:ring-indigo-500"
              rows={5}
            />
          </div>
        </div>
      </Card>

      {/* RIGHT: VIBRANT PREVIEW */}
      <div className="flex-1 relative group">
        {/* Decorative Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <Card className="relative h-full bg-white overflow-hidden shadow-2xl rounded-xl border-none flex flex-col">
          {/* THE PRINTABLE AREA */}
          <div ref={resumeRef} className="flex-1 bg-white">
            {/* Header with vibrant accent */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white flex flex-col justify-end">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                {resumeData.personalInfo.name}
              </h1>
              <p className="text-indigo-100 opacity-90 text-sm mt-2">
                {resumeData.personalInfo.email} | {resumeData.personalInfo.phone}
              </p>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <h3 className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                  <div className="h-1 w-1 bg-indigo-600 rounded-full" /> About Me
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm antialiased">
                  {resumeData.personalInfo.bio}
                </p>
              </section>

              <section>
                <h3 className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                   <div className="h-1 w-1 bg-indigo-600 rounded-full" /> Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* DOWNLOAD OVERLAY (If not paid/admin) */}
          {!canDownload && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[3px] flex items-center justify-center p-6 text-center z-10">
              <div className="bg-white/90 p-8 rounded-2xl shadow-2xl max-w-xs border border-indigo-100 animate-in fade-in zoom-in duration-300">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Premium Export</h3>
                <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                  Upgrade to Pro to remove the watermark and download this high-resolution PDF.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Floating Action Button */}
        <Button 
          onClick={handleDownload}
          className="absolute bottom-6 right-6 shadow-2xl bg-indigo-600 hover:bg-indigo-700 rounded-full h-14 w-14 p-0 transition-transform hover:scale-110 active:scale-95"
        >
          <Download className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}