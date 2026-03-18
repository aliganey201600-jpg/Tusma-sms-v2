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
  Monitor,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichEditor } from "@/components/ui/rich-editor"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
  const [isGeneratingObjectives, setIsGeneratingObjectives] = React.useState(false)
  const [isProcessingSource, setIsProcessingSource] = React.useState(false)
  
  // AI Modal States
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false)
  const [aiSubMode, setAiSubMode] = React.useState<'topic' | 'paste' | 'pdf'>('topic')
  
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
          objectives: data.objectives || "",
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
      objectives: editData.objectives,
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

  const handleGenerateObjectivesAI = async () => {
    if (!editData?.title) return toast.error("Please enter a Lesson Title first")
    setIsGeneratingObjectives(true)
    const res = await generateLessonContentAI(editData.title, lesson?.section?.course?.name, sourceContext, 'objectives')
    if (res.error) {
       toast.error(res.error)
    } else if (res.content) {
       setEditData({...editData, objectives: res.content})
       toast.success("Strategic Objectives Generated! 🎯")
    }
    setIsGeneratingObjectives(false)
  }

  const handleGenerateContentAI = async () => {
    if (!editData?.title) return toast.error("Please enter a Lesson Title first")
    setIsGeneratingAI(true)
    
    // For Content AI, we prioritize sourceContext if it was extracted/pasted
    const res = await generateLessonContentAI(editData.title, lesson?.section?.course?.name, sourceContext, 'content')
    if (res.error) {
       toast.error(res.error)
    } else if (res.content) {
       setEditData({...editData, content: res.content})
       toast.success("Lesson Narrative Generated! ✨")
       setIsAIModalOpen(false)
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

                 {/* Objectives */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                       <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 leading-none">Lesson Learning Objectives</Label>
                       <div className="flex items-center gap-3">
                          <Button 
                            disabled={isGeneratingObjectives}
                            onClick={handleGenerateObjectivesAI}
                            variant="outline" 
                            className="h-7 rounded-full border-none bg-indigo-50 text-indigo-600 font-black text-[8px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all px-4"
                          >
                            {isGeneratingObjectives ? "Drafting..." : "AI Objectives"}
                          </Button>
                          <Badge className="bg-indigo-50 text-indigo-400 border-none font-black text-[9px] uppercase px-3 py-1">Strategic Goals</Badge>
                       </div>
                    </div>
                    <RichEditor 
                      content={editData.objectives}
                      onChange={(html) => setEditData({...editData, objectives: html})}
                      placeholder="Define the learning trajectory and mastery outcomes..."
                    />
                 </div>

                 {/* Content */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                       <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Curriculum Composition Suite</Label>
                       <div className="flex items-center gap-3">
                          <Button 
                            onClick={() => setIsAIModalOpen(true)}
                            variant="outline" 
                            className="h-8 rounded-full border-none bg-indigo-50 text-indigo-600 font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all px-4"
                          >
                             <Sparkles className="h-3 w-3 mr-2" /> AI Content Wizard
                          </Button>
                          <Badge className="bg-emerald-50 text-emerald-500 border-none font-black text-[9px] uppercase px-3 py-1 mt-0.5">Live Editor</Badge>
                       </div>
                    </div>

                    <RichEditor 
                       content={editData.content}
                       onChange={(html) => setEditData({...editData, content: html})}
                       placeholder="Architect your full instructional content here..."
                    />
                 </div>
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-12">
             {/* Secondary Resource Fields */}
             <div className="bg-white p-10 rounded-[56px] shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <Monitor className="h-5 w-5 text-slate-400" />
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resource Delivery Plane</Label>
                </div>
                <div className="space-y-4">
                   <Input 
                      value={editData.videoUrl}
                      onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                      placeholder="Video URL..." 
                      className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-xs" 
                   />
                   <Input 
                      value={editData.attachmentUrl}
                      onChange={e => setEditData({...editData, attachmentUrl: e.target.value})}
                      placeholder="Attachment URL..." 
                      className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-xs" 
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* AI Content Wizard Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
          <div className="bg-indigo-600 p-8 text-white relative">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
             <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                   <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <Sparkles className="h-5 w-5" />
                   </div>
                   <div className="space-y-0.5 text-left">
                      <DialogTitle className="text-xl font-black uppercase tracking-tight text-white mb-0">AI Content Architect</DialogTitle>
                      <DialogDescription className="text-indigo-100/70 text-[10px] uppercase font-black tracking-widest leading-none">Intelligence-Driven Generation</DialogDescription>
                   </div>
                </div>
             </DialogHeader>
          </div>

          <div className="p-10 space-y-8">
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Confirm Lesson Topic</Label>
                <Input 
                  value={editData.title}
                  onChange={e => setEditData({...editData, title: e.target.value})}
                  className="h-16 rounded-2xl border-none bg-white shadow-inner font-black px-8 text-indigo-600 text-lg"
                />
             </div>

             <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'topic', label: 'Topic Only', icon: Sparkles },
                  { id: 'paste', label: 'Copy & Paste', icon: LinkIcon },
                  { id: 'pdf', label: 'PDF Upload', icon: FileText }
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => setAiSubMode(mode.id as any)}
                    className={cn(
                      "p-6 rounded-[28px] border-2 transition-all text-center space-y-3",
                      aiSubMode === mode.id ? "bg-white border-indigo-500 shadow-lg" : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                    )}
                  >
                     <div className={cn("h-12 w-12 rounded-2xl mx-auto flex items-center justify-center", aiSubMode === mode.id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400")}>
                        <mode.icon className="h-6 w-6" />
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-tight text-slate-900">{mode.label}</div>
                  </button>
                ))}
             </div>

             {aiSubMode === 'paste' && (
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Paste Source Material</Label>
                   <Textarea 
                     value={sourceContext}
                     onChange={e => setSourceContext(e.target.value)}
                     className="min-h-[150px] rounded-3xl border-none bg-white shadow-inner p-6"
                   />
                </div>
             )}

             {aiSubMode === 'pdf' && (
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <input type="file" id="ai-pdf-modal" accept=".pdf" className="hidden" onChange={handleProcessPDF} />
                      <Label htmlFor="ai-pdf-modal" className="flex h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white items-center justify-center cursor-pointer font-black uppercase text-[10px]">
                         {isProcessingSource ? "Reading..." : "Attach PDF"}
                      </Label>
                   </div>
                   <div className="flex items-center gap-2 bg-white rounded-2xl h-16 px-4 shadow-inner">
                      <Input type="number" value={pdfPages.start} onChange={e => setPdfPages({...pdfPages, start: parseInt(e.target.value) || 1})} className="w-full border-none text-center font-black" />
                      <Input type="number" value={pdfPages.end} onChange={e => setPdfPages({...pdfPages, end: parseInt(e.target.value) || 1})} className="w-full border-none text-center font-black" />
                   </div>
                </div>
             )}

             <Button 
                onClick={handleGenerateContentAI}
                disabled={isGeneratingAI}
                className="w-full h-18 rounded-[24px] bg-indigo-600 text-white font-black uppercase tracking-[0.1em] text-[12px] shadow-2xl"
             >
                {isGeneratingAI ? "Architecting..." : "Architect Lesson Content"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
