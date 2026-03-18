"use client"

import * as React from "react"
import { 
  Plus, 
  GripVertical, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  Trash2, 
  Settings2,
  BookOpen,
  Video,
  Layout,
  Save,
  ChevronDown,
  LayoutGrid,
  Zap,
  MoreVertical,
  X,
  FileDown,
  ListChecks,
  ExternalLink,
  ChevronRightCircle,
  Type,
  Bold,
  Italic,
  Underline,
  PenLine,
  Library,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Link as LinkIcon,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  getCourseStructure, 
  addSection, 
  addLesson, 
  addQuiz, 
  deleteSection,
  updateLesson,
  updateQuiz,
  reorderSections,
  reorderItems,
  generateLessonContentAI,
  fetchYoutubeTranscript,
  extractPdfTextAction
} from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// ─── Sortable Item Component ───────────────────────────────────────────────
function SortableItem({ id, item, activeId, onClick, type }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = activeId === item.id;
  const isQuiz = type === 'quiz';

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={isActive ? undefined : onClick}
      className={cn(
        "group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent mb-2",
        isActive 
          ? (isQuiz ? "bg-amber-50 border-amber-100 shadow-sm" : "bg-indigo-50 border-indigo-100 shadow-sm")
          : "bg-white hover:bg-slate-50 border-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="h-8 w-6 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
          isActive 
            ? (isQuiz ? "bg-white text-amber-600 shadow-sm" : "bg-white text-indigo-600 shadow-sm")
            : "bg-slate-50 text-slate-300"
        )}>
          {isQuiz ? <Zap className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{item.title}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            {isQuiz ? `Assessment Hub • ${item.passingScore || 70}% Threshold` : `Learning Node • ${item.duration || 0}m Session`}
          </p>
        </div>
      </div>
      <ChevronRight className={cn("h-4 w-4 transition-all", isActive ? "text-indigo-400 translate-x-1" : "text-slate-200 group-hover:text-slate-400")} />
    </div>
  );
}

