"use client"

import * as React from "react"
import { 
  getGradingCourses, 
  getCourseQuizzes, 
  getQuizSubmissions, 
  submitGradeUpdate, 
  generateAIGrade 
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
  Search
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
      return next
    })
  }

  const markGraded = (idx: number) => {
    setEditedResults(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], manual: false }
      return next
    })
    toast.success("Question marked as graded.")
  }

  const handleAIGrade = async (idx: number, r: any) => {
    setAiLoading(idx)
    try {
      const res = await generateAIGrade(r.question, r.studentAnswer || "", r.total, r.correctAnswer || "")
      if (res.success) {
        handleInputChange(idx, 'earned', res.earned)
        handleInputChange(idx, 'feedback', res.feedback)
        toast.success("AI has suggested a grade!")
      } else {
        toast.error(res.error || "AI Grading failed")
      }
    } catch (e) {
      toast.error("Network error during AI grading")
    }
    setAiLoading(null)
  }

  const saveGrade = async () => {
    const res = await submitGradeUpdate(selectedAttempt.id, editedResults)
    if (res.success) {
      toast.success("Si guul leh ayaa loo keydiyay!")
      // Refresh submissions list
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
            <Badge variant="outline" className="border-indigo-200 text-indigo-600 px-3 py-1 bg-indigo-50/30">
              {view === 'COURSES' ? 'Master Registry' : 
               view === 'QUIZZES' ? selectedCourse?.name : 
               view === 'SUBMISSIONS' ? selectedQuiz?.title : 
               'Evaluation Mode'}
            </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            {view === 'COURSES' ? 'Course Grading.' : 
             view === 'QUIZZES' ? 'Quizzes List.' : 
             view === 'SUBMISSIONS' ? 'Submissions.' : 
             'Assignment Review.'}
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">
             {view === 'COURSES' ? 'Track and manage course-wide assessments.' : 
              view === 'QUIZZES' ? `Select a quiz from ${selectedCourse?.name} to view attempts.` : 
              view === 'SUBMISSIONS' ? `Reviewing all attempts for ${selectedQuiz?.title}.` : 
              `Grading student's attempt for ${selectedQuiz?.title}.`}
          </p>
        </div>
        {view === 'GRADE' && (
          <div className="flex gap-4">
            <Button onClick={saveGrade} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-100 gap-2">
              <CheckCircle2 className="h-5 w-5" /> Save Results
            </Button>
          </div>
        )}
      </div>

      {/* View Logic */}
      {view === 'COURSES' && (
        <div className="grid gap-6">
           <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Active Courses Overview</h3>
              </div>
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
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-slate-600">{course.teacher}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600">
                                <Users className="h-3.5 w-3.5" />
                                <span className="text-xs font-black">{course.studentsCount}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <p className="text-sm font-black text-slate-900">{course.quizCount}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => navigateToQuizzes(course)} variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white hover:shadow-md transition-all group-hover:bg-indigo-600 group-hover:text-white">
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
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Quizzes for {selectedCourse?.name}</h3>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Quiz Title</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Total Attempts</th>
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
                                <div>
                                   <p className="font-black text-slate-900">{quiz.title}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passing: {quiz.passingScore}%</p>
                                </div>
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
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Student Submissions: {selectedQuiz?.title}</h3>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Student Info</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Date</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Score</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {submissions.map(attempt => {
                       const results = attempt.results as any[]
                       const pendingCount = results.filter(r => r.manual).length
                       return (
                          <tr key={attempt.id} className="hover:bg-indigo-50/20 transition-colors">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                                      {attempt.student?.firstName?.[0]}{attempt.student?.lastName?.[0]}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900">{attempt.student?.firstName} {attempt.student?.lastName}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {attempt.student?.studentId}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <p className="text-sm font-bold text-slate-500">{format(new Date(attempt.createdAt), "MMM dd, hh:mm a")}</p>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <div className="space-y-1">
                                   <p className="text-xl font-black text-slate-900">{attempt.score}%</p>
                                   {pendingCount > 0 && (
                                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[8px] uppercase font-black px-2">
                                         {pendingCount} Awaiting Review
                                      </Badge>
                                   )}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <Button onClick={() => openAttempt(attempt)} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                   {pendingCount > 0 ? 'Grade Now' : 'Edit Grade'}
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
        <div className="space-y-10">
           {/* Attempt Summary */}
           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="h-20 w-20 rounded-[28px] bg-slate-100 flex items-center justify-center text-slate-400">
                    <GraduationCap className="h-10 w-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900">{selectedAttempt.student?.firstName} {selectedAttempt.student?.lastName}</h2>
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-1">
                       <Timer className="h-4 w-4" /> Taken on {format(new Date(selectedAttempt.createdAt), "MMMM dd, yyyy")}
                    </p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-2">Original Performance</p>
                 <div className="flex items-baseline gap-2 justify-end">
                    <h3 className="text-6xl font-black text-slate-900 leading-none">{selectedAttempt.score}%</h3>
                    <span className="text-lg font-black text-slate-300">/ 100</span>
                 </div>
              </div>
           </div>

           {/* Questions List */}
           <div className="space-y-8">
              {editedResults.map((r: any, idx: number) => {
                 const isPending = r.manual === true
                 return (
                    <div key={idx} className={`p-10 rounded-[3rem] border-2 transition-all ${isPending ? "bg-amber-50/20 border-amber-100" : "bg-emerald-50/20 border-emerald-100"}`}>
                       <div className="flex flex-col lg:flex-row items-start gap-10">
                          <div className="flex-1 space-y-6">
                             <div className="flex items-center gap-4">
                                <span className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{idx + 1}</span>
                                <Badge className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                   {isPending ? "Awaiting Review" : "Corrected"}
                                </Badge>
                             </div>
                             
                             <h4 className="text-2xl font-bold text-slate-900 leading-tight">{r.question}</h4>
                             
                             <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Response</p>
                                <p className="text-lg font-semibold text-slate-700 whitespace-pre-wrap">{r.studentAnswer || "No Answer Provided"}</p>
                             </div>
                          </div>

                          <div className="w-full lg:w-80 space-y-6 shrink-0 bg-white/50 p-8 rounded-[2rem] border border-slate-100">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                                   Earned Points <span>/ {r.total}</span>
                                </label>
                                <Input 
                                   type="number" 
                                   max={r.total} 
                                   min={0} 
                                   value={r.earned} 
                                   onChange={(e) => handleInputChange(idx, 'earned', e.target.value)} 
                                   className="h-16 bg-white rounded-2xl text-2xl font-black text-slate-900 border-2 focus:border-indigo-500 transition-all" 
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Feedback</label>
                                <Textarea 
                                   placeholder="Your notes for the student..." 
                                   value={r.feedback || ""}
                                   onChange={(e) => handleInputChange(idx, 'feedback', e.target.value)}
                                   className="bg-white rounded-2xl resize-none text-sm h-32 border-2 focus:border-indigo-500 transition-all"
                                />
                             </div>
                             <div className="space-y-3 pt-4">
                                {isPending && (
                                   <>
                                      <Button onClick={() => markGraded(idx)} variant="outline" className="w-full h-12 rounded-xl border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-black">
                                         Confirm Manual Grade
                                      </Button>
                                      <Button 
                                         onClick={() => handleAIGrade(idx, r)} 
                                         disabled={aiLoading === idx}
                                         variant="outline" 
                                         className="w-full h-12 rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 gap-2 font-black"
                                      >
                                         {aiLoading === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                         Use AI Assistant
                                      </Button>
                                   </>
                                )}
                                {!isPending && (
                                   <Button disabled variant="outline" className="w-full h-12 rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50 font-black">
                                      <CheckCircle2 className="h-4 w-4 mr-2" /> Evaluation Saved
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
