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
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  getCourseStructure, 
  addSection, 
  addLesson, 
  addQuiz, 
  deleteSection,
  updateLesson 
} from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CourseBuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [newSectionTitle, setNewSectionTitle] = React.useState("")
  const [isAddingSection, setIsAddingSection] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState<any>(null)
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([])

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
        toast.error(res.error || "Failed to add section. Check database connection.")
      }
    } catch (err) {
      toast.error("A network error occurred. Please try again.")
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

  if (loading) return (
     <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">{course?.name}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Curriculum Architect</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold px-6" onClick={() => router.back()}>
            Exit Builder
          </Button>
          <Button className="h-11 rounded-xl bg-slate-900 border-none px-6 font-bold shadow-xl shadow-slate-200">
            Preview Course
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8">
        {/* Left: Curriculum Hierarchy */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500">Course Structure</h2>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-black border-none">
              {course?.sections?.length || 0} Sections
            </Badge>
          </div>

          <div className="space-y-4">
            {course?.sections?.map((section: any, sIdx: number) => (
              <Card key={section.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">
                        {sIdx + 1}
                      </div>
                      <h3 className="font-black text-slate-900">{section.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteSection(section.id).then(loadCourse)}>
                         <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                         <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {section.lessons?.map((lesson: any) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => setActiveItem({ type: 'lesson', data: lesson })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent",
                          activeItem?.data?.id === lesson.id ? "bg-indigo-50 border-indigo-100 shadow-sm" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                            activeItem?.data?.id === lesson.id ? "bg-white text-indigo-600 shadow-sm" : "bg-white text-slate-300"
                          )}>
                             <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">Video Lesson • {lesson.duration || 0}m</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    ))}

                    {section.quizzes?.map((quiz: any) => (
                      <div 
                        key={quiz.id} 
                        onClick={() => setActiveItem({ type: 'quiz', data: quiz })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent",
                          activeItem?.data?.id === quiz.id ? "bg-amber-50 border-amber-100 shadow-sm" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                            activeItem?.data?.id === quiz.id ? "bg-white text-amber-600 shadow-sm" : "bg-white text-slate-300"
                          )}>
                             <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{quiz.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">Knowledge Check • {quiz.passingScore}% Pass</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    ))}

                    <div className="flex gap-2 p-2">
                       <Button 
                        variant="ghost" 
                        className="flex-1 h-10 rounded-xl border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
                        onClick={() => handleAddLesson(section.id)}
                       >
                         <Plus className="h-3 w-3 mr-2" />
                         Add Lesson
                       </Button>
                       <Button 
                        variant="ghost" 
                        className="flex-1 h-10 rounded-xl border-dashed border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100"
                        onClick={() => handleAddQuiz(section.id)}
                       >
                         <Plus className="h-3 w-3 mr-2" />
                         Add Quiz
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-4">
              <div className="flex gap-2">
                <Input 
                   placeholder="Enter new section title..." 
                   value={newSectionTitle}
                   onChange={(e) => setNewSectionTitle(e.target.value)}
                   className="h-12 rounded-2xl bg-white border-slate-200 focus:border-indigo-500 shadow-sm"
                />
                <Button 
                  onClick={handleAddSection}
                  disabled={isAddingSection || !newSectionTitle}
                  className="h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isAddingSection ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Item Editor */}
        <div className="col-span-12 lg:col-span-7">
          {activeItem ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
                  <header className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                          activeItem.type === 'lesson' ? "bg-indigo-600 text-white" : "bg-amber-500 text-white"
                        )}>
                           {activeItem.type === 'lesson' ? <Video className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900">{activeItem.data.title}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing {activeItem.type}</p>
                        </div>
                     </div>
                     <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                     </Button>
                  </header>

                  <CardContent className="p-10 space-y-8">
                     {activeItem.type === 'lesson' ? (
                       <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson Title</Label>
                                <Input defaultValue={activeItem.data.title} className="h-12 rounded-xl border-slate-200" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Video URL (Vimeo/YouTube)</Label>
                                <Input defaultValue={activeItem.data.videoUrl} placeholder="https://..." className="h-12 rounded-xl border-slate-200" />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson Narrative / Content</Label>
                             <textarea 
                              className="w-full min-h-[300px] p-6 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none text-slate-600 font-medium" 
                              placeholder="Describe the lesson or paste educational content here..."
                              defaultValue={activeItem.data.content}
                             />
                          </div>
                       </div>
                     ) : (
                       <div className="space-y-6">
                          <div className="bg-amber-50 rounded-[30px] p-8 border border-amber-100 mb-8">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                                   <Settings2 className="h-5 w-5" />
                                </div>
                                <h4 className="text-lg font-black text-amber-900">Quiz Intelligence Settings</h4>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black uppercase text-amber-700">Passing Score (%)</Label>
                                   <Input type="number" defaultValue={activeItem.data.passingScore} className="bg-white border-amber-200 h-12 rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black uppercase text-amber-700">Time Limit (Min)</Label>
                                   <Input type="number" defaultValue={activeItem.data.timeLimit} placeholder="Unlimited" className="bg-white border-amber-200 h-12 rounded-xl" />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="flex items-center justify-between">
                                <h4 className="text-lg font-black text-slate-900">Question Pool</h4>
                                <Button 
                                  size="sm" 
                                  className="bg-indigo-600 text-white rounded-xl h-9"
                                  onClick={() => setQuizQuestions([...quizQuestions, { id: Date.now().toString(), question: "New Question?", options: [{text: "Option A", isCorrect: true}, {text: "Option B", isCorrect: false}] }])}
                                >
                                   <Plus className="h-4 w-4 mr-2" /> Add Question
                                </Button>
                             </div>
                             
                             <div className="space-y-4">
                               {quizQuestions.map((q, qIdx) => (
                                 <div key={q.id} className="p-6 rounded-[30px] border border-slate-100 bg-slate-50/30 space-y-4">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-indigo-500 uppercase">Question {qIdx + 1}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => setQuizQuestions(quizQuestions.filter(item => item.id !== q.id))}>
                                         <Trash2 className="h-3 w-3" />
                                      </Button>
                                   </div>
                                   <Input defaultValue={q.question} className="h-12 rounded-xl bg-white" placeholder="Enter question text..." />
                                   <div className="grid grid-cols-2 gap-3">
                                      {q.options.map((opt: any, oIdx: number) => (
                                         <div key={oIdx} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100">
                                            <div className={cn("h-4 w-4 rounded-full border-2", opt.isCorrect ? "bg-emerald-500 border-emerald-500" : "border-slate-200")}></div>
                                            <span className="text-xs font-bold text-slate-600 flex-1">{opt.text}</span>
                                         </div>
                                      ))}
                                   </div>
                                 </div>
                               ))}
                               
                               {quizQuestions.length === 0 && (
                                 <p className="text-center py-12 text-slate-400 text-sm italic bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                   No questions added to this quiz yet. <br/> Start by adding your first challenge.
                                 </p>
                               )}
                             </div>
                          </div>
                       </div>
                     )}
                  </CardContent>
               </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white rounded-[40px] shadow-sm border border-slate-100 border-dashed min-h-[600px]">
               <div className="h-24 w-24 rounded-[30px] bg-slate-50 flex items-center justify-center text-slate-200">
                  <LayoutGrid className="h-12 w-12" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Workspace Empty</h3>
                  <p className="text-slate-400 max-w-xs mx-auto mt-2">Select a lesson or quiz from the curriculum hierarchy on the left to start architecting your content.</p>
               </div>
               <Button className="h-12 px-8 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold border-none" onClick={() => toast.info("Select an item first")}>
                 Get Started
               </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
