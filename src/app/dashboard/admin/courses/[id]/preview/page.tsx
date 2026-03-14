"use client"

import * as React from "react"
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronDown,
  ChevronRight,
  PlayCircle, 
  Clock, 
  FileText, 
  Lock,
  CheckCircle2,
  Video,
  Zap,
  ArrowRight,
  X,
  FileDown,
  Menu,
  BookOpenCheck,
  Link2,
  HelpCircle,
  GraduationCap,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  getCourseStructure 
} from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CoursePreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeLesson, setActiveLesson] = React.useState<any>(null)
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])
  const [activeLessonTab, setActiveLessonTab] = React.useState<string>("body")

  React.useEffect(() => {
    async function load() {
      const data = await getCourseStructure(id as string)
      if (data) setCourse(data)
      setLoading(false)
    }
    load()
  }, [id])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Course...</p>
      </div>
    </div>
  )

  const totalLessons = course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0
  const totalDuration = course?.sections?.reduce((acc: number, s: any) => 
    acc + (s.lessons?.reduce((a: number, l: any) => a + (l.duration || 0), 0) || 0), 0) || 0

  /* ═══════════════════════════════════════════════
     FULL-SCREEN LESSON VIEW
     ═══════════════════════════════════════════════ */
  if (activeLesson) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex flex-col" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setActiveLesson(null); setActiveLessonTab("body"); }} className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{activeLesson.title}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{course?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setActiveLesson(null); setActiveLessonTab("body"); }} className="text-slate-500 gap-1.5 text-xs font-semibold hover:bg-slate-50 rounded-xl h-9 px-4">
            <X className="h-3.5 w-3.5" /> Close
          </Button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            
            {/* Lesson Objectives — always visible on top */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-indigo-200" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Lesson Objectives</h3>
                </div>
                <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                  {activeLesson.objectives || "No objectives have been defined for this lesson yet."}
                </p>
              </div>
            </div>

            {/* Horizontal Menu Bar — 3 lines icon style */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center border-b border-slate-100">
                {[
                  { key: "body", label: "Lesson Body", icon: BookOpen },
                  { key: "materials", label: "Materials", icon: FileText },
                  { key: "video", label: "Video", icon: Video },
                  { key: "quiz", label: "Quiz", icon: HelpCircle },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveLessonTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative",
                      activeLessonTab === tab.key 
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50/40" 
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Lesson Body */}
                {activeLessonTab === "body" && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900">{activeLesson.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{activeLesson.duration || 0} min</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="prose prose-slate max-w-none text-slate-600 leading-[1.9] whitespace-pre-wrap text-[15px]">
                      {activeLesson.content || "No lesson content has been provided yet. The instructor will publish content for this lesson soon."}
                    </div>
                  </div>
                )}

                {/* Materials */}
                {activeLessonTab === "materials" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Reading Materials & Resources</h3>
                    <p className="text-sm text-slate-400">Documents, books, and reference links for this lesson.</p>
                    <Separator />
                    {activeLesson.attachmentUrl ? (
                      <a href={activeLesson.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-amber-50 hover:bg-amber-100/70 rounded-2xl border border-amber-100 transition-all group">
                        <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                          <FileDown className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">Lesson PDF Document</p>
                          <p className="text-xs text-slate-400 truncate">{activeLesson.attachmentUrl}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="text-sm font-semibold text-slate-400">No materials attached</p>
                        <p className="text-xs text-slate-300 mt-1">The instructor has not uploaded any files for this lesson.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Video */}
                {activeLessonTab === "video" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Video Lesson</h3>
                    {activeLesson.videoUrl ? (
                      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video shadow-xl">
                        <iframe
                          src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("vimeo.com/", "player.vimeo.com/video/")}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl text-slate-300 border border-dashed border-slate-200">
                        <Video className="h-12 w-12 mb-4" />
                        <p className="text-sm font-semibold text-slate-400">No video available</p>
                        <p className="text-xs text-slate-300 mt-1">The instructor has not added a video for this lesson.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz */}
                {activeLessonTab === "quiz" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Assessment Quiz</h3>
                    <p className="text-sm text-slate-400">Complete the quiz linked to this lesson to test your understanding.</p>
                    <Separator />
                    {activeLesson.quizzes && activeLesson.quizzes.length > 0 ? (
                      <div className="space-y-3">
                        {activeLesson.quizzes.map((quiz: any) => (
                          <div key={quiz.id} className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                              <Zap className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">{quiz.title}</p>
                              <p className="text-xs text-slate-400">Passing Score: {quiz.passingScore}%</p>
                            </div>
                            <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold uppercase tracking-wider">Start</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <HelpCircle className="h-12 w-12 mb-4" />
                        <p className="text-sm font-semibold text-slate-400">No quiz linked</p>
                        <p className="text-xs text-slate-300 mt-1">No assessment has been attached to this lesson.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Mini sidebar for lesson navigation — only on large screens */}
        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════
     MAIN COURSE OVERVIEW PAGE
     ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-14 pb-24 px-6 md:px-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            className="text-white/40 hover:text-white hover:bg-white/5 mb-8 gap-2 p-0 h-auto text-xs font-bold"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Back to Builder
          </Button>

          <div className="space-y-5">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              {course?.category || 'General'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              {course?.name}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              {course?.description || "A comprehensive course designed to build mastery in the subject through structured lessons and assessments."}
            </p>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">{course?.sections?.length || 0} Chapters</p>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Sections</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">{totalLessons} Lessons</p>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Total Units</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">{totalQuizzes} Quizzes</p>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Assessments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">{totalDuration} min</p>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Duration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 -mt-10 pb-24">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content — Table of Contents */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpenCheck className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Table of Contents</h2>
            </div>

            <div className="space-y-3">
              {course?.sections?.map((section: any, idx: number) => {
                const isExpanded = expandedSections.includes(section.id)
                return (
                  <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all">
                    {/* Chapter Header — clickable */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">{section.title}</h3>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {section.lessons?.length || 0} lessons • {section.quizzes?.length || 0} quizzes
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-slate-300 transition-transform duration-300 shrink-0",
                        isExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Lessons List — collapsible */}
                    <div className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden",
                      isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="border-t border-slate-50 px-5 pb-4 pt-2">
                        {section.lessons?.map((lesson: any, lIdx: number) => (
                          <div
                            key={lesson.id}
                            onClick={() => { setActiveLesson(lesson); setActiveLessonTab("body"); }}
                            className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all text-xs font-bold shrink-0">
                              {lIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{lesson.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{lesson.duration || 0} min</p>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {lesson.videoUrl && <Video className="h-3.5 w-3.5 text-indigo-400" />}
                              {lesson.attachmentUrl && <FileText className="h-3.5 w-3.5 text-amber-400" />}
                              <ChevronRight className="h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        ))}
                        {section.quizzes?.map((quiz: any) => (
                          <Link
                            key={quiz.id}
                            href={`/dashboard/admin/courses/${id}/quiz/${quiz.id}`}
                            className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-amber-50/60 border-2 border-transparent hover:border-amber-100 cursor-pointer transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-500 shrink-0 transition-all">
                              <Zap className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-amber-700 truncate transition-colors">{quiz.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Quiz • {quiz.passingScore}% to pass</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none text-[9px] font-bold uppercase tracking-wider">Assessment</Badge>
                              <ChevronRight className="h-4 w-4 text-amber-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Course Progress</h3>
                  <Progress value={0} className="h-3 rounded-full bg-slate-100" />
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <span>0% Complete</span>
                    <span>0/{totalLessons + totalQuizzes}</span>
                  </div>
                </div>
                <Separator />
                <Button 
                  onClick={() => {
                    // Open first lesson of first section
                    const firstLesson = course?.sections?.[0]?.lessons?.[0]
                    if (firstLesson) {
                      setActiveLesson(firstLesson)
                      setActiveLessonTab("body")
                    }
                  }}
                  className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 gap-2"
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-100">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Includes</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-4 w-4 text-indigo-500" />
                    <span className="text-slate-600 font-medium">{totalLessons} video lessons</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-slate-600 font-medium">{totalQuizzes} assessments</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span className="text-slate-600 font-medium">{totalDuration} min total</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-slate-600 font-medium">Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                    <span className="text-slate-600 font-medium">Certificate of completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
