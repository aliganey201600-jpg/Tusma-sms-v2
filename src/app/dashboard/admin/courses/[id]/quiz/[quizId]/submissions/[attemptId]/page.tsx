"use client"

import * as React from "react"
import { 
  ChevronLeft, BarChart3, Users, Clock, CheckCircle2, 
  Sparkles, ShieldCheck, ArrowRight,
  Zap, BookOpen, Calendar, GraduationCap, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getSingleSubmission, aiGradeSubmissionBatch } from "../../grading-actions"

// Re-defining components locally to ensure consistency
const CustomButton = ({ children, className, onClick, variant = "primary", disabled, ...props }: any) => {
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1",
    outline: "bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200",
    ai: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient text-white border-none shadow-lg shadow-indigo-200"
  }
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn("h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export default function StudentAttemptReviewPage() {
  const { id: courseId, quizId, attemptId } = useParams()
  const router = useRouter()
  const [attempt, setAttempt] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isGrading, setIsGrading] = React.useState(false)

  const loadAttempt = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getSingleSubmission(attemptId as string)
    setAttempt(data)
    setIsLoading(false)
  }, [attemptId])

  React.useEffect(() => {
    loadAttempt()
  }, [loadAttempt])

  const handleAiGrade = async () => {
    setIsGrading(true)
    toast.promise(aiGradeSubmissionBatch(attemptId as string), {
      loading: 'AI is analyzing student answers...',
      success: (res: any) => {
        setIsGrading(false)
        loadAttempt()
        return `Successfully AI Graded! New Score: ${res.newScore?.toFixed(1)}%`
      },
      error: (err) => {
        setIsGrading(false)
        return `Grading failed: ${err.message}`
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#F8FAFD]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opening Scholastic Terminal...</p>
        </div>
      </div>
    )
  }

  if (!attempt) return <div className="p-20 text-center font-black text-slate-400 uppercase">Submission Record Not Found</div>

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-40">
      {/* ── Governance Header ── */}
      <section className="relative pt-12 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e512,transparent_50%)]" />
           <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#6366f108,transparent_50%)]" />
           <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
           <Button
             variant="ghost"
             className="text-white/30 hover:text-white hover:bg-white/5 mb-10 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all group/back"
             onClick={() => router.back()}
           >
             <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" /> Exit Review Terminal
           </Button>

           <div className="flex flex-col lg:flex-row justify-between items-start md:items-end gap-10">
              <div className="space-y-6">
                 <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                    <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Scholastic Review Node
                 </Badge>
                 <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                      {attempt.student.firstName} {attempt.student.lastName}
                    </h1>
                    <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                       ID: {attempt.student.studentId || "EXT-NODE"} 
                       <span className="h-1 w-1 rounded-full bg-white/10" />
                       Submitted: {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                 </div>
              </div>

              <div className="flex bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] gap-8">
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-white/30 mb-1">Pass/Fail Status</p>
                    <Badge className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest", attempt.passed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30")}>
                       {attempt.passed ? "Validated Success" : "Failed Threshold"}
                    </Badge>
                 </div>
                 <div className="w-px bg-white/10" />
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-white/30 mb-1">Final Score</p>
                    <p className={cn("text-3xl font-black tabular-nums", attempt.passed ? "text-emerald-400" : "text-rose-400")}>{attempt.score.toFixed(1)}%</p>
                 </div>
                 <div className="w-px bg-white/10" />
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-white/30 mb-1">Awarded Points</p>
                    <p className="text-3xl font-black text-white tabular-nums">{attempt.earnedPoints.toFixed(1)}<span className="text-white/20 text-lg ml-1">/{attempt.totalPoints}</span></p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Question Repository ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 -mt-12 relative z-20 space-y-10">
         <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
               <div className="space-y-2">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Diagnostic Response Inventory</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed analysis of student performance nodes</p>
               </div>
               <div className="flex gap-4">
                  <CustomButton variant="ai" onClick={handleAiGrade} disabled={isGrading} className="h-14 px-8">
                     <Sparkles className={cn("h-5 w-5", isGrading && "animate-spin")} /> {isGrading ? "AI Synchronizing..." : "Trigger AI Batch Evaluation"}
                  </CustomButton>
               </div>
            </div>

            <div className="space-y-12">
              {attempt.results.map((res: any, idx: number) => {
                const isSubjective = res.manual || res.aiGraded
                return (
                  <div key={idx} className={cn("relative p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500", res.isCorrect ? "bg-white border-slate-50 hover:border-emerald-100" : "bg-rose-50/20 border-rose-50 hover:border-rose-100")}>
                     {/* Question Number Ribbon */}
                     <div className={cn("absolute -left-4 top-10 h-10 w-16 rounded-r-2xl flex items-center justify-center text-white font-black shadow-lg", res.isCorrect ? "bg-emerald-500" : "bg-rose-500")}>
                        {idx + 1}
                     </div>

                     <div className="pl-16 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                           <div className="space-y-4 flex-1">
                              <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{res.question}</h3>
                              <div className="flex flex-wrap items-center gap-4">
                                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400 px-3 h-6">Max: {res.total} Points</Badge>
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    <Zap className="h-3 w-3" /> {res.isCorrect ? "Validated Accurate" : "Failed Benchmark"}
                                 </div>
                              </div>
                           </div>
                           <div className={cn("px-6 py-3 rounded-2xl flex flex-col items-end shrink-0", res.isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-100/50 text-rose-600")}>
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Earned Score</span>
                               <span className="text-2xl font-black tabular-nums">{res.earned.toFixed(1)} <span className="text-sm opacity-40">/ {res.total}</span></span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                           <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Users className="h-3 w-3" /> Student Submission
                              </div>
                              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed shadow-inner min-h-[100px]">
                                 {res.studentAnswer || <span className="italic opacity-40">Zero input recorded by system.</span>}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                 <ShieldCheck className="h-3 w-3" /> Reference Benchmark
                              </div>
                              <div className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100/50 text-sm font-medium text-emerald-800 leading-relaxed min-h-[100px] shadow-sm italic">
                                 {res.correctAnswer || "System-managed internal evaluation logic."}
                              </div>
                           </div>
                        </div>

                        {res.feedback && (
                           <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xl shadow-indigo-100 relative z-10">
                                 <Sparkles className="h-7 w-7" />
                              </div>
                              <div className="space-y-2 relative z-10">
                                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Structural Feedback</p>
                                 <p className="text-base font-medium text-indigo-900 leading-relaxed Somali">{res.feedback}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                )
              })}
            </div>
         </div>

         {/* Finalize Action */}
         <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-indigo-200/50">
            <div className="space-y-2">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Finalize Scholastic Review</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commit diagnostic results to the student's central academic record.</p>
            </div>
            <CustomButton className="h-16 px-12 bg-white text-slate-900 hover:bg-slate-100 border-none text-[11px]" onClick={() => router.back()}>
               Submit Review Terminal <ArrowRight className="h-5 w-5 ml-3" />
            </CustomButton>
         </div>
      </div>
    </div>
  )
}
