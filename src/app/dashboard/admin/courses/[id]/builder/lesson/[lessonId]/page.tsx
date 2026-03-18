"use client"

import * as React from "react"
import { 
  ArrowLeft,
  Video,
  FileText,
  Save,
  Sparkles,
  Clock,
  Link as LinkIcon,
  Bold,
  Italic,
  AlertCircle,
  LayoutGrid,
  ChevronRight,
  Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  getLesson,
  updateLesson,
  generateLessonContentAI,
  fetchYoutubeTranscript,
  extractPdfTextAction
} from "../../../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function FullLessonWorkspace() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const courseId = params.id as string

  const [lesson, setLesson] = React.useState<any>(null)
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false)
  const [isProcessingSource, setIsProcessingSource] = React.useState(false)
  const [sourceContext, setSourceContext] = React.useState("")
  const [ytUrl, setYtUrl] = React.useState("")
  const [pdfPages, setPdfPages] = React.useState({ start: 1, end: 5 })

  React.useEffect(() => {
    async function loadLesson() {
      const data = await getLesson(lessonId)
      if (data) {
        setLesson(data)
        setEditData({
          title: data.title,
          content: data.content || "",
          duration: data.duration?.toString() || "",
          videoUrl: data.videoUrl || "",
          attachmentUrl: data.attachmentUrl || ""
        })
      } else {
        toast.error("Lesson not found")
        router.push(`/dashboard/admin/courses/${courseId}/builder`)
      }
    }
    loadLesson()
  }, [lessonId, courseId, router])

  const handleSaveChanges = async () => {
    if (!editData) return
    setIsSaving(true)
    const res = await updateLesson(lessonId, {
      title: editData.title,
      content: editData.content,
      duration: parseInt(editData.duration) || 0,
      videoUrl: editData.videoUrl,
      attachmentUrl: editData.attachmentUrl
    })
    if (res.success) {
      toast.success("Strategic content synced successfully! 🌌")
    } else {
      toast.error(res.error || "Failed to sync content")
    }
    setIsSaving(false)
  }

  const handleFetchYoutube = async () => {
    if (!ytUrl) return toast.error("Please enter a YouTube URL")
    setIsProcessingSource(true)
    const res = await fetchYoutubeTranscript(ytUrl)
    if (res.error) {
      toast.error(res.error)
    } else if (res.text) {
      setSourceContext(res.text)
      toast.success("Transcript fetched and added to Source! 📺")
    }
    setIsProcessingSource(false)
  }

  const handleProcessPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessingSource(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await extractPdfTextAction(formData)
      if (res.error) {
        toast.error(res.error)
      } else if (res.text) {
        setSourceContext(res.text)
        toast.success(`PDF Extracted! AI will focus on pages ${pdfPages.start}-${pdfPages.end} 📑`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to parse PDF.")
    } finally {
      setIsProcessingSource(false)
    }
  }

  const handleGenerateAI = async () => {
    if (!editData?.title) {
       return toast.error("Please enter a Lesson Title first")
    }
    setIsGeneratingAI(true)
    const contextWithRange = sourceContext ? (
      `SOURCE RANGE: Please focus specifically on the content between pages ${pdfPages.start} and ${pdfPages.end} (if applicable) or the video content described below:\n\n` + 
      sourceContext
    ) : ""
    const res = await generateLessonContentAI(editData.title, lesson?.section?.course?.name, contextWithRange)
    if (res.error) {
       toast.error(res.error)
    } else if (res.content) {
       setEditData({...editData, content: res.content})
       toast.success("AI Content Generated based on your Selection! ✨")
    }
    setIsGeneratingAI(false)
  }

  if (!lesson) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <nav className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="flex items-center gap-6">
          <Link href={`/dashboard/admin/courses/${courseId}/builder`}>
            <Button variant="outline" className="h-12 w-12 rounded-[18px] border-slate-100 hover:bg-slate-50 shadow-sm">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div className="h-10 w-[1px] bg-slate-100" />
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] px-2.5 py-1">LESSON NODAL WORKSPACE</Badge>
                <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] px-2.5 py-1">{lesson.section.course.name}</Badge>
             </div>
             <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{editData.title || "Untitled Lecture"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden xl:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 rounded-full">
                 <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Workspace Operational</span>
              </div>
           </div>
           <Button 
             onClick={handleSaveChanges} 
             disabled={isSaving}
             className="h-14 px-10 rounded-[20px] bg-slate-950 text-white font-black uppercase tracking-[0.1em] text-[11px] gap-3 shadow-2xl shadow-slate-200"
           >
              {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              Commit Structure
           </Button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto mt-12 px-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Left Panel: Primary Content Editor */}
          <div className="xl:col-span-8 space-y-12">
            
            <section className="bg-white p-12 rounded-[56px] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />
              
              <div className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Lecture Designation</Label>
                      <Input 
                        value={editData.title}
                        onChange={e => setEditData({...editData, title: e.target.value})}
                        className="h-16 rounded-[24px] bg-slate-50 border-none font-black text-sm px-8 uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Instructional Window (Min)</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={editData.duration}
                          onChange={e => setEditData({...editData, duration: e.target.value})}
                          className="h-16 rounded-[24px] bg-slate-50 border-none font-black text-sm px-8 uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                        />
                        <Clock className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                       <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Scholastic Narrative Engine</Label>
                       <div className="flex items-center gap-3">
                          <Button 
                            disabled={isGeneratingAI}
                            onClick={handleGenerateAI}
                            variant="outline" 
                            className="h-8 rounded-full border-none bg-indigo-50 text-indigo-600 font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all px-4"
                          >
                            {isGeneratingAI ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-indigo-400 border-t-white rounded-full animate-spin" /> Synthesizing...</span> : <span className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> Enhance via Intelligence</span>}
                          </Button>
                          <Badge className="bg-emerald-50 text-emerald-500 border-none font-black text-[9px] uppercase px-3 py-1 mt-0.5">Active Sandbox</Badge>
                       </div>
                    </div>
                    <div className="relative">
                       <div className="absolute top-6 right-8 flex items-center gap-2 z-10">
                          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-xl hover:scale-105 active:scale-95 transition-all"><Bold className="h-5 w-5" /></Button>
                          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-xl hover:scale-105 active:scale-95 transition-all"><Italic className="h-5 w-5" /></Button>
                          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-xl hover:scale-105 active:scale-95 transition-all"><LinkIcon className="h-5 w-5" /></Button>
                       </div>
                       <textarea 
                          className="w-full min-h-[700px] p-12 rounded-[48px] border border-slate-50 bg-slate-50 focus:bg-white focus:ring-[12px] focus:ring-indigo-50/50 outline-none text-slate-600 font-medium text-xl leading-[1.8] transition-all shadow-inner placeholder:text-slate-300 placeholder:italic" 
                          placeholder="Begin architecting your instructional narrative. Use Markdown formatting for optimal rendering..."
                          value={editData.content}
                          onChange={e => setEditData({...editData, content: e.target.value})}
                       />
                    </div>
                 </div>
              </div>
            </section>

          </div>

          {/* Right Panel: Smart Source Hub & Resources */}
          <div className="xl:col-span-4 space-y-12">
             
             {/* AI Knowledge Source Hub - Enhanced Vertical Layout */}
             <div className="bg-indigo-900/95 p-10 rounded-[56px] shadow-2xl shadow-indigo-200 border border-indigo-500/20 text-white space-y-8 sticky top-32">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/20"><Sparkles className="h-5 w-5 text-indigo-300" /></div>
                      <div>
                         <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-200 leading-none">Smart Nodal Engine</h4>
                         <p className="text-[9px] text-indigo-400 font-bold mt-1 uppercase tracking-widest">Source Material Extraction Hub</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   {/* YouTube */}
                   <div className="bg-indigo-800/40 p-6 rounded-[32px] border border-indigo-700/50 space-y-4 group">
                      <div className="flex items-center gap-3">
                         <Video className="h-4 w-4 text-red-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Integrated Video Feed</span>
                      </div>
                      <Input 
                        placeholder="Paste YouTube Link..."
                        value={ytUrl}
                        onChange={e => setYtUrl(e.target.value)}
                        className="bg-indigo-950/50 border-indigo-700/30 text-xs text-white h-12 rounded-xl focus:ring-indigo-500/30 placeholder:text-indigo-700 font-bold"
                      />
                      <Button 
                        disabled={isProcessingSource}
                        onClick={handleFetchYoutube}
                        className="w-full h-12 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                      >
                         {isProcessingSource ? <div className="h-4 w-4 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin" /> : "Authorize Fetch"}
                      </Button>
                   </div>

                   {/* PDF */}
                   <div className="bg-indigo-800/40 p-6 rounded-[32px] border border-indigo-700/50 space-y-4">
                      <div className="flex items-center gap-3">
                         <FileText className="h-4 w-4 text-cyan-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Document Ingestion</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="file" id="pdf-full" accept=".pdf" className="hidden" onChange={handleProcessPDF} />
                         <Label htmlFor="pdf-full" className="flex-1 h-12 border-2 border-dashed border-indigo-600/50 rounded-2xl flex items-center justify-center text-[9px] font-black uppercase cursor-pointer hover:bg-indigo-700/20 transition-all font-bold tracking-widest">
                            {isProcessingSource ? "AI Reading..." : "Upload PDF"}
                         </Label>
                         <div className="flex gap-1 items-center bg-indigo-950/50 px-3 py-1.5 rounded-2xl border border-indigo-700/30">
                            <Input type="number" value={pdfPages.start} onChange={e => setPdfPages({...pdfPages, start: parseInt(e.target.value) || 1})} className="w-10 h-8 bg-transparent border-none text-center text-xs font-black p-0 focus:ring-0" />
                            <span className="text-indigo-700 text-[9px] font-black">-</span>
                            <Input type="number" value={pdfPages.end} onChange={e => setPdfPages({...pdfPages, end: parseInt(e.target.value) || 1})} className="w-10 h-8 bg-transparent border-none text-center text-xs font-black p-0 focus:ring-0" />
                         </div>
                      </div>
                   </div>

                   {/* Text Hub */}
                   <Textarea 
                      value={sourceContext}
                      onChange={e => setSourceContext(e.target.value)}
                      placeholder="Extracted intelligence will materialize here..."
                      className="min-h-[250px] bg-indigo-950/40 border-indigo-700/30 rounded-[32px] text-xs text-indigo-100 placeholder:text-indigo-800 focus:ring-4 focus:ring-indigo-500/10 p-6 leading-relaxed shadow-inner"
                   />
                </div>

                <div className="pt-4 border-t border-indigo-800/50">
                   <div className="flex items-start gap-4 p-4 bg-indigo-950/20 rounded-2xl border border-indigo-800/30">
                      <AlertCircle className="h-5 w-5 text-indigo-500 shrink-0" />
                      <p className="text-[9px] text-indigo-400 font-bold leading-relaxed uppercase tracking-widest">
                         Note: Providing precise source material ensures the AI synthesis adheres strictly to your instructional guidelines.
                      </p>
                   </div>
                </div>
             </div>

             {/* Secondary Resource Fields */}
             <div className="bg-white p-10 rounded-[56px] shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <Monitor className="h-5 w-5 text-slate-400" />
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resource Delivery Plane</Label>
                </div>
                <div className="space-y-4">
                   <div className="relative">
                      <Input 
                        value={editData.videoUrl}
                        onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                        placeholder="Video Source URL..." 
                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-xs" 
                      />
                      <Video className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   </div>
                   <div className="relative">
                      <Input 
                        value={editData.attachmentUrl}
                        onChange={e => setEditData({...editData, attachmentUrl: e.target.value})}
                        placeholder="Downloadable Assets..." 
                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-xs" 
                      />
                      <FileText className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
