"use client"

import * as React from "react"
import { 
  getGradingCourses, 
  getCourseQuizzes, 
  getQuizSubmissions, 
  submitGradeUpdate, 
  generateAIGrade,
  generateBatchAIGrades
} from "./actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  Users, 
  BookOpen, 
  Timer, 
  ArrowLeft,
  Check,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type ViewState = 'COURSES' | 'QUIZZES' | 'SUBMISSIONS' | 'GRADE'

export default function GradingInterfacePage() {
  const [view, setView] = React.useState<ViewState>('COURSES')
  const [loading, setLoading] = React.useState(true)
  
  // Data States
  const [courses, setCourses] = React.useState<any[]>([])
  const [quizzes, setQuizzes] = React.useState<any[]>([])
  const [submissions, setSubmissions] = React.useState<any[]>([])
  
  // Selection States
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null)
  const [selectedQuiz, setSelectedQuiz] = React.useState<any>(null)
  const [selectedAttempt, setSelectedAttempt] = React.useState<any>(null)
  
  // Grading States
  const [editedResults, setEditedResults] = React.useState<any[]>([])
  const [aiLoading, setAiLoading] = React.useState<number | null>(null)
  const [bulkAiLoading, setBulkAiLoading] = React.useState(false)

  const loadInitialData = React.useCallback(async () => {
    setLoading(true)
    const data = await getGradingCourses()
    setCourses(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const navigateToQuizzes = async (course: any) => {
    setLoading(true)
    setSelectedCourse(course)
    const data = await getCourseQuizzes(course.id)
    setQuizzes(data)
    setView('QUIZZES')
    setLoading(false)
  }

  const navigateToSubmissions = async (quiz: any) => {
    setLoading(true)
    setSelectedQuiz(quiz)
    const data = await getQuizSubmissions(quiz.id)
    setSubmissions(data)
    setView('SUBMISSIONS')
    setLoading(false)
  }

  const openAttempt = (attempt: any) => {
    setSelectedAttempt(attempt)
    setEditedResults(JSON.parse(JSON.stringify(attempt.results)))
    setView('GRADE')
  }

  const goBack = () => {
    if (view === 'GRADE') setView('SUBMISSIONS')
    else if (view === 'SUBMISSIONS') setView('QUIZZES')
    else if (view === 'QUIZZES') setView('COURSES')
  }

  const handleInputChange = (idx: number, field: string, value: any) => {
    setEditedResults(prev => {
      const next = [...prev]
      let processedValue = value
      if (field === 'earned') processedValue = parseFloat(value) || 0
      next[idx] = { ...next[idx], [field]: processedValue }
      if (field === 'earned' && processedValue > 0) next[idx].isCorrect = true
      
      // If manually modified, we might want to keep it "unapproved" 
      // but usually teacher input IS the approval. Let's keep manual:true until Approve button.
      return next
    })
  }

  const approveQuestion = (idx: number) => {
    setEditedResults(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], manual: false }
      return next
    })
    toast.success(`Su'aasha ${idx + 1} waa la ansixiyay.`)
  }

  const approveAll = () => {
    setEditedResults(prev => {
      return prev.map(r => ({ ...r, manual: false }))
    })
    toast.success("Dhammaan su'aalaha waa la ansixiyay!")
  }

  const handleAIGrade = async (idx: number, r: any) => {
    setAiLoading(idx)
    try {
      const res = await generateAIGrade(r.question, r.studentAnswer || "", r.total, r.correctAnswer || "")
      if (res.success) {
        setEditedResults(prev => {
          const next = [...prev]
          next[idx] = { ...next[idx], earned: res.earned, feedback: res.feedback, isCorrect: res.earned > 0 }
          return next
        })
        toast.info("AI suggestion received. Please review and approve.")
      } else {
        toast.error(res.error || "AI Grading failed")
      }
    } catch (e) {
      toast.error("Network error during AI grading")
    }
    setAiLoading(null)
  }

  const handleBulkAIGrade = async () => {
    const pendingItems = editedResults
      .map((r, idx) => ({ ...r, idx }))
      .filter(r => r.manual)
    
    if (pendingItems.length === 0) {
      toast.info("Ma jiraan su'aalo dhiman oo AI u baahan.")
      return
    }

    setBulkAiLoading(true)
    try {
      const itemsForAi = pendingItems.map(it => ({
        id: it.idx.toString(),
        question: it.question,
        studentAnswer: it.studentAnswer || "",
        total: it.total,
        correctAnswer: it.correctAnswer
      }))

      const res = await generateBatchAIGrades(itemsForAi)
      if (res.success && res.results) {
        setEditedResults(prev => {
          const next = [...prev]
          res.results!.forEach((aiRes: any) => {
            const idx = parseInt(aiRes.id)
            next[idx] = { 
               ...next[idx], 
               earned: aiRes.earned, 
               feedback: aiRes.feedback, 
               isCorrect: aiRes.earned > 0 
            }
          })
          return next
        })
        toast.success("AI ayaa soo wada saxday dhammaan su'aalaha!")
      } else {
        toast.error(res.error || "Bulk AI evaluation failed")
      }
    } catch (e) {
      toast.error("Error during bulk AI grading")
    }
    setBulkAiLoading(false)
  }

  const saveGrade = async () => {
    const unapproved = editedResults.filter(r => r.manual)
    if (unapproved.length > 0) {
      if (!confirm(`Wali waxaa dhiman ${unapproved.length} su'aal oo aan la ansixin. Ma rabtaa inaad keydiso?`)) {
        return
      }
    }

    const res = await submitGradeUpdate(selectedAttempt.id, editedResults)
    if (res.success) {
      toast.success("Si guul leh ayaa loo keydiyay!")
      const updatedData = await getQuizSubmissions(selectedQuiz.id)
      setSubmissions(updatedData)
      setView('SUBMISSIONS')
    } else {
      toast.error(res.error || "Cillad ayaa dhacday")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-10 max-w-[1200px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {view !== 'COURSES' && (
              <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="outline" className="border-indigo-200 text-indigo-600 px-3 py-1 bg-indigo-50/30 font-black text-[10px]">
              {view === 'COURSES' ? 'MASTER REGISTRY' : 
               view === 'QUIZZES' ? selectedCourse?.name : 
               view === 'SUBMISSIONS' ? selectedQuiz?.title : 
               'EVALUATION MODE'}
            </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            {view === 'COURSES' ? 'Course Grading.' : 
             view === 'QUIZZES' ? 'Quizzes List.' : 
             view === 'SUBMISSIONS' ? 'Submissions.' : 
             'Assignment Review.'}
          </h1>
        </div>
        {view === 'GRADE' && (
          <div className="flex items-center gap-4">
            <Button 
               onClick={handleBulkAIGrade} 
               disabled={bulkAiLoading}
               variant="outline"
               className="h-14 px-6 rounded-2xl border-2 border-indigo-100 text-indigo-700 font-black hover:bg-indigo-50 gap-2"
            >
               {bulkAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-indigo-500" />}
               Bulk AI Evaluation
            </Button>
            <Button 
               onClick={approveAll} 
               variant="outline"
               className="h-14 px-6 rounded-2xl border-2 border-emerald-100 text-emerald-700 font-black hover:bg-emerald-50 gap-2"
            >
               <CheckCircle2 className="h-5 w-5" /> Approve All
            </Button>
            <Button onClick={saveGrade} className="bg-slate-900 hover:bg-black text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-slate-200 gap-2">
              <Check className="h-5 w-5" /> Save Results
            </Button>
          </div>
        )}
      </div>

      {view === 'COURSES' && (
        <div className="grid gap-6">
           <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Course Name</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Instructor</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Enrolled</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Quizzes</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {courses.map(course => (
                       <tr key={course.id} className="hover:bg-indigo-50/20 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors shadow-sm">
                                   <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-900">{course.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.className}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6"><p className="text-sm font-bold text-slate-600">{course.teacher}</p></td>
                          <td className="px-8 py-6 text-center">
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600">
                                <Users className="h-3.5 w-3.5" />
                                <span className="text-xs font-black">{course.studentsCount}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center"><p className="text-sm font-black text-slate-900">{course.quizCount}</p></td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => navigateToQuizzes(course)} variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                                <ChevronRight className="h-5 w-5" />
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {view === 'QUIZZES' && (
        <div className="grid gap-6">
           <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Quiz Title</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Attempts</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {quizzes.map(quiz => (
                       <tr key={quiz.id} className="hover:bg-emerald-50/20 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white shadow-sm">
                                   <FileText className="h-6 w-6" />
                                </div>
                                <p className="font-black text-slate-900">{quiz.title}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <Badge variant="outline" className="text-xs font-black rounded-lg border-slate-200">
                                {quiz._count.attempts} Attempts
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => navigateToSubmissions(quiz)} className="h-10 px-6 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                View Submissions
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {view === 'SUBMISSIONS' && (
        <div className="grid gap-6">
           <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Student Name</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Taken On</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Score</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {submissions.map(attempt => {
                       const results = attempt.results as any[]
                       const pendingCount = results.filter(r => r.manual).length
                       return (
                          <tr key={attempt.id} className="hover:bg-indigo-50/20 transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-white transition-colors">
                                      {attempt.student?.firstName?.[0]}{attempt.student?.lastName?.[0]}
                                   </div>
                                   <p className="font-black text-slate-900">{attempt.student?.firstName} {attempt.student?.lastName}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center"><p className="text-sm font-bold text-slate-500">{format(new Date(attempt.createdAt), "MMM dd, hh:mm a")}</p></td>
                             <td className="px-8 py-6 text-center">
                                <div className="space-y-1">
                                   <p className="text-xl font-black text-slate-900">{attempt.score}%</p>
                                   {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] font-black px-2">{pendingCount} PENDING</Badge>}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <Button onClick={() => openAttempt(attempt)} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-black hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                                   {pendingCount > 0 ? 'Evaluate Now' : 'Edit Evaluation'}
                                </Button>
                             </td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {view === 'GRADE' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
           {/* Attempt Summary */}
           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="h-20 w-20 rounded-[28px] bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <GraduationCap className="h-10 w-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900">{selectedAttempt.student?.firstName} {selectedAttempt.student?.lastName}</h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">Submission for: {selectedQuiz?.title}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-2">SCORE</p>
                 <h3 className="text-6xl font-black text-slate-900 leading-none">{selectedAttempt.score}%</h3>
              </div>
           </div>

           {/* Questions */}
           <div className="space-y-6">
              {editedResults.map((r: any, idx: number) => {
                 const isUnapproved = r.manual === true
                 return (
                    <div key={idx} className={`p-10 rounded-[3rem] border-2 transition-all ${isUnapproved ? "bg-amber-50/20 border-amber-100 shadow-sm shadow-amber-50" : "bg-emerald-50/20 border-emerald-100 shadow-sm shadow-emerald-50"}`}>
                       <div className="flex flex-col lg:flex-row gap-10">
                          <div className="flex-1 space-y-6">
                             <div className="flex items-center gap-4">
                                <span className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${isUnapproved ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{idx + 1}</span>
                                <Badge className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl ${isUnapproved ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                   {isUnapproved ? "Awaiting Review" : "Approved"}
                                </Badge>
                             </div>
                             <h4 className="text-2xl font-bold text-slate-900">{r.question}</h4>
                             <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">STUDENT'S ANSWER</p>
                                <p className="text-lg font-semibold text-slate-700">{r.studentAnswer || "No Answer"}</p>
                             </div>
                          </div>

                          <div className="w-full lg:w-80 space-y-6 shrink-0 bg-white/50 p-8 rounded-[2.5rem] border border-slate-100">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">Points <span>/{r.total}</span></label>
                                <Input type="number" max={r.total} min={0} value={r.earned} onChange={(e) => handleInputChange(idx, 'earned', e.target.value)} className="h-16 rounded-2xl text-2xl font-black" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Feedback</label>
                                <Textarea placeholder="Share feedback..." value={r.feedback || ""} onChange={(e) => handleInputChange(idx, 'feedback', e.target.value)} className="rounded-2xl resize-none text-sm h-32" />
                             </div>
                             <div className="space-y-3 pt-2">
                                {isUnapproved ? (
                                   <div className="grid grid-cols-1 gap-2">
                                      <Button onClick={() => approveQuestion(idx)} className="h-12 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 gap-2">
                                         <Check className="h-4 w-4" /> Approve Grade
                                      </Button>
                                      <Button onClick={() => handleAIGrade(idx, r)} disabled={aiLoading === idx} variant="outline" className="h-12 rounded-xl border-indigo-200 text-indigo-700 font-black gap-2">
                                         {aiLoading === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI Suggestion
                                      </Button>
                                   </div>
                                ) : (
                                   <Button disabled variant="outline" className="w-full h-12 rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50 font-black">
                                      <Check className="h-4 w-4 mr-2" /> Evaluation Finalized
                                   </Button>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                 )
              })}
           </div>
        </div>
      )}
    </div>
  )
}
