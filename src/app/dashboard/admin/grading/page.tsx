"use client"

import * as React from "react"
import { getPendingGradingTasks, submitGradeUpdate, generateAIGrade } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle2, ChevronRight, GraduationCap, X, RotateCcw, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function GradingInterfacePage() {
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedTask, setSelectedTask] = React.useState<any>(null)
  const [editedResults, setEditedResults] = React.useState<any[]>([])
  const [aiLoading, setAiLoading] = React.useState<number | null>(null)

  const handleAIGrade = async (idx: number, r: any) => {
    setAiLoading(idx)
    try {
      const res = await generateAIGrade(r.question, r.studentAnswer || "", r.total, r.correctAnswer || "")
      if (res.success) {
        handleInputChange(idx, 'earned', res.earned)
        handleInputChange(idx, 'feedback', res.feedback)
        toast.success("AI has suggested a grade. You can review and modify it.")
      } else {
        toast.error(res.error || "AI Grading failed")
      }
    } catch (e) {
      toast.error("Network error during AI grading")
    }
    setAiLoading(null)
  }

  const loadTasks = React.useCallback(async () => {
    setLoading(true)
    const data = await getPendingGradingTasks()
    setTasks(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const openTask = (task: any) => {
    setSelectedTask(task)
    setEditedResults(JSON.parse(JSON.stringify(task.results)))
  }

  const handleInputChange = (idx: number, field: string, value: any) => {
    setEditedResults(prev => {
      const next = [...prev]
      let processedValue = value
      
      if (field === 'earned') {
        processedValue = parseFloat(value) || 0
      }

      next[idx] = { ...next[idx], [field]: processedValue }
      
      if (field === 'earned' && processedValue > 0) {
        next[idx].isCorrect = true
      }
      
      return next
    })
  }

  const markGraded = (idx: number) => {
    const next = [...editedResults]
    next[idx] = { ...next[idx], manual: false }
    setEditedResults(next)
    toast.success("Question marked as graded.")
  }

  const saveGrade = async () => {
    // Check if there are still pending manual true
    const stillPending = editedResults.filter((r: any) => r.manual)
    if (stillPending.length > 0) {
      if (!confirm(`Wali waxaa dhiman ${stillPending.length} su'aal. Ma rabtaa inaad u keydiso sidan oo uusan xirmin?`)) {
        return
      }
    }

    const res = await submitGradeUpdate(selectedTask.id, editedResults)
    if (res.success) {
      toast.success("Si guul leh ayaa loo keydiyay natiijada!")
      setSelectedTask(null)
      loadTasks()
    } else {
      toast.error(res.error || "Cillad ayaa dhacday")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Pending Tasks...</p>
        </div>
      </div>
    )
  }

  if (selectedTask) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedTask(null)} className="gap-2 text-slate-500 font-bold">
             <ChevronRight className="h-4 w-4 rotate-180" /> Back to Dashboard
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" className="gap-2 text-slate-500" onClick={() => setEditedResults(JSON.parse(JSON.stringify(selectedTask.results)))}>
               <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={saveGrade} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
               <CheckCircle2 className="h-4 w-4" /> Save Score & Complete
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-black text-slate-900">{selectedTask.quiz?.title}</h2>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Student: {selectedTask.student?.firstName} {selectedTask.student?.lastName} - ID: {selectedTask.student?.studentId}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">Current Overall Score</p>
              <h3 className="text-4xl font-black text-slate-900">{selectedTask.score}%</h3>
           </div>
        </div>

        <div className="space-y-6">
          {editedResults.map((r: any, idx: number) => {
            if (!r.manual && !r.isCorrect && selectedTask.results[idx].manual) {
              // Graded but originally pending
            }
            const isPending = r.manual === true

            return (
              <div key={idx} className={`p-8 rounded-[2rem] border-2 transition-all ${isPending ? "bg-amber-50/20 border-amber-100" : "bg-emerald-50/20 border-emerald-100"}`}>
                 <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                       <span className={`h-10 w-10 text-xs rounded-xl flex items-center justify-center font-black ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{idx + 1}</span>
                       <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                             <Badge className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {isPending ? "Awaiting Grade" : "Graded"}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Points: {r.total}</span>
                          </div>
                          <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">{r.question}</h4>
                          
                          <div className="p-6 rounded-2xl bg-white border border-slate-100 mt-4 space-y-3">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student's Output</p>
                             <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">{r.studentAnswer || "No Answer Provided"}</p>
                          </div>
                       </div>
                    </div>
                    <div className="w-56 space-y-4 shrink-0 border-l border-slate-100 pl-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Earned Points</label>
                          <Input 
                            type="number" 
                            max={r.total} 
                            min={0} 
                            value={r.earned} 
                            onChange={(e) => handleInputChange(idx, 'earned', e.target.value)} 
                            className="h-12 bg-white rounded-xl text-lg font-black text-slate-900" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feedback (Optional)</label>
                          <Textarea 
                            placeholder="Good job..." 
                            value={r.feedback || ""}
                            onChange={(e) => handleInputChange(idx, 'feedback', e.target.value)}
                            className="bg-white rounded-xl resize-none text-sm"
                          />
                       </div>
                       {isPending ? (
                         <div className="space-y-2">
                           <Button onClick={() => markGraded(idx)} variant="outline" className="w-full h-10 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100">
                              Apply Grade
                           </Button>
                           <Button 
                             onClick={() => handleAIGrade(idx, r)} 
                             disabled={aiLoading === idx}
                             variant="outline" 
                             className="w-full h-10 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 gap-2"
                           >
                              {aiLoading === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                              AI Auto-Grade
                           </Button>
                         </div>
                       ) : (
                         <Button disabled variant="outline" className="w-full h-10 border-emerald-200 text-emerald-700 bg-emerald-50">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Marked
                         </Button>
                       )}
                    </div>
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-10 max-w-[1200px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            <div className="h-16 w-16 rounded-[24px] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
              <FileText className="h-8 w-8 text-white" />
            </div>
            Instructor Grading.
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg max-w-xl">
            Review and assign scores for pending subjective assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-amber-50 flex items-center justify-center text-amber-600">
              <FileText className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Pending Reviews</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{tasks.length}</h3>
           </div>
        </Card>
      </div>

      {tasks.length > 0 ? (
        <div className="grid gap-4">
           {tasks.map(task => {
             const pendingCount = (task.results as any[]).filter(r => r.manual).length
             return (
               <div key={task.id} className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => openTask(task)}>
                  <div className="flex items-center gap-6">
                     <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-slate-400" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-slate-900">{task.quiz?.title}</h4>
                        <p className="text-sm font-bold text-slate-400">{task.student?.firstName} {task.student?.lastName} - {pendingCount} Awaiting Review(s)</p>
                     </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                        <p className="text-xs font-black text-slate-600">{format(new Date(task.createdAt), "MMM dd, yyyy")}</p>
                     </div>
                     <Button className="h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        Saxo Hadda
                     </Button>
                  </div>
               </div>
             )
           })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center space-y-6">
           <div className="h-20 w-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto text-slate-200">
              <CheckCircle2 className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Dhammaan Waa Nadiif</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">Ma jiraan imtixaano jawaabo gacanta iyo qoraal u baahan in laga war sugo. Si fiican ayaad u shaqaysay!</p>
           </div>
        </div>
      )}
    </div>
  )
}
