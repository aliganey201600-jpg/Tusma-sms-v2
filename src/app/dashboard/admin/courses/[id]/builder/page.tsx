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
  Underline
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
  reorderItems
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
          <p className="text-sm font-bold text-slate-900">{item.title}</p>
          <p className="text-[10px] font-medium text-slate-400">
            {isQuiz ? `Knowledge Check • ${item.passingScore || 70}% Pass` : `Video Lesson • ${item.duration || 0}m`}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400" />
    </div>
  );
}

// ─── Sortable Section Component ──────────────────────────────────────────────
function SortableSection({ section, sIdx, sensors, handleItemDragEnd, handleAddLesson, handleAddQuiz, deleteSection, loadCourse, activeItem, handleSelectItem, courseId }: any) {
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
      <Card className={cn("border-none shadow-sm rounded-3xl overflow-hidden bg-white mb-8", isDragging && "opacity-50 ring-2 ring-indigo-500")}>
        <CardContent className="p-0">
          <div className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div {...attributes} {...listeners} className="h-8 w-6 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">
                {sIdx + 1}
              </div>
              <h3 className="font-black text-slate-900">{section.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteSection(section.id).then(loadCourse)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
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
                <div className="space-y-1">
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
                        <div className="ml-10 mb-6 flex flex-col gap-2">
                           <Link
                            href={`/dashboard/admin/courses/${courseId}/quiz/${item.id}`}
                            className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-600 rounded-xl transition-all w-fit shadow-sm"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Build Quiz Questions →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                  {interleavedItems.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-xs font-bold">
                      Empty Section
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button 
                variant="ghost" 
                className="h-11 rounded-2xl border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                onClick={() => handleAddLesson(section.id)}
              >
                <Plus className="h-3.5 w-3.5 mr-2" /> Add Lesson
              </Button>
              <Button 
                variant="ghost" 
                className="h-11 rounded-2xl border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                onClick={() => handleAddQuiz(section.id)}
              >
                <Plus className="h-3.5 w-3.5 mr-2" /> Add Quiz
              </Button>
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
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([])

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
        toast.success("Section added successfully")
      } else {
        toast.error(res.error || "Failed to add section")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setIsAddingSection(false)
    }
  }

  const handleAddLesson = async (sectionId: string) => {
    const res = await addLesson(sectionId, "New Lesson")
    if (res.success) {
      loadCourse()
      toast.success("Lesson added")
    }
  }

  const handleAddQuiz = async (sectionId: string) => {
    const res = await addQuiz(sectionId, "New Quiz Challenge")
    if (res.success) {
      loadCourse()
      toast.success("Quiz added")
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
      toast.error("Failed to reorder items");
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
        toast.success("Updated successfully")
        loadCourse()
        setActiveItem({ ...activeItem, data: { ...activeItem.data, ...editData } })
      } else {
        toast.error("Failed to save")
      }
    } catch (err) {
      toast.error("Error saving")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading && !course) return (
     <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Premium Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-[14px] bg-slate-900 flex items-center justify-center shadow-lg">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">{course?.name}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase mt-1.5 tracking-widest">Master Architect</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="h-11 rounded-2xl text-slate-400 font-bold px-6 hover:bg-slate-50" onClick={() => router.back()}>
            Exit Builder
          </Button>
          <Link href={`/dashboard/admin/courses/${id}/preview`}>
            <Button className="h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border-none px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 transition-all">
              Preview Workspace
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-10 grid grid-cols-12 gap-10">
        {/* Left: Hierarchy */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Curriculum Hierarchy</h2>
            <Badge className="bg-slate-100 text-slate-500 font-black border-none px-4 py-1.5 rounded-full">
              {course?.sections?.length || 0} Chapters
            </Badge>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={course?.sections?.map((s:any) => s.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-dashed border-slate-200">
            <div className="flex gap-3">
              <Input 
                 placeholder="New Chapter Title..." 
                 value={newSectionTitle}
                 onChange={(e) => setNewSectionTitle(e.target.value)}
                 className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold text-sm px-6"
              />
              <Button 
                onClick={handleAddSection}
                disabled={isAddingSection || !newSectionTitle}
                className="h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 disabled:opacity-50 transition-all"
              >
                {isAddingSection ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Plus className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Workspace */}
        <div className="col-span-12 lg:col-span-7">
          {activeItem ? (
            <div className="sticky top-28 animate-in fade-in slide-in-from-right-8 duration-700">
               <Card className="border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[48px] overflow-hidden bg-white">
                  <header className="p-10 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl",
                          activeItem.type === 'lesson' ? "bg-indigo-600 text-white" : "bg-amber-500 text-white shadow-amber-100"
                        )}>
                           {activeItem.type === 'lesson' ? <Video className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 leading-none">{activeItem.data.title}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1 border-l-2 border-slate-100">Workspace Editor</p>
                        </div>
                      </div>
                      <Button 
                        disabled={isSaving}
                        onClick={handleSaveChanges}
                        className="h-14 px-10 rounded-[20px] bg-slate-950 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                        Commit Changes
                      </Button>
                   </header>

                  <CardContent className="p-10">
                     {activeItem.type === 'lesson' ? (
                        <div className="space-y-10">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Lesson Title</Label>
                              <Input 
                                value={editData?.title || ""} 
                                onChange={e => setEditData({...editData, title: e.target.value})}
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold px-6" 
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Est. Duration (Min)</Label>
                              <Input 
                                type="number"
                                value={editData?.duration || ""} 
                                onChange={e => setEditData({...editData, duration: e.target.value})}
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold px-6" 
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Main Narrative Content</Label>
                            <div className="relative group">
                              <div className="absolute top-4 right-4 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm"><Bold className="h-3.5 w-3.5" /></Button>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm"><Italic className="h-3.5 w-3.5" /></Button>
                              </div>
                              <textarea 
                                className="w-full min-h-[400px] p-8 rounded-[32px] border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-100 outline-none text-slate-600 font-medium leading-relaxed transition-all" 
                                placeholder="Architect your lesson narrative here..."
                                value={editData?.content || ""}
                                onChange={e => setEditData({...editData, content: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Video Source URL</Label>
                               <Input 
                                 value={editData?.videoUrl || ""} 
                                 onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                                 placeholder="YouTube / Vimeo link" 
                                 className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold px-6" 
                               />
                             </div>
                             <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Resource / PDF Link</Label>
                               <Input 
                                 value={editData?.attachmentUrl || ""} 
                                 onChange={e => setEditData({...editData, attachmentUrl: e.target.value})}
                                 placeholder="Google Drive / Dropbox" 
                                 className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold px-6" 
                               />
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-10">
                           <div className="bg-amber-50/50 rounded-[32px] p-10 border border-amber-100/50">
                              <div className="grid grid-cols-2 gap-8">
                                 <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-amber-700 tracking-widest ml-1">Passing Threshold (%)</Label>
                                    <Input 
                                      type="number" 
                                      value={editData?.passingScore || ""} 
                                      onChange={e => setEditData({...editData, passingScore: e.target.value})}
                                      className="bg-white border-white h-14 rounded-2xl text-lg font-black text-amber-900 px-6 shadow-sm shadow-amber-200/20" 
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-amber-700 tracking-widest ml-1">Time Constraint (Min)</Label>
                                    <Input 
                                      type="number" 
                                      value={editData?.timeLimit || ""} 
                                      onChange={e => setEditData({...editData, timeLimit: e.target.value})}
                                      placeholder="Unlimited" 
                                      className="bg-white border-white h-14 rounded-2xl text-lg font-black text-amber-900 px-6 shadow-sm shadow-amber-200/20" 
                                   />
                                 </div>
                              </div>
                           </div>

                           <div className="p-12 border-2 border-dashed border-slate-100 rounded-[40px] text-center space-y-6">
                              <div className="h-20 w-20 rounded-[24px] bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                <Settings2 className="h-10 w-10" />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900">Complex Question Builder</h4>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">Questions for this quiz are managed in the specialized builder workspace for maximum control over marking and logic.</p>
                              </div>
                              <Link href={`/dashboard/admin/courses/${id}/quiz/${activeItem.data.id}`}>
                                <Button className="h-14 px-10 rounded-[20px] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-amber-100">
                                  <ExternalLink className="h-4 w-4" /> Open Question Workspace
                                </Button>
                              </Link>
                           </div>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white rounded-[60px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.03)] border-2 border-slate-50 border-dashed min-h-[700px]">
               <div className="h-32 w-32 rounded-[40px] bg-slate-50 flex items-center justify-center text-slate-200 relative">
                  <LayoutGrid className="h-14 w-14" />
                  <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 shadow-lg animate-bounce">
                    <Plus className="h-6 w-6" />
                  </div>
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Workspace Is Idle</h3>
                  <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Select a structural element from your curriculum to begin architecting its contents and properties.</p>
               </div>
               <div className="flex gap-4">
                  <div className="px-6 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Item</div>
                  <div className="px-6 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Edit Logic</div>
                  <div className="px-6 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Commit Changes</div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
