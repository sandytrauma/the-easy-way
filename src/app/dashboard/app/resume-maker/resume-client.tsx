"use client";

import { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Trash2, Download, Sparkles, Lock, ShieldCheck, Loader2,
  Phone, Mail, MapPin, User, Briefcase, GraduationCap, FolderDot, Languages,
  Calendar, Award, Cpu, Printer // Added Printer icon
} from "lucide-react";
import { saveResumeToDB, optimizeResumeWithAI } from "@/lib/actions/resume-actions";
import { toast } from "sonner";

export default function ResumeMakerClient({ user, initialData }: any) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const canDownload = user?.plan === "pro" || user?.plan === "admin";

  const [resumeData, setResumeData] = useState(() => {
    const defaultTemplate = {
      personalInfo: { 
        name: "NEERAJ GAHLOT", title: "Public Transport Professional", 
        email: "neeraj.gahlot@example.com", phone: "+91 9136584700", 
        location: "Delhi, India", summary: "Dynamic professional with 8+ years in Transit Operations." 
      },
      personalDetails: { 
        fathersName: "Sh. Ramesh Chander Gahlot", dob: "09/09/1988", 
        languages: "English, Hindi", address: "Mitrao, Najafgarh, New Delhi" 
      },
      experience: [{ company: "DIMTS LTD.", role: "Assistant Officer", duration: "", desc: "Managing Cluster Bus operations and SLA compliance." }],
      education: [{ school: "CMJ University", degree: "B.Com", year: "2012" }],
      qualifications: [{ title: "Professional Transit Management", year: "2019" }],
      skills: "Excel, BMS, AFCS, VTS, ITS", 
      footer: { date: "", place: "New Delhi" }
    };
    return { ...defaultTemplate, ...initialData };
  });

  // ATS SCORE LOGIC
  const atsScore = useMemo(() => {
    let score = 0;
    const skills = typeof resumeData.skills === 'string' ? resumeData.skills.toLowerCase() : "";
    if (resumeData.personalInfo.name) score += 10;
    if (resumeData.personalInfo.summary.length > 50) score += 15;
    if (resumeData.experience.length > 0) score += 20;
    if (skills.length > 10) score += 20; 
    if (resumeData.education.length > 0) score += 10;
    if (resumeData.personalDetails.fathersName) score += 25;
    return Math.min(score, 100);
  }, [resumeData]);

  // AI POLISH LOGIC
  const handleAIPolish = async (fieldKey: string, currentText: string, path: string[]) => {
    if (!canDownload) return toast.error("Upgrade to Pro for AI Polish!");
    if (!currentText) return toast.error("Please enter some text first.");

    setIsOptimizing(fieldKey);
    const res = await optimizeResumeWithAI(currentText, fieldKey);
    
    if (res.success) {
      const newData = JSON.parse(JSON.stringify(resumeData));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = res.text;
      
      setResumeData(newData);
      toast.success("Optimized with AI!");
    }
    setIsOptimizing(null);
  };

  /**
   * PRINT FUNCTIONALITY
   * Generates a PDF/Print dialogue using the resumeRef
   */
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `Resume_${resumeData.personalInfo.name.replace(/\s+/g, '_')}`,
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-4 bg-slate-100">
      
      {/* EDITOR SIDE */}
      <div className="flex-[0.4] flex flex-col gap-4 overflow-hidden">
        <Card className="flex-1 p-6 overflow-y-auto space-y-6 bg-white border-none shadow-xl scrollbar-hide">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-lg text-slate-800 tracking-tight">Resume Editor</h2>
            <Button onClick={() => saveResumeToDB(resumeData)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 transition-colors">Save Progress</Button>
          </div>

          {/* ATS DASHBOARD */}
          <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 shadow-inner">
            <div className="flex justify-between items-center text-indigo-400">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> ATS Strength
              </span>
              <span className="text-lg font-black">{atsScore}%</span>
            </div>
            <Progress value={atsScore} className="h-1 bg-slate-800" />
          </div>

          {/* SUMMARY EDITOR WITH AI POLISH */}
          <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2">
                <Sparkles size={14}/> Professional Summary
              </h3>
              <button 
                onClick={() => handleAIPolish("summary", resumeData.personalInfo.summary, ["personalInfo", "summary"])}
                className="text-[9px] text-indigo-700 font-black flex items-center gap-1 hover:underline"
              >
                {isOptimizing === "summary" ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI IMPROVE
              </button>
            </div>
            <Textarea 
              placeholder="Write a brief professional overview..." 
              value={resumeData.personalInfo.summary} 
              className="text-xs min-h-[100px] bg-white"
              onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, summary: e.target.value}})} 
            />
          </div>

          {/* SKILLS EDITOR WITH AI OPTIMIZER */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2">
                <Cpu size={14}/> Technical Proficiencies
              </h3>
              <button 
                onClick={() => handleAIPolish("skills", resumeData.skills, ["skills"])}
                className="text-[9px] text-indigo-600 font-black flex items-center gap-1 hover:underline"
              >
                {isOptimizing === "skills" ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI KEYWORDS
              </button>
            </div>
            <Textarea 
              placeholder="Excel, BMS, AFCS (comma separated)..." 
              value={resumeData.skills} 
              className="text-xs min-h-[60px]"
              onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} 
            />
            <p className="text-[8px] text-slate-400 italic">Separate skills with commas for automatic tag generation.</p>
          </div>

          {/* PERSONAL DETAILS EDITOR */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"><User size={14}/> Personal Details</h3>
            <Input placeholder="Father's Name" value={resumeData.personalDetails.fathersName} onChange={(e) => setResumeData({...resumeData, personalDetails: {...resumeData.personalDetails, fathersName: e.target.value}})} />
            <Input placeholder="Date of Birth" value={resumeData.personalDetails.dob} onChange={(e) => setResumeData({...resumeData, personalDetails: {...resumeData.personalDetails, dob: e.target.value}})} />
            <Input placeholder="Address" value={resumeData.personalDetails.address} onChange={(e) => setResumeData({...resumeData, personalDetails: {...resumeData.personalDetails, address: e.target.value}})} />
          </div>

          {/* EXPERIENCE EDITOR */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-1">
              <h3 className="text-[10px] font-black uppercase text-indigo-600">Work Experience</h3>
              <Button variant="ghost" size="sm" onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, {company:"", role:"", duration:"", desc:""}]})} className="h-6 w-6 p-0 text-indigo-600"><Plus size={16}/></Button>
            </div>
            {resumeData.experience.map((exp: any, i: number) => (
              <div key={i} className="p-3 border border-slate-100 rounded-lg space-y-2 relative group bg-white shadow-sm">
                <button onClick={() => setResumeData({...resumeData, experience: resumeData.experience.filter((_: any, idx: number) => idx !== i)})} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                <Input placeholder="Company" value={exp.company} className="h-8 text-xs font-bold" onChange={(e) => {
                   const updated = [...resumeData.experience];
                   updated[i].company = e.target.value;
                   setResumeData({...resumeData, experience: updated});
                }} />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Description</span>
                  <button onClick={() => handleAIPolish(`exp-${i}`, exp.desc, ["experience", i.toString(), "desc"])} className="text-[9px] text-indigo-600 font-black flex items-center gap-1 hover:underline">
                    {isOptimizing === `exp-${i}` ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI POLISH
                  </button>
                </div>
                <Textarea value={exp.desc} className="text-xs min-h-[80px]" onChange={(e) => {
                   const updated = [...resumeData.experience];
                   updated[i].desc = e.target.value;
                   setResumeData({...resumeData, experience: updated});
                }} />
              </div>
            ))}
          </div>

          {/* EDUCATION EDITOR */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-1">
              <h3 className="text-[10px] font-black uppercase text-indigo-600">Education</h3>
              <Button variant="ghost" size="sm" onClick={() => setResumeData({...resumeData, education: [...resumeData.education, {school:"", degree:"", year:""}]})} className="h-6 w-6 p-0 text-indigo-600"><Plus size={16}/></Button>
            </div>
            {resumeData.education.map((edu: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 border rounded-lg grid grid-cols-2 gap-2 relative group">
                <button onClick={() => setResumeData({...resumeData, education: resumeData.education.filter((_: any, idx: number) => idx !== i)})} className="absolute -top-2 -right-2 bg-white rounded-full shadow text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                <Input placeholder="Degree" value={edu.degree} className="text-xs h-8 col-span-2" onChange={(e) => {
                  const updated = [...resumeData.education];
                  updated[i].degree = e.target.value;
                  setResumeData({...resumeData, education: updated});
                }} />
                <Input placeholder="Uni" value={edu.school} className="text-xs h-8" onChange={(e) => {
                  const updated = [...resumeData.education];
                  updated[i].school = e.target.value;
                  setResumeData({...resumeData, education: updated});
                }} />
                <Input placeholder="Year" value={edu.year} className="text-xs h-8" onChange={(e) => {
                  const updated = [...resumeData.education];
                  updated[i].year = e.target.value;
                  setResumeData({...resumeData, education: updated});
                }} />
              </div>
            ))}
          </div>
        </Card>

        {/* PRINT ACTION BAR - STICKY AT BOTTOM OF EDITOR */}
        <Card className="p-4 bg-white shadow-2xl border-t flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready to go?</span>
                <span className="text-xs font-bold text-slate-800">Finalize your Resume</span>
            </div>
            <Button 
                onClick={() => handlePrint()} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
                <Printer size={18} /> Download PDF
            </Button>
        </Card>
      </div>

      {/* PREVIEW SIDE */}
      <div className="flex-1 relative bg-slate-300 p-8 overflow-y-auto scrollbar-hide">
        {/* added print:m-0 print:shadow-none to ensure clean PDF export */}
        <div ref={resumeRef} className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 shadow-2xl flex flex-col font-sans text-slate-900 border-t-[12px] border-indigo-600 print:shadow-none print:m-0">
          
          <div className="border-b-4 border-slate-900 pb-4 mb-6">
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter">{resumeData.personalInfo.name}</h1>
            <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
              <span className="flex items-center gap-1"><Mail size={12} className="text-indigo-600"/> {resumeData.personalInfo.email}</span>
              <span className="flex items-center gap-1"><Phone size={12} className="text-indigo-600"/> {resumeData.personalInfo.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-600"/> {resumeData.personalInfo.location}</span>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <section>
              <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-1 mb-2">Professional Summary</h3>
              <p className="text-[11px] leading-relaxed text-justify italic text-slate-700">{resumeData.personalInfo.summary}</p>
            </section>

            <section>
              <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-1 mb-2 flex items-center gap-2">
                <Briefcase size={14}/> Professional Experience
              </h3>
              {resumeData.experience.map((exp: any, i: number) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between font-bold text-xs uppercase">
                    <span className="text-slate-900">{exp.role}</span>
                    
                  </div>
                  <div className="text-indigo-600 font-black text-[10px] uppercase mb-1 tracking-wider">{exp.company}</div>
                  <p className="text-[10px] text-slate-600 leading-snug">{exp.desc}</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-1 mb-2 flex items-center gap-2">
                <GraduationCap size={14}/> Education & Qualifications
              </h3>
              <div className="space-y-2">
                {resumeData.education.map((edu: any, i: number) => (
                  <div key={i} className="flex justify-between text-[11px] font-bold text-slate-800 uppercase tracking-tight">
                    <span>{edu.degree} <span className="text-slate-400 mx-1">|</span> {edu.school}</span>
                    <span className="text-slate-500">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-1 mb-2 flex items-center gap-2">
                <FolderDot size={14}/> Technical Proficiencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {(typeof resumeData.skills === 'string' ? resumeData.skills : "").split(',').filter(Boolean).map((skill: string, i: number) => (
                  <span key={i} className="bg-slate-900 text-white px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-tighter">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-auto shadow-sm">
              <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-2">Personal Profile</h3>
              <div className="grid grid-cols-2 gap-y-3 text-[11px]">
                <span className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-tighter"><User size={12}/> FATHER'S NAME</span>
                <span className="font-bold text-slate-800 uppercase">{resumeData.personalDetails.fathersName}</span>
                <span className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-tighter"><Calendar size={12}/> DATE OF BIRTH</span>
                <span className="font-bold text-slate-800">{resumeData.personalDetails.dob}</span>
                <span className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-tighter"><Languages size={12}/> LANGUAGES</span>
                <span className="font-bold text-slate-800 uppercase">{resumeData.personalDetails.languages}</span>
                <span className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-tighter"><MapPin size={12}/> PERMANENT ADDRESS</span>
                <span className="font-bold text-slate-800 leading-tight text-[10px] uppercase">{resumeData.personalDetails.address}</span>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-4 border-t border-dashed flex justify-between items-end">
             <div className="text-[10px] space-y-1 font-bold text-slate-400 uppercase tracking-tighter">
                <p>DATE: {resumeData.footer.date || "________________"}</p>
                <p>PLACE: {resumeData.footer.place}</p>
             </div>
             <div className="text-center font-black uppercase text-slate-900 text-[9px]">
                <div className="w-32 border-b-2 border-slate-900 mb-1"></div>
                ({resumeData.personalInfo.name})
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}