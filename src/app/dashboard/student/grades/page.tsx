"use client"

import * as React from "react"
import { GraduationCap, FileText, ChevronDown, Clock, History, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentGrades } from "./actions"
import { ReportCardTemplate } from "@/components/dashboard/report-card-template"
import { cn } from "@/lib/utils"

export default function StudentGradesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [grades, setGrades] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchGrades() {
      const res = await getStudentGrades()
      if (res.success) setGrades(res.data)
      setLoading(false)
    }
    fetchGrades()
  }, [])

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-indigo-100 border-t-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 overflow-x-hidden">
       {/* UI Content (Grades List, etc) */}
       <div className="print:hidden space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
             
             <div className="z-10 space-y-4 md:max-w-xl text-center md:text-left text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/90">Academic Performance</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">My Gradebook.</h1>
                <p className="text-white/60 font-medium text-lg leading-relaxed">
                  Track your progress across all subjects. Review quiz results, examine feedback, and download your official transcripts.
                </p>
             </div>

             <div className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl shrink-0 min-w-[200px]">
                <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-2">Academic Standing</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-amber-400 uppercase tracking-tighter">GOOD</span>
                </div>
                <Button onClick={() => window.print()} className="mt-6 w-full h-12 bg-white text-indigo-950 hover:bg-indigo-50 font-black rounded-2xl transition-all shadow-xl shadow-indigo-950/20 gap-2">
                   <FileText className="h-5 w-5" />
                   Official Report Card
                </Button>
             </div>
          </div>

          <div className="space-y-6">
            {grades.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                 <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6 scale-125">
                    <FileText className="h-12 w-12" />
                 </div>
                 <p className="text-slate-400 font-black text-xl uppercase tracking-tighter italic">No grading data synchronized yet.</p>
              </div>
            ) : (
               grades.map((subject, idx) => (
                  <SubjectAccordion key={idx} subject={subject} />
               ))
            )}
          </div>
       </div>

       {/* Printable Report Card Template - HIDDEN IN UI, VISIBLE IN PRINT */}
       <div className="hidden print:block">
          <ReportCardTemplate 
            data={grades} 
            user={{ 
              fullName: user ? `${user.firstName} ${user.lastName}` : "", 
              studentId: user?.studentId, 
              id: user?.id 
            }} 
          />
       </div>
    </div>
  )
}

function SubjectAccordion({ subject }: { subject: any }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const getGradeColor = (avg: number) => {
    if (avg >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-100"
    if (avg >= 50) return "text-amber-600 bg-amber-50 border-amber-100"
    return "text-rose-600 bg-rose-50 border-rose-100"
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100 bg-white overflow-hidden group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-slate-50/50 transition-all text-left"
      >
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
             <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1 group-hover:text-indigo-600 transition-colors uppercase">{subject.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor: {subject.teacher}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className={cn("hidden sm:flex px-4 py-2 rounded-2xl border font-black text-sm", getGradeColor(subject.grade || 0))}>
              {subject.grade}%
           </div>
           <ChevronDown className={cn("h-6 w-6 text-slate-300 transition-transform duration-500", isOpen && "rotate-180 text-indigo-500")} />
        </div>
      </button>

      {isOpen && (
        <CardContent className="p-6 md:p-8 pt-0 space-y-8 animate-in slide-in-from-top-4 duration-500">
           <div className="h-px bg-slate-100 w-full" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subject.quizzes.map((quiz: any, idx: number) => (
                 <QuizResultItem key={idx} quiz={quiz} />
              ))}
           </div>
        </CardContent>
      )}
    </Card>
  )
}

function QuizResultItem({ quiz }: { quiz: any }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="space-y-4">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-50 hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-4">
           <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
             <FileText className="h-5 w-5" />
           </div>
           <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 text-slate-400">QUIZ</Badge>
        </div>
        <h4 className="font-black text-slate-900 uppercase tracking-tight mb-4 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{quiz.title}</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
           <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">BEST Score</p>
              <p className="text-xl font-black text-slate-900 italic tracking-tighter">{quiz.max}%</p>
           </div>
           <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Avg Rating</p>
              <p className="text-xl font-black text-emerald-600 italic tracking-tighter">{quiz.avg}%</p>
           </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
           <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 italic">2 Days Ago</span>
           </div>
           <Badge className="bg-slate-900 border-none text-[9px] font-black px-2">{quiz.attempts} ATTEMPTS</Badge>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          {quiz.details?.map((attempt: any, aIdx: number) => (
            <div key={aIdx} className="bg-white border-2 border-indigo-50 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-indigo-50 pb-4">
                 <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-indigo-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-950 whitespace-nowrap">Attempt #{aIdx + 1}</p>
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-indigo-600 italic">{attempt.score}%</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Result</span>
                 </div>
              </div>

              <div className="space-y-4">
                 {attempt.results?.map((r: any, rIdx: number) => (
                    <div key={rIdx} className="space-y-3">
                       <div className="flex items-start gap-4">
                          <div className={cn("h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black", r.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                             {rIdx + 1}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs font-black text-slate-800 uppercase tracking-tighter mb-2">{r.question}</p>
                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                                <p className="text-xs font-bold text-slate-600 italic">"{r.studentAnswer || "No Answer"}"</p>
                             </div>
                             {r.feedback && (
                                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                   <div className="flex items-center gap-1.5 mb-1">
                                      <Sparkles className="h-3 w-3 text-indigo-400" />
                                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Instructor Feedback</p>
                                   </div>
                                   <p className="text-xs font-bold text-indigo-900 leading-relaxed">{r.feedback}</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
