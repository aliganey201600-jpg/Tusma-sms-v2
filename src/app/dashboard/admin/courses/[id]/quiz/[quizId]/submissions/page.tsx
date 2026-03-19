"use client"

import * as React from "react"
import { 
  ChevronLeft, BarChart3, Users, Clock, CheckCircle2, 
  Search, Sparkles, Filter, MoreHorizontal, User, 
  ArrowRight, ShieldCheck, AlertCircle, RefreshCw,
  Trophy, MinusCircle, FileText, Calendar, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { getQuizSubmissions, aiGradeSubmissionBatch } from "../grading-actions"

// Re-defining components locally to ensure consistency without dependency issues
const CustomButton = ({ children, className, onClick, variant = "primary", disabled, ...props }: any) => {
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1",
    outline: "bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200",
    ghost: "text-slate-500 hover:bg-slate-100",
    ai: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient text-white border-none shadow-lg shadow-indigo-200"
  }
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn("h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export default function QuizSubmissionsPage() {
  const { id: courseId, quizId } = useParams()
  const router = useRouter()
  const [submissions, setSubmissions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isGrading, setIsGrading] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "passed" | "failed" | "pending">("all")
  const [selectedAttempt, setSelectedAttempt] = React.useState<any>(null)

  const loadSubmissions = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getQuizSubmissions(quizId as string)
    setSubmissions(data)
    setIsLoading(false)
  }, [quizId])

  React.useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const handleAiGrade = async (attemptId: string) => {
    setIsGrading(attemptId)
    toast.promise(aiGradeSubmissionBatch(attemptId), {
      loading: 'AI is analyzing student answers...',
      success: (res: any) => {
        setIsGrading(null)
        loadSubmissions()
        return `Successfully AI Graded! New Score: ${res.newScore?.toFixed(1)}%`
      },
      error: (err) => {
        setIsGrading(null)
        return `Grading failed: ${err.message}`
      }
    })
  }

  const filteredSubmissions = submissions.filter(s => {
    const nameMatch = `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === "passed") return nameMatch && s.passed
    if (filter === "failed") return nameMatch && !s.passed
    if (filter === "pending") return nameMatch && s.results.some((r: any) => r.manual)
    return nameMatch
  })

  // Metrics
  const avgScore = submissions.length ? (submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length).toFixed(1) : 0
  const passRate = submissions.length ? ((submissions.filter(s => s.passed).length / submissions.length) * 100).toFixed(0) : 0
  const pendingGrading = submissions.filter(s => s.results.some((r: any) => r.manual)).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
           <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Scholastic Inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      {/* ── Governance Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <Button 
            className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 gap-2 transition-colors flex items-center"
            onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}
          >
            <ChevronLeft className="h-4 w-4" /> Return to Course Blueprint
          </Button>
          <div className="space-y-1">
             <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Assessment Submissions</h1>
             <p className="text-sm font-medium text-slate-500">Monitor student performance and trigger AI-assisted evaluation node.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <CustomButton variant="outline" onClick={loadSubmissions}>
             <RefreshCw className="h-4 w-4" /> Sync Records
          </CustomButton>
          <CustomButton variant="primary">
             <Download className="h-4 w-4" /> Export Report
          </CustomButton>
        </div>
      </div>

      {/* ── Performance Matrix Snapshot ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Attempts", value: submissions.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
           { label: "Average Score", value: `${avgScore}%`, icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-50" },
           { label: "Passing Rate", value: `${passRate}%`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
           { label: "Pending Review", value: pendingGrading, icon: AlertCircle, color: pendingGrading > 0 ? "text-amber-500" : "text-slate-300", bg: pendingGrading > 0 ? "bg-amber-50" : "bg-slate-50" },
         ].map((m, i) => (
           <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden group">
              <CardContent className="p-8 flex items-center gap-6">
                 <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner", m.bg, m.color)}>
                    <m.icon className="h-7 w-7" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{m.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* ── Repository Management Interface ── */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="p-10 md:p-12 border-b border-slate-50">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="relative w-full lg:w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="Search by student name or ID..." 
                   className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50/50 text-sm font-medium focus:bg-white transition-all"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
                 <Badge 
                    onClick={() => setFilter("all")}
                    className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap", 
                    filter === "all" ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}
                 >All Submissions</Badge>
                 <Badge 
                    onClick={() => setFilter("pending")}
                    className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap", 
                    filter === "pending" ? "bg-amber-500 text-white shadow-lg shadow-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}
                 >Manual Pending</Badge>
                 <Badge 
                    onClick={() => setFilter("passed")}
                    className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap", 
                    filter === "passed" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}
                 >Passed Units</Badge>
              </div>
           </div>
        </CardHeader>

        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                    <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Mastery Score</th>
                    <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Status</th>
                    <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Completion Metrics</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operational Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredSubmissions.map((s) => {
                   const hasManual = s.results.some((r: any) => r.manual)
                   const aiGraded = s.results.some((r: any) => r.aiGraded)
                   
                   return (
                     <tr key={s.id} className="group hover:bg-slate-50/40 transition-colors">
                       <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                {s.student.firstName[0]}{s.student.lastName[0]}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">{s.student.firstName} {s.student.lastName}</p>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{s.student.studentId || "EXT-NODE-001"}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-7 text-center">
                          <div className="space-y-2 inline-block">
                             <span className={cn("text-lg font-black leading-none", s.passed ? "text-emerald-600" : "text-rose-500")}>
                                {s.score.toFixed(1)}%
                             </span>
                             <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden mx-auto">
                                <div className={cn("h-full rounded-full", s.passed ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${s.score}%` }} />
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-7">
                          <div className="flex flex-col gap-1.5">
                            {hasManual ? (
                               <Badge className="bg-amber-50 text-amber-600 border-amber-100 border text-[8px] font-black uppercase tracking-widest w-fit rounded-lg px-2.5 py-1">
                                  <Clock className="h-2.5 w-2.5 mr-1.5" /> Pending Manual
                               </Badge>
                            ) : aiGraded ? (
                               <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 border text-[8px] font-black uppercase tracking-widest w-fit rounded-lg px-2.5 py-1">
                                  <Sparkles className="h-2.5 w-2.5 mr-1.5" /> AI Augmented
                               </Badge>
                            ) : (
                               <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 border text-[8px] font-black uppercase tracking-widest w-fit rounded-lg px-2.5 py-1">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-1.5" /> Fully Validated
                               </Badge>
                            )}
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{s.earnedPoints}/{s.totalPoints} Global Points</p>
                          </div>
                       </td>
                       <td className="px-5 py-7">
                          <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest">
                             <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(s.createdAt).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-2 text-slate-300">
                                <Clock className="h-3 w-3 text-slate-300" />
                                {Math.floor(s.timeSpent / 60)}m {s.timeSpent % 60}s
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {hasManual && (
                               <CustomButton 
                                 variant="ai"
                                 disabled={isGrading === s.id}
                                 onClick={() => handleAiGrade(s.id)}
                                 className="h-10 px-4"
                               >
                                 <Sparkles className={cn("h-4 w-4", isGrading === s.id && "animate-spin")} />
                                 {isGrading === s.id ? "Analyzing..." : "AI GRADE"}
                               </CustomButton>
                             )}
                             <CustomButton 
                               variant="outline" 
                               className="h-10 w-10 p-0"
                               onClick={() => setSelectedAttempt(s)}
                             >
                                <Eye className="h-4 w-4" />
                             </CustomButton>
                          </div>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
             {filteredSubmissions.length === 0 && (
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                      <FileText className="h-12 w-12" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-base font-black text-slate-900 uppercase tracking-tight">Zero Scholastic Data Found</p>
                      <p className="text-xs font-medium text-slate-400">No student attempts match your current repository filters.</p>
                   </div>
                </div>
             )}
           </div>
        </CardContent>
      </Card>

      {/* ── Submission Review Terminal ── */}
      <ReviewModal 
        attempt={selectedAttempt} 
        isOpen={!!selectedAttempt} 
        onClose={() => {
           setSelectedAttempt(null)
           loadSubmissions()
        }}
        onGradeAI={handleAiGrade}
        isGrading={isGrading === selectedAttempt?.id}
      />
    </div>
  )
}

