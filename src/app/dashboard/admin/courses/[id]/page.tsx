"use client"

import * as React from "react"
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  User,
  Star,
  Layers,
  Layout,
  Eye,
  Settings,
  MoreVertical,
  Users,
  BarChart3,
  Calendar,
  ShieldCheck,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import { getCourseStructure } from "../builder-actions"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────
type Section = any
type BaseLesson = any
type BaseQuiz = any

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
      if (data?.sections?.length > 0) {
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
      {/* ── Premium Governance Hero ── */}
      <section className="relative pt-12 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e512,transparent_50%)]" />
           <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#6366f108,transparent_50%)]" />
           <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
           <Button
             variant="ghost"
             className="text-white/30 hover:text-white hover:bg-white/5 mb-10 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all group/back"
             onClick={() => router.push('/dashboard/admin/courses')}
           >
             <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" /> Return to Repository
           </Button>

           <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
              <div className="space-y-8 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                   <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                      <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Central Governance
                   </Badge>
                   <Badge className="bg-white/5 text-white/40 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      ID: {course?.code || "ACAD-UNIT"}
                   </Badge>
                   <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      Live Curriculum
                   </Badge>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase max-w-4xl">
                    {course?.name}
                  </h1>
                  <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                     {course?.description || "Institutional curriculum management and performance oversight. Monitor engagement and structural integrity."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-10 pt-4 border-t border-white/5">
                   {[
                     { label: "Instructional Credits", value: `${course?.credits || "3.5"} Units`, icon: Star, color: "text-amber-400" },
                     { label: "Grade Requirement", value: `Grade ${course?.grade || "N/A"}`, icon: GraduationCap, color: "text-indigo-400" },
                     { label: "Global Enrollment", value: `${course?.enrollments?.length || 0} Students`, icon: Users, color: "text-emerald-400" },
                   ].map((s, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2">
                           <s.icon className={cn("h-4 w-4", s.color)} />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{s.label}</p>
                        </div>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-96">
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Chapters", value: course?.sections?.length || 0, icon: Layers, color: "text-indigo-400" },
                      { label: "Lessons", value: totalLessons, icon: BookOpen, color: "text-blue-400" },
                      { label: "Assessments", value: totalQuizzes, icon: Zap, color: "text-amber-400" },
                      { label: "Mastery Rate", value: "92%", icon: BarChart3, color: "text-rose-400" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[2rem] space-y-3 group hover:bg-white/10 transition-all duration-300">
                         <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10", s.color)}>
                            <s.icon className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-2xl font-black text-white">{s.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── Curriculum Management Segment ── */}
          <div className="lg:col-span-8 space-y-10">
             <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                   <div className="space-y-2">
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Curriculum Blueprint</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{totalLessons + totalQuizzes} Nodes Published in the Vault</p>
                   </div>
                   <Link href={`/dashboard/admin/courses/${id}/builder`}>
                     <Button className="h-16 px-8 rounded-2xl bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest gap-3 shadow-xl transition-all hover:scale-[1.02] border-b-4 border-slate-800 active:border-b-0">
                        <Layout className="h-5 w-5" /> Initialize Content Builder
                     </Button>
                   </Link>
                </div>

                <div className="space-y-5">
                 {course?.sections?.map((section: any, idx: number) => {
                   const isExpanded = expandedSections.includes(section.id)
                   const sectionItems = (section.lessons?.length || 0) + (section.quizzes?.length || 0)

                   return (
                     <div key={section.id} className={cn("bg-white rounded-[2.5rem] border transition-all duration-500", isExpanded ? "border-indigo-100 shadow-[0_20px_50px_rgba(79,70,229,0.08)]" : "border-slate-100 hover:border-slate-200 shadow-sm")}>
                       <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-8 mdx:p-10 hover:bg-slate-50/40 transition-colors text-left relative overflow-hidden group">
                         {isExpanded && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />}

                         <div className="flex items-center gap-8">
                            <div className={cn("h-16 w-16 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 border transition-all duration-500", isExpanded ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100")}>
                               <span className="text-[8px] font-black uppercase opacity-60">Unit</span>
                               <span className="text-xl font-black leading-none">{idx + 1}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{section.title}</h3>
                                <div className="flex items-center gap-3 mt-2.5">
                                   <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400 px-3">{sectionItems} Components</Badge>
                                   <span className="h-1 w-1 rounded-full bg-slate-200" />
                                   <p className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest">Structural Node Verified</p>
                                </div>
                            </div>
                         </div>
                         <div className={cn("h-10 w-10 rounded-2xl border border-slate-100 flex items-center justify-center transition-all duration-500", isExpanded ? "bg-indigo-50 text-indigo-600 rotate-180" : "bg-white text-slate-300 shadow-sm")}>
                            <ChevronDown className="h-5 w-5" />
                         </div>
                       </button>

                       <div className={cn("overflow-hidden transition-all duration-700 ease-in-out bg-slate-50/30", isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0")}>
                         <div className="p-6 md:p-10 space-y-3">
                            {[...(section.lessons || []), ...(section.quizzes || [])]
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((item, iIdx) => {
                                const isQuiz = 'questions' in item || !('duration' in item)
                                return (
                                  <div key={item.id} className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-[0_15px_40px_rgba(79,70,229,0.06)] transition-all group/item cursor-default">
                                     <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110", isQuiz ? "bg-amber-50 text-amber-500 shadow-inner" : "bg-indigo-50 text-indigo-500 shadow-inner")}>
                                        {isQuiz ? <Zap className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{isQuiz ? "Mastery Quiz" : "Core Lecture"}</p>
                                        <h4 className="text-base font-black text-slate-900 truncate uppercase tracking-tight group-hover/item:text-indigo-600 transition-colors">{item.title}</h4>
                                     </div>
                                     <div className="hidden sm:flex items-center gap-6 pr-4">
                                        <div className="space-y-1 text-right">
                                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Metric</p>
                                           <p className="text-[10px] font-black text-indigo-400 uppercase">{isQuiz ? `${item.questions?.length || 0} Questions` : `${item.duration || 0} Minute Read`}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                           <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 bg-slate-50 hover:bg-white transition-all shadow-sm">
                                              <Eye className="h-4 w-4 text-slate-400" />
                                           </Button>
                                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                                              <MoreVertical className="h-4 w-4 text-slate-300" />
                                           </Button>
                                        </div>
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

          {/* ── Governance Sidebar ── */}
          <div className="lg:col-span-4 space-y-10">
             {/* Academy Control */}
             <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white group">
               <CardHeader className="p-10 pb-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                        <Settings className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Academy Controls</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-10 pt-2 space-y-6">
                  <div className="space-y-3">
                    <Link href={`/dashboard/admin/courses/${id}/builder`} className="block">
                      <Button className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 gap-4 shadow-xl shadow-indigo-100 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1">
                        <PenLineIcon className="h-5 w-5" /> Modify Curriculum
                      </Button>
                    </Link>
                    <Link href={`/dashboard/admin/courses/${id}/preview`} className="block">
                      <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-100 gap-4 transition-all">
                        <Eye className="h-5 w-5 text-indigo-500" /> Inspection View
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-6 space-y-5 border-t border-slate-50">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Visibility</span>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg">Operational</Badge>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curriculum Type</span>
                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg">Accredited</Badge>
                     </div>
                  </div>
               </CardContent>
             </Card>

             {/* Student Engagement Matrix */}
             <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[3rem] overflow-hidden bg-slate-950 text-white relative group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                <CardContent className="p-10 space-y-10 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Scholastic Base</p>
                         <h4 className="text-6xl font-black tabular-nums">{course?.enrollments?.length || 0}</h4>
                      </div>
                      <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-2xl">
                         <Users className="h-8 w-8 text-indigo-400" />
                      </div>
                   </div>
                   
                   <div className="space-y-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="h-12 w-12 rounded-full border-4 border-slate-950 bg-slate-900 flex items-center justify-center overflow-hidden">
                                <User className="h-6 w-6 text-slate-600" />
                             </div>
                           ))}
                           <div className="h-12 w-12 rounded-full border-4 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black">
                              +{Math.max(0, (course?.enrollments?.length || 0) - 4)}
                           </div>
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Engagement Ratio</p>
                           <p className="text-sm font-black text-white">84.2% <span className="text-emerald-400 text-[9px] ml-2">+2.4%</span></p>
                        </div>
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '84%' }} />
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Governance Logs */}
             <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100/50 border border-slate-100 space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Governance Logs</h4>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                 </div>
                 <div className="space-y-6">
                    {[
                      { user: "Module System", action: "Content Node Optimized", time: "Now", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                      { user: "Faculty Lead", action: "Quiz 2 Re-validated", time: "4h", icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-50" },
                      { user: "Enrollment Bot", action: "12 New Members", time: "1d", icon: Users, color: "text-blue-500", bg: "bg-blue-50" }
                    ].map((act, i) => (
                      <div key={i} className="flex items-start gap-4 group/item cursor-default">
                         <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110 shrink-0", act.bg, act.color)}>
                            <act.icon className="h-4 w-4" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{act.user}</p>
                            <p className="text-[10px] font-bold text-slate-400 leading-tight">{act.action}</p>
                         </div>
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 shrink-0">{act.time}</span>
                      </div>
                    ))}
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-dashed border-slate-200">
                    Access Audit Repository
                 </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PenLineIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
