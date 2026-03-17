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
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  const totalLessons = course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Premium Admin Hero ── */}
      <div className="relative pt-12 pb-20 px-6 md:px-10 overflow-hidden">
        {/* Background Layer: Deep modern gradient with mesh-like texture */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,#4f46e515,transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_100%,#6366f108,transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Button
            variant="ghost"
            className="text-white/30 hover:text-white hover:bg-white/5 mb-8 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all group/back"
            onClick={() => router.push('/dashboard/admin/courses')}
          >
            <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" /> Back to Curriculum
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Course Admin Info */}
            <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-indigo-500 text-white border-none px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl shadow-indigo-500/10">
                  <ShieldCheck className="h-3 w-3" /> Managed Course
                </Badge>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <Badge className="bg-white/5 text-white/40 border border-white/10 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                  {course?.code || "ACAD-2024"}
                </Badge>
                <Badge className="bg-white/5 text-white/40 border border-white/10 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                  Grade {course?.grade || "N/A"}
                </Badge>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {course?.name}
                </h1>
                <p className="text-base text-slate-400 max-w-2xl leading-relaxed font-medium">
                  {course?.description || "This course curriculum is currently being managed. Review performance metrics and content structure below."}
                </p>
              </div>

              <div className="flex flex-wrap gap-8 pt-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Total Value</p>
                    <p className="text-xl font-black text-white">{course?.credits || "3.0"} <span className="text-slate-500 text-xs font-bold tracking-normal">Units</span></p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Enrollments</p>
                    <p className="text-xl font-black text-white">{course?.enrollments?.length || 0} <span className="text-slate-500 text-xs font-bold tracking-normal">Students</span></p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Avg. XP</p>
                    <p className="text-xl font-black text-white">1,240 <span className="text-slate-500 text-xs font-bold tracking-normal">Points</span></p>
                 </div>
              </div>
            </div>

            {/* Right Column: Quick Stats Matrix */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-6 duration-700">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{course?.sections?.length || 0}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Chapters</p>
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{totalLessons}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Lessons</p>
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{totalQuizzes}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Assessments</p>
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">88%</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Pass Rate</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-20 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Curriculum & Structure */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] border border-slate-100">
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Structure</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{totalLessons + totalQuizzes} total items organized by chapter</p>
                  </div>
                  <Link href={`/dashboard/admin/courses/${id}/builder`}>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group/btn">
                       <Layout className="h-4 w-4 text-indigo-500 group-hover/btn:scale-110 transition-transform" /> 
                       Content Builder
                    </Button>
                  </Link>
               </div>

               <div className="space-y-4">
                {course?.sections?.map((section: any, idx: number) => {
                  const isExpanded = expandedSections.includes(section.id)
                  const sectionItemCount = (section.lessons?.length || 0) + (section.quizzes?.length || 0)

                  return (
                    <div key={section.id} className={cn("group bg-white rounded-3xl border transition-all duration-300", isExpanded ? "border-indigo-100 shadow-xl shadow-indigo-50/50" : "border-slate-100 hover:border-slate-200")}>
                      <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-6 text-left relative overflow-hidden rounded-3xl">
                        <div className="flex items-center gap-6">
                            <div className={cn("h-12 w-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all duration-300", isExpanded ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-400")}>
                               <span className="text-[6px] font-black uppercase opacity-60">CH</span>
                               <span className="text-base font-black leading-none">{idx + 1}</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">{section.title}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sectionItemCount} items published</p>
                            </div>
                        </div>
                        <div className={cn("h-8 w-8 rounded-xl border border-slate-100 flex items-center justify-center transition-all duration-300", isExpanded ? "bg-indigo-50 text-indigo-600 rotate-180" : "bg-white text-slate-300")}>
                           <ChevronDown className="h-4 w-4" />
                        </div>
                      </button>

                      <div className={cn("overflow-hidden transition-all duration-500 ease-in-out", isExpanded ? "max-h-[2000px] opacity-100 px-6 pb-6" : "max-h-0 opacity-0")}>
                        <div className="space-y-2 pt-2">
                           {[...(section.lessons || []), ...(section.quizzes || [])]
                             .sort((a, b) => (a.order || 0) - (b.order || 0))
                             .map((item, iIdx) => {
                               const isQuiz = 'questions' in item || !('duration' in item) // Rough check or could use proper type
                               return (
                                 <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group/item cursor-default">
                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110", isQuiz ? "bg-amber-50 text-amber-600 shadow-sm" : "bg-indigo-50 text-indigo-600 shadow-sm")}>
                                       {isQuiz ? <Zap className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-black text-slate-800 truncate group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{isQuiz ? "Graded Assessment" : "Learning Content"}</p>
                                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                                          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400/60">{isQuiz ? `${item.questions?.length || 0} Q's` : `${item.duration || 0} min`}</p>
                                       </div>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-all flex items-center gap-2">
                                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                                          <Eye className="h-4 w-4" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                          <MoreVertical className="h-4 w-4" />
                                       </Button>
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

          {/* Sidebar: Control Center & Faculty */}
          <div className="lg:col-span-4 space-y-8">
            {/* Control Center */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                       <Settings className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Control Center</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                 <div className="grid grid-cols-1 gap-3">
                    <Link href={`/dashboard/admin/courses/${id}/builder`}>
                      <Button className="w-full h-14 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 gap-3 shadow-xl shadow-slate-200 border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all">
                        <PenLineIcon className="h-4 w-4" /> Edit Curriculum
                      </Button>
                    </Link>
                    <Link href={`/dashboard/admin/courses/${id}/preview`}>
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 gap-3 transition-all">
                        <Eye className="h-4 w-4" /> Preview Mode
                      </Button>
                    </Link>
                 </div>
                 <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</span>
                       <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black tracking-widest">Live</Badge>
                    </div>
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</span>
                       <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[9px] font-black tracking-widest">Graded</Badge>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Students Performance */}
            <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[3rem] overflow-hidden bg-indigo-600 text-white relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
               <CardContent className="p-10 space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Active Students</p>
                        <h4 className="text-5xl font-black">{course?.enrollments?.length || 0}</h4>
                     </div>
                     <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl">
                        <Users className="h-7 w-7 text-white" />
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/10">
                     <div className="flex -space-x-3 mb-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-10 w-10 rounded-full border-4 border-indigo-600 bg-indigo-500 flex items-center justify-center overflow-hidden">
                             <User className="h-5 w-5 text-white/50" />
                          </div>
                        ))}
                        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black">
                           +{Math.max(0, (course?.enrollments?.length || 0) - 4)}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Course Engagement</span>
                        <span className="text-white">78%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '78%' }} />
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Recent Global Activity */}
            <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[3rem] bg-white border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Activity</h4>
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-5">
                   {[
                     { user: "Ali Ahmed", action: "Completed Quiz 1", time: "2 min ago", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                     { user: "Hassan J.", action: "Joined Course", time: "1 hour ago", icon: User, color: "text-indigo-500", bg: "bg-indigo-50" },
                     { user: "Sara M.", action: "Unlocked Module 2", time: "3 hours ago", icon: Star, color: "text-emerald-500", bg: "bg-emerald-50" }
                   ].map((act, i) => (
                     <div key={i} className="flex items-center gap-4 group/item cursor-default">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110", act.bg, act.color)}>
                           <act.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-slate-800 leading-tight truncate">{act.user}</p>
                           <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{act.action}</p>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{act.time}</span>
                     </div>
                   ))}
                </div>
                <Button variant="ghost" className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                   View Full Logs
                </Button>
            </Card>

            {/* Curriculum Info Details */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Last Updated</p>
                    <p className="text-sm font-black text-slate-900 leading-none">March 17, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Certification</p>
                    <p className="text-sm font-black text-slate-950 leading-none">Automated Issuance</p>
                  </div>
                </div>
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