// ─── Review Modal Fragment ──────────────────────────────────────────────────
function ReviewModal({ attempt, isOpen, onClose, onGradeAI, isGrading }: any) {
  if (!attempt) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 border-none rounded-[3rem] overflow-hidden bg-[#F8FAFD]">
        <div className="bg-slate-950 p-8 pb-12 relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-3">
                 <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Scholastic Review Terminal
                 </Badge>
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{attempt.student.firstName} {attempt.student.lastName}</h2>
                    <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.2em]">ID: {attempt.student.studentId || "EXT-NODE-001"} • Submitted {new Date(attempt.createdAt).toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-white/30 mb-1">Final Score</p>
                       <p className={cn("text-2xl font-black tabular-nums", attempt.passed ? "text-emerald-400" : "text-rose-400")}>{attempt.score.toFixed(1)}%</p>
                    </div>
                    <div className="h-10 w-px bg-white/10 mx-2" />
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-white/30 mb-1">Global Points</p>
                       <p className="text-2xl font-black text-white tabular-nums">{attempt.earnedPoints.toFixed(1)}/{attempt.totalPoints}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar mt-[-30px]">
           <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Diagnostic Item Inventory</h3>
                 <CustomButton variant="ai" onClick={() => onGradeAI(attempt.id)} disabled={isGrading}>
                    <Sparkles className={cn("h-4 w-4", isGrading && "animate-spin")} /> {isGrading ? "Synthesizing AI Grade..." : "Run AI Batch Grade"}
                 </CustomButton>
              </div>

              <div className="space-y-8 divide-y divide-slate-50">
                {attempt.results.map((res: any, idx: number) => {
                  const isSubjective = res.manual || res.aiGraded
                  return (
                    <div key={idx} className={cn("pt-8 first:pt-0 space-y-6 group/q", isSubjective && "pb-8 border-b border-slate-50")}>
                       <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-5">
                             <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-inner", res.isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
                                {idx + 1}
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm font-black text-slate-900 leading-snug">{res.question}</p>
                                <div className="flex items-center gap-3">
                                   <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 h-5 border-slate-100">{res.total} Points</Badge>
                                   <span className="h-1 w-1 rounded-full bg-slate-200" />
                                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{res.isCorrect ? "Validated" : res.earned > 0 ? "Partially Accurate" : "Failed Verification"}</p>
                                </div>
                             </div>
                          </div>
                          <Badge className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest", res.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                             {res.earned.toFixed(1)} / {res.total} Earned
                          </Badge>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-14">
                          <div className="space-y-2">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Response</p>
                             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed min-h-[60px]">
                                {res.studentAnswer || "Zero input recorded."}
                             </div>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correct Benchmark</p>
                             <div className="p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 text-sm font-medium text-emerald-800 leading-relaxed min-h-[60px]">
                                {res.correctAnswer || "System Managed Evaluation."}
                             </div>
                          </div>
                       </div>

                       {res.feedback && (
                         <div className="ml-14 mt-4 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex gap-4 items-start shadow-sm border-l-8 border-l-indigo-500">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                               <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Pedagogical Feedback</p>
                               <p className="text-sm font-medium text-indigo-900 leading-relaxed Somali">{res.feedback}</p>
                            </div>
                         </div>
                       )}
                    </div>
                  )
                })}
              </div>
           </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-50 flex justify-between items-center shrink-0">
           <CustomButton variant="outline" onClick={onClose} className="px-10">
              Diagnostic Exit
           </CustomButton>
           <div className="flex gap-4">
              <CustomButton variant="ai" className="px-10 h-14" onClick={onClose}>
                 Finalize Scholastic Review <ArrowRight className="h-4 w-4 ml-2" />
              </CustomButton>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Download(props: any) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