// ─── Sortable Section Component ──────────────────────────────────────────────
function SortableSection({ 
  section, 
  sIdx, 
  sensors, 
  handleItemDragEnd, 
  handleAddLesson, 
  handleAddQuiz, 
  deleteSection, 
  loadCourse, 
  activeItem, 
  handleSelectItem, 
  courseId,
  isExpanded,
  onToggle
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const interleavedItems = React.useMemo(() => {
    return [
      ...(section.lessons || []).map((l: any) => ({ ...l, type: 'lesson' })),
      ...(section.quizzes || []).map((q: any) => ({ ...q, type: 'quiz' }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [section]);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        "border-none shadow-sm rounded-3xl overflow-hidden bg-white mb-4 transition-all duration-500", 
        isDragging && "opacity-50 ring-2 ring-indigo-500", 
        isExpanded ? "shadow-2xl shadow-indigo-100 ring-1 ring-indigo-50 border-b-4 border-indigo-600" : "hover:shadow-md hover:bg-slate-50/30"
      )}>
        <CardContent className="p-0">
          <div 
            className={cn(
               "p-6 flex items-center justify-between transition-all cursor-pointer group/header",
               isExpanded ? "bg-white" : "bg-white hover:bg-slate-50/50"
            )}
            onClick={onToggle}
          >
            <div className="flex items-center gap-5">
              <div 
                {...attributes} 
                {...listeners} 
                className="h-8 w-6 flex items-center justify-center text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <div className={cn(
                "h-12 w-12 rounded-[18px] shadow-sm flex items-center justify-center text-xs font-black transition-all duration-500",
                isExpanded ? "bg-indigo-600 text-white scale-110 shadow-indigo-200" : "bg-slate-50 text-slate-400"
              )}>
                {sIdx + 1}
              </div>
              <div>
                <h3 className={cn(
                  "font-black tracking-tight transition-colors uppercase text-[13px]",
                  isExpanded ? "text-indigo-600" : "text-slate-900 group-hover/header:text-indigo-500"
                )}>
                  {section.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <Library className="h-3 w-3 text-slate-300" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {interleavedItems.length} Nodes Published
                    </p>
                  </div>
                  {isExpanded && <span className="h-1 w-1 rounded-full bg-indigo-200" />}
                  {isExpanded && (
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Design Phase Active</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-[14px] border border-slate-100 bg-white flex items-center justify-center transition-all duration-500",
                isExpanded ? "rotate-180 bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "text-slate-200 group-hover/header:text-indigo-400 group-hover/header:border-indigo-100"
              )}>
                <ChevronDown className="h-5 w-5" />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[14px] transition-all opacity-0 group-hover/header:opacity-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSection(section.id).then(loadCourse);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className={cn(
            "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden bg-slate-50/30",
            isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-6 pt-2">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={(e) => handleItemDragEnd(section.id, e)} 
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext 
                  items={interleavedItems.map(i => i.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {interleavedItems.map((item) => (
                      <div key={item.id}>
                        <SortableItem 
                          id={item.id} 
                          item={item} 
                          type={item.type}
                          activeId={activeItem?.data?.id}
                          onClick={() => handleSelectItem({ type: item.type, data: item })}
                        />
                        {item.type === 'quiz' && activeItem?.data?.id === item.id && (
                          <div className="ml-14 mb-6 mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
                             <Link
                              href={`/dashboard/admin/courses/${courseId}/quiz/${item.id}`}
                              className="flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-600 rounded-2xl transition-all w-fit shadow-xl shadow-amber-100/20 border border-amber-100/50 group/quiz-btn"
                              onClick={e => e.stopPropagation()}
                            >
                              <Zap className="h-4 w-4 transition-transform group-hover/quiz-btn:scale-125" /> 
                              Launch Question Architect
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                    {interleavedItems.length === 0 && (
                      <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-white/50">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-200">
                           <LayoutGrid className="h-6 w-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Section Empty • Deploy Nodes Below</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button 
                  variant="ghost" 
                  className="h-16 rounded-[24px] border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all gap-3 group/node"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddLesson(section.id);
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/node:bg-white/10 text-slate-300 group-hover/node:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                  New Lecture Node
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-16 rounded-[24px] border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all gap-3 group/assess"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddQuiz(section.id);
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/assess:bg-white/10 text-slate-300 group-hover/assess:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                  New Assessment Hub
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CourseBuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [newSectionTitle, setNewSectionTitle] = React.useState("")
  const [isAddingSection, setIsAddingSection] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState<any>(null)
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false)
  const [isProcessingSource, setIsProcessingSource] = React.useState(false)
  const [sourceContext, setSourceContext] = React.useState("")
  const [ytUrl, setYtUrl] = React.useState("")
  const [pdfPages, setPdfPages] = React.useState({ start: 1, end: 5 })
  const [expandedSectionId, setExpandedSectionId] = React.useState<string | null>(null)

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
    if (!editData?.title || editData.title === "New Lesson") {
      toast.error("Please enter a specific Lesson Title first to guide the AI.")
      return
    }
    setIsGeneratingAI(true)
    const contextWithRange = sourceContext ? (
      `SOURCE RANGE: Please focus specifically on the content between pages ${pdfPages.start} and ${pdfPages.end} (if applicable) or the video content described below:\n\n` + 
      sourceContext
    ) : ""

    const res = await generateLessonContentAI(editData.title, course?.name, contextWithRange)
    if (res.error) {
       toast.error(res.error)
    } else if (res.content) {
       setEditData({...editData, content: res.content})
       toast.success("AI Content Generated based on your Selection! ✨")
    }
    setIsGeneratingAI(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadCourse = React.useCallback(async () => {
    setLoading(true)
    const data = await getCourseStructure(id as string)
    if (data) setCourse(data)
    setLoading(false)
  }, [id])

  React.useEffect(() => {
    loadCourse()
  }, [loadCourse])

  const handleAddSection = async () => {
    if (!newSectionTitle) return
    setIsAddingSection(true)
    try {
      const res = await addSection(id as string, newSectionTitle)
      if (res.success) {
        setNewSectionTitle("")
        loadCourse()
        toast.success("Structural Chapter Integrated")
      } else {
        toast.error(res.error || "Integration Failure")
      }
    } catch (err) {
      toast.error("Network Architecture Error")
    } finally {
      setIsAddingSection(false)
    }
  }

  const handleAddLesson = async (sectionId: string) => {
    // Ensure section is expanded when adding
    setExpandedSectionId(sectionId)
    const res = await addLesson(sectionId, "New Lesson")
    if (res.success) {
      loadCourse()
      toast.success("Lecture Node Deployed")
    }
  }

  const handleAddQuiz = async (sectionId: string) => {
    // Ensure section is expanded when adding
    setExpandedSectionId(sectionId)
    const res = await addQuiz(sectionId, "New Quiz Challenge")
    if (res.success) {
      loadCourse()
      toast.success("Assessment Hub Active")
    }
  }

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = course.sections.findIndex((s: any) => s.id === active.id);
    const newIndex = course.sections.findIndex((s: any) => s.id === over.id);

    const newSections = arrayMove(course.sections, oldIndex, newIndex);
    setCourse({ ...course, sections: newSections });

    const updates = newSections.map((s: any, idx: number) => ({ id: s.id, order: idx }));
    await reorderSections(id as string, updates);
  }

  const handleItemDragEnd = async (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const section = course.sections.find((s: any) => s.id === sectionId);
    if (!section) return;

    const items = [
      ...(section.lessons || []).map((l: any) => ({ ...l, type: 'lesson' })),
      ...(section.quizzes || []).map((q: any) => ({ ...q, type: 'quiz' }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = items.findIndex((i: any) => i.id === active.id);
    const newIndex = items.findIndex((i: any) => i.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    const updates = newItems.map((item: any, idx: number) => ({ id: item.id, type: item.type, order: idx }));

    // Optimistic update
    const updatedSections = course.sections.map((s: any) => {
      if (s.id === sectionId) {
        return {
          ...s,
          lessons: newItems.filter((i: any) => i.type === 'lesson'),
          quizzes: newItems.filter((i: any) => i.type === 'quiz')
        };
      }
      return s;
    });
    setCourse({ ...course, sections: updatedSections });

    const res = await reorderItems(id as string, updates);
    if (!res.success) {
      toast.error("Hierarchy Synchronization Failed");
      loadCourse();
    }
  }

  const handleSelectItem = (item: any) => {
    setActiveItem(item)
    setEditData(item.data)
  }

  const handleSaveChanges = async () => {
    if (!activeItem || !editData) return
    setIsSaving(true)
    try {
      let res;
      if (activeItem.type === 'lesson') {
        res = await updateLesson(activeItem.data.id, {
          title: editData.title,
          videoUrl: editData.videoUrl,
          content: editData.content,
          objectives: editData.objectives,
          attachmentUrl: editData.attachmentUrl,
          duration: Number(editData.duration)
        })
      } else {
        res = await updateQuiz(activeItem.data.id, {
          title: editData.title,
          passingScore: Number(editData.passingScore),
          timeLimit: Number(editData.timeLimit)
        })
      }

      if (res.success) {
        toast.success("Repository Updated")
        loadCourse()
        setActiveItem({ ...activeItem, data: { ...activeItem.data, ...editData } })
      } else {
        toast.error("Update Sequence Aborted")
      }
    } catch (err) {
      toast.error("Integrity Verification Error")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading && !course) return (
     <div className="flex items-center justify-center min-h-screen bg-[#FDFDFD]">
        <div className="flex flex-col items-center gap-6">
           <div className="h-16 w-16 bg-slate-900 rounded-[24px] flex items-center justify-center animate-bounce shadow-2xl">
              <Layout className="h-8 w-8 text-white" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Builder Workspace...</p>
        </div>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Premium Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-white/80">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-[16px] bg-slate-950 flex items-center justify-center shadow-2xl shadow-slate-200">
            <Layout className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight uppercase">{course?.name}</h1>
            <div className="flex items-center gap-2 mt-2">
               <Badge className="bg-indigo-50 text-indigo-500 border-none px-2 rounded-md text-[8px] font-black uppercase tracking-widest">Architect v2.4</Badge>
               <span className="h-1 w-1 rounded-full bg-slate-200" />
               <p className="text-[11px] font-bold text-slate-400">Institutional Curriculum Lab</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="h-12 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest px-8 hover:bg-slate-50 transition-all" onClick={() => router.push(`/dashboard/admin/courses/${id}`)}>
            Governance Dashboard
          </Button>
          <Link href={`/dashboard/admin/courses/${id}/preview`}>
            <Button className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border-none px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
               Entry Preview
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto p-12 grid grid-cols-12 gap-12">
        {/* Left: Hierarchy */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
          <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-50">
            <div className="space-y-1">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-1">Curriculum Structural Mapping</h2>
              <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">{course?.sections?.length || 0} Core Chapters</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
               <Library className="h-7 w-7" />
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={course?.sections?.map((s:any) => s.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {course?.sections?.map((section: any, sIdx: number) => (
                  <SortableSection 
                    key={section.id}
                    section={section}
                    sIdx={sIdx}
                    sensors={sensors}
                    handleItemDragEnd={handleItemDragEnd}
                    handleAddLesson={handleAddLesson}
                    handleAddQuiz={handleAddQuiz}
                    deleteSection={deleteSection}
                    loadCourse={loadCourse}
                    activeItem={activeItem}
                    handleSelectItem={handleSelectItem}
                    courseId={id}
                    isExpanded={expandedSectionId === section.id}
                    onToggle={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Card className="bg-slate-50 p-8 rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner group">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Plus className="h-5 w-5" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Initialize Strategic Chapter</h4>
              </div>
              <div className="flex gap-4">
                <Input 
                   placeholder="Strategic Designation Name..." 
                   value={newSectionTitle}
                   onChange={(e) => setNewSectionTitle(e.target.value)}
                   className="h-16 rounded-[24px] bg-white border-none shadow-sm font-black text-xs px-8 uppercase tracking-widest placeholder:text-slate-200"
                />
                <Button 
                  onClick={handleAddSection}
                  disabled={isAddingSection || !newSectionTitle}
                  className="h-16 w-16 rounded-[24px] bg-slate-950 text-white shadow-2xl shadow-slate-200 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  {isAddingSection ? <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowRight className="h-7 w-7" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Workspace */}
        <div className="col-span-12 lg:col-span-7">
          {activeItem ? (
            <div className="sticky top-32 animate-in fade-in slide-in-from-right-12 duration-1000">
               <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] rounded-[60px] overflow-hidden bg-white ring-1 ring-slate-100">
                  <header className="p-12 border-b border-slate-50 flex items-center justify-between bg-white relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />
                     <div className="flex items-center gap-6">
                        <div className={cn(
                          "h-16 w-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-transform duration-500 hover:rotate-6",
                          activeItem.type === 'lesson' ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-amber-500 text-white shadow-amber-200"
                        )}>
                           {activeItem.type === 'lesson' ? <Video className="h-8 w-8" /> : <Zap className="h-8 w-8" />}
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-slate-900 leading-none uppercase tracking-tight">{activeItem.data.title}</h3>
                           <div className="flex items-center gap-2 mt-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1 bg-slate-50 rounded-lg">Content Workspace Editor</p>
                              <span className="h-1 w-1 rounded-full bg-slate-200" />
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Live Syncing</p>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                          {activeItem.type === 'lesson' && (
                             <Link href={`/dashboard/admin/courses/${id}/builder/lesson/${activeItem.data.id}`}>
                                <Button variant="outline" className="h-16 w-16 rounded-[24px] border-slate-100 shadow-xl group/fs flex flex-col gap-1 items-center justify-center">
                                   <Maximize2 className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                   <span className="text-[7px] font-black uppercase text-slate-300">Expand</span>
                                </Button>
                             </Link>
                          )}
                          <Button 
                            disabled={isSaving}
                            onClick={handleSaveChanges}
                            className="h-16 px-12 rounded-[24px] bg-slate-950 text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-2xl shadow-slate-200 hover:scale-[1.05] active:scale-[0.95] transition-all border-b-4 border-slate-800 active:border-b-0"
                          >
                            {isSaving ? <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
                            Commit Strategy
                          </Button>
                       </div>
                   </header>

                  <CardContent className="p-12">
                     {activeItem.type === 'lesson' ? (
                        <div className="space-y-12">
                          <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Lecture Designation</Label>
                              <Input 
                                value={editData?.title || ""} 
                                onChange={e => setEditData({...editData, title: e.target.value})}
                                className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-black text-sm px-8 uppercase tracking-widest shadow-sm" 
                              />
                            </div>
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Instructional Window (Min)</Label>
                              <div className="relative">
                                <Input 
                                  type="number"
                                  value={editData?.duration || ""} 
                                  onChange={e => setEditData({...editData, duration: e.target.value})}
                                  className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-black text-sm px-8 uppercase tracking-widest shadow-sm" 
                                />
                                <Clock className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                              </div>
                            </div>
                          </div>

                          {/* AI Source Context Section */}
                          <div className="space-y-6 bg-indigo-50/40 p-10 rounded-[48px] border-2 border-indigo-100 shadow-xl shadow-indigo-50">
                             <div className="flex items-center justify-between ml-2">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-700 leading-none">AI Smart Knowledge Hub</Label>
                                   </div>
                                   <p className="text-[10px] font-bold text-slate-500">Feed the AI with your PDF or Video for 100% accuracy</p>
                                </div>
                                <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Assistant v2.0</Badge>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* YouTube Option */}
                                <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 border border-slate-100 group hover:border-red-100 transition-all">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center transition-transform group-hover:scale-110"><Video className="h-5 w-5" /></div>
                                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">YouTube Source</span>
                                      </div>
                                      <Badge variant="outline" className="border-red-100 text-red-500 text-[8px] font-black">Link Needed</Badge>
                                   </div>
                                   <div className="space-y-3">
                                      <div className="relative">
                                         <Input 
                                           placeholder="PASTE YOUTUBE URL HERE..."
                                           value={ytUrl}
                                           onChange={e => setYtUrl(e.target.value)}
                                           className="h-14 rounded-2xl bg-slate-50 border-none text-[12px] font-bold px-6 placeholder:text-slate-300"
                                         />
                                      </div>
                                      <Button 
                                        disabled={isProcessingSource}
                                        onClick={handleFetchYoutube}
                                        className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                      >
                                        {isProcessingSource ? (
                                          <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Fetching...</span>
                                        ) : "Fetch Video Transcript"}
                                      </Button>
                                   </div>
                                </div>

                                {/* PDF Option */}
                                <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 border border-slate-100 group hover:border-indigo-200 transition-all">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center transition-transform group-hover:scale-110"><FileText className="h-5 w-5" /></div>
                                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">PDF Document</span>
                                      </div>
                                      <Badge variant="outline" className="border-indigo-100 text-indigo-500 text-[8px] font-black">Page Range</Badge>
                                   </div>
                                   <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                         <Input 
                                           type="file" 
                                           accept=".pdf"
                                           onChange={handleProcessPDF}
                                           className="hidden" 
                                           id="pdf-upload"
                                         />
                                         <Label htmlFor="pdf-upload" className="flex-1 h-14 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase cursor-pointer hover:bg-indigo-50 transition-all bg-indigo-50/20">
                                            {isProcessingSource ? "AI Reading..." : "Upload PDF File"}
                                         </Label>
                                         <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <Input 
                                               type="number" 
                                               value={pdfPages.start}
                                               onChange={e => setPdfPages({...pdfPages, start: parseInt(e.target.value) || 1})}
                                               className="w-12 h-10 rounded-xl bg-white border-none text-center text-[11px] font-black p-0" 
                                            />
                                            <span className="text-slate-300 font-bold mx-0.5">to</span>
                                            <Input 
                                               type="number" 
                                               value={pdfPages.end}
                                               onChange={e => setPdfPages({...pdfPages, end: parseInt(e.target.value) || 1})}
                                               className="w-12 h-10 rounded-xl bg-white border-none text-center text-[11px] font-black p-0" 
                                            />
                                         </div>
                                      </div>
                                      <p className="text-[9px] text-center text-slate-400 font-bold italic">Page Range selects which parts the AI extracts.</p>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 ml-4">Extracted Knowledge Base</Label>
                                <Textarea 
                                  value={sourceContext}
                                  onChange={e => setSourceContext(e.target.value)}
                                  placeholder="Extracted text will appear here. You can also paste manually..."
                                  className="min-h-[150px] rounded-[30px] border-indigo-100 bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-600 p-8 shadow-inner text-sm leading-relaxed"
                                />
                             </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between ml-2">
                               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scholastic Narrative Engine</Label>
                               <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleGenerateAI}
                                    disabled={isGeneratingAI}
                                    className="h-7 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border-none hover:bg-indigo-100 hover:text-indigo-700 transition-all px-3"
                                  >
                                    {isGeneratingAI ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> Generating...</span> : <span className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> Generate via AI</span>}
                                  </Button>
                                  <Badge className="bg-emerald-50 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest leading-normal pt-1.5">AutoSave Enabled</Badge>
                               </div>
                            </div>
                            <div className="relative group">
                              <div className="absolute top-6 right-8 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-xl hover:bg-slate-50"><Bold className="h-4 w-4" /></Button>
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-xl hover:bg-slate-50"><Italic className="h-4 w-4" /></Button>
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-xl hover:bg-slate-50"><LinkIcon className="h-4 w-4" /></Button>
                              </div>
                              <textarea 
                                className="w-full min-h-[500px] p-10 rounded-[40px] border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none text-slate-600 font-medium text-lg leading-relaxed transition-all shadow-inner" 
                                placeholder="Architect your instructional narrative..."
                                value={editData?.content || ""}
                                onChange={e => setEditData({...editData, content: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-10">
                             <div className="space-y-4">
                               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Optical Resource Vector (URL)</Label>
                               <div className="relative">
                                  <Input 
                                    value={editData?.videoUrl || ""} 
                                    onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                                    placeholder="Source: YouTube / Vimeo / CDN" 
                                    className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white font-bold px-8 shadow-sm" 
                                  />
                                  <Video className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                               </div>
                             </div>
                             <div className="space-y-4">
                               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Supplemental Datasheet (URL)</Label>
                               <div className="relative">
                                  <Input 
                                    value={editData?.attachmentUrl || ""} 
                                    onChange={e => setEditData({...editData, attachmentUrl: e.target.value})}
                                    placeholder="Storage: Drive / S3 / Dropbox" 
                                    className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white font-bold px-8 shadow-sm" 
                                  />
                                  <FileText className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                               </div>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-12">
                           <div className="bg-amber-50/70 rounded-[48px] p-12 border border-amber-100 shadow-inner group">
                              <div className="grid grid-cols-2 gap-10">
                                 <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-amber-700 tracking-[0.3em] ml-2">Mastery Benchmark (%)</Label>
                                    <div className="relative">
                                      <Input 
                                        type="number" 
                                        value={editData?.passingScore || ""} 
                                        onChange={e => setEditData({...editData, passingScore: e.target.value})}
                                        className="bg-white border-white h-18 rounded-[28px] text-3xl font-black text-amber-900 px-10 shadow-2xl shadow-amber-200/50" 
                                      />
                                      <div className="absolute right-8 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-xl">%</div>
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-amber-700 tracking-[0.3em] ml-2">Tempo Constraint (Min)</Label>
                                    <div className="relative">
                                      <Input 
                                        type="number" 
                                        value={editData?.timeLimit || ""} 
                                        onChange={e => setEditData({...editData, timeLimit: e.target.value})}
                                        placeholder="Infinity" 
                                        className="bg-white border-white h-18 rounded-[28px] text-3xl font-black text-amber-900 px-10 shadow-2xl shadow-amber-200/50" 
                                      />
                                      <Clock className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 text-amber-400 opacity-30" />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="p-16 border-2 border-dashed border-slate-100 rounded-[60px] text-center space-y-10 bg-slate-50/20 group">
                              <div className="relative mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-indigo-500/10 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all" />
                                <div className="relative h-32 w-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center mx-auto text-indigo-500 transition-all group-hover:scale-110 group-hover:-rotate-3">
                                  <Settings2 className="h-14 w-14" />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Proprietary logic builder</h4>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Complex question routing, automated grading schemas, and response logic are finalized in the specialized Question Lab.</p>
                              </div>
                              <Link href={`/dashboard/admin/courses/${id}/quiz/${activeItem.data.id}`} className="block">
                                <Button className="h-16 px-12 rounded-[24px] bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-[11px] gap-4 shadow-2xl shadow-indigo-100 transition-all group/lab">
                                  <ExternalLink className="h-5 w-5 group-hover:rotate-45 transition-transform" /> 
                                  Enter Strategic Question Lab
                                </Button>
                              </Link>
                           </div>
                        </div>
                      )}
                  </CardContent>
               </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 bg-white rounded-[70px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.03)] border border-slate-50 min-h-[850px] relative overflow-hidden group">
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-50/50 rounded-full blur-[100px] group-hover:bg-indigo-100 transition-all duration-1000" />
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-50/50 rounded-full blur-[100px] group-hover:bg-amber-100 transition-all duration-1000" />
               
               <div className="h-40 w-40 rounded-[50px] bg-slate-50 flex items-center justify-center text-slate-100 relative shadow-inner group-hover:scale-110 transition-transform duration-700">
                  <LayoutGrid className="h-20 w-20" />
                  <div className="absolute -top-6 -right-6 h-16 w-16 rounded-[24px] bg-slate-950 flex items-center justify-center text-white shadow-2xl animate-bounce">
                    <Plus className="h-8 w-8" />
                  </div>
               </div>
               <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Workspace Initialized</h3>
                  <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold text-lg">Infrastructure is operational. Select a curriculum node from the sidebar to begin structural design.</p>
               </div>
               <div className="flex gap-4 relative z-10">
                  <div className="px-8 py-4 bg-slate-50 rounded-[20px] text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 hover:text-indigo-500 hover:border-indigo-100 transition-all">Select Chapter</div>
                  <div className="px-8 py-4 bg-slate-50 rounded-[20px] text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 hover:text-amber-500 hover:border-amber-100 transition-all">Define Logic</div>
                  <div className="px-8 py-4 bg-slate-50 rounded-[20px] text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 hover:text-emerald-500 hover:border-emerald-100 transition-all">Commit Node</div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}



