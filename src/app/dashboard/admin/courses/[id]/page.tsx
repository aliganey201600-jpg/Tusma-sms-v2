"use client"

import * as React from "react"
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronDown, 
  Zap, 
  Layout,
  Eye,
  BarChart3,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useParams, useRouter } from "next/navigation"
import { getCourseStructure } from "../builder-actions"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AdminCourseDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  React.useEffect(() => {
    async function loadCourse() {
      if (!id) return
      const data = await getCourseStructure(id as string)
      setCourse(data)
      if (data?.sections && data.sections.length > 0) {
        setExpandedSections([data.sections[0].id])
      }
      setIsLoading(false)
    }
    loadCourse()
  }, [id])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#F8FAFD]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Analyzing Curriculum Metrics...</p>
        </div>
      </div>
    )
  }

  const totalLessons = course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-40">
      {/* ── Standard Course Hero ── */}
      <section className="relative pt-12 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e512,transparent_50%)]" />
           <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-[1000px] mx-auto relative z-10">
           <Button
             variant="ghost"
             className="text-white/30 hover:text-white hover:bg-white/5 mb-10 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all group/back"
             onClick={() => router.push('/dashboard/admin/courses')}
           >
             <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" /> Return to Repository
           </Button>

           <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                   <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                      Course Details
                   </Badge>
                   <Badge className="bg-white/5 text-white/40 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      {course?.code || "ACAD-UNIT"}
                   </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase">
                  {course?.name}
                </h1>
                <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                   {course?.description || "Institutional curriculum management and performance oversight."}
                </p>

                <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Grade</p>
                      <p className="text-xl font-black text-white">Grade {course?.grade || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Credits</p>
                      <p className="text-xl font-black text-white">{course?.credits || "3.5"} Units</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Instructor</p>
                      <p className="text-xl font-black text-white">{course?.teacher || "Faculty"}</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 md:px-10 -mt-12 relative z-20">
         <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
               <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Curriculum Blueprint</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{totalLessons + totalQuizzes} Nodes Published</p>
               </div>
               <Link href={`/dashboard/admin/courses/${id}/builder`}>
                 <Button className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest gap-3 shadow-xl transition-all hover:scale-[1.02] border-b-4 border-slate-800 active:border-b-0">
                    <Layout className="h-5 w-5" /> Open Content Builder
                 </Button>
               </Link>
            </div>

            <div className="space-y-4">
             {course?.sections?.map((section: any, idx: number) => {
               const isExpanded = expandedSections.includes(section.id)
               const sectionItems = (section.lessons?.length || 0) + (section.quizzes?.length || 0)

               return (
                 <div key={section.id} className={cn("bg-white rounded-[2rem] border transition-all duration-500", isExpanded ? "border-indigo-100 shadow-[0_15px_40px_rgba(79,70,229,0.05)]" : "border-slate-100 hover:border-slate-200 shadow-sm")}>
                   <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-slate-50/40 transition-colors text-left relative overflow-hidden group">
                     {isExpanded && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />}

                     <div className="flex items-center gap-6">
                        <div className={cn("h-14 w-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all duration-500", isExpanded ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-400")}>
                           <span className="text-[8px] font-black uppercase opacity-60">Unit</span>
                           <span className="text-lg font-black leading-none">{idx + 1}</span>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{section.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400 px-2">{sectionItems} Components</Badge>
                            </div>
                        </div>
                     </div>
                     <ChevronDown className={cn("h-5 w-5 transition-transform duration-500 text-slate-300", isExpanded ? "rotate-180 text-indigo-600" : "")} />
                   </button>

                   <div className={cn("overflow-hidden transition-all duration-500", isExpanded ? "max-h-[3000px] opacity-100 border-t border-slate-50" : "max-h-0 opacity-0")}>
                     <div className="p-4 md:p-6 space-y-2 bg-slate-50/20">
                        {[...(section.lessons || []), ...(section.quizzes || []).map((q: any) => ({ ...q, isQuiz: true }))]
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((item) => {
                            const isQuiz = item.isQuiz || 'questions' in item
                            return (
                              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 group/item cursor-default">
                                 <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", isQuiz ? "bg-amber-50 text-amber-500" : "bg-indigo-50 text-indigo-500")}>
                                    {isQuiz ? <Zap className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{item.title}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isQuiz ? "Assessment" : "Lecture"}</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-slate-100 bg-slate-50 hover:bg-white" onClick={() => router.push(`/dashboard/admin/courses/${id}/builder/${isQuiz ? "quiz" : "lesson"}/${item.id}`)}>
                                       <Eye className="h-4 w-4 text-slate-400" />
                                    </Button>
                                    {isQuiz && (
                                      <Link href={`/dashboard/admin/courses/${id}/quiz/${item.id}/submissions`}>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50" title="Submissions">
                                           <BarChart3 className="h-4 w-4 text-indigo-500" />
                                        </Button>
                                      </Link>
                                    )}
                                 </div>
                              </div>
                            )
                          })}
                     </div>
                   </div>
                 </div>
               )
             })}
            </div>
         </div>
      </div>
    </div>
  )
}
