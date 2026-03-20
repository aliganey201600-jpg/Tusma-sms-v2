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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertCircle,
  Search,
  Filter,
  GraduationCap as ClassIcon
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
  
  // Filter States
  const [searchTerm, setSearchTerm] = React.useState("")
  const [classFilter, setClassFilter] = React.useState("all")

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
    const data = await getQuizSubmissions(quiz.id, selectedCourse.classId)
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
      const updatedData = await getQuizSubmissions(selectedQuiz.id, selectedCourse.classId)
      setSubmissions(updatedData)
      setView('SUBMISSIONS')
    } else {
      toast.error(res.error || "Cillad ayaa dhacday")
    }
  }

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter === "all" || course.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [courses, searchTerm, classFilter]);

  const uniqueClasses = React.useMemo(() => {
    const classes = new Set<string>();
    courses.forEach(c => {
      if(c.className) classes.add(c.className);
    });
    return Array.from(classes).sort();
  }, [courses]);

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
              <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="outline" className="border-indigo-200 text-indigo-600 px-3 py-1 bg-indigo-50/30 font-black text-[10px] tracking-widest">
              {view === 'COURSES' ? 'MASTER REGISTRY' : 
               view === 'QUIZZES' ? `${selectedCourse?.name} (${selectedCourse?.className})` : 
               view === 'SUBMISSIONS' ? selectedQuiz?.title : 
               'EVALUATION MODE'}
            </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
            {view === 'COURSES' ? 'Course Grading.' : 
             view === 'QUIZZES' ? 'Quizzes List.' : 
             view === 'SUBMISSIONS' ? 'Submissions.' : 
             'Assignment Review.'}
          </h1>
        </div>
        {view === 'GRADE' && (
          <div className="flex items-center gap-4">
            <Button onClick={handleBulkAIGrade} disabled={bulkAiLoading} variant="outline" className="h-14 px-6 rounded-2xl border-2 border-indigo-100 text-indigo-700 font-black hover:bg-indigo-50 gap-2 shadow-sm">
               {bulkAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-indigo-500" />}
               Bulk AI Evaluation
            </Button>
            <Button onClick={approveAll} variant="outline" className="h-14 px-6 rounded-2xl border-2 border-emerald-100 text-emerald-700 font-black hover:bg-emerald-50 gap-2 shadow-sm">
               <CheckCircle2 className="h-5 w-5" /> Approve All
            </Button>
            <Button onClick={saveGrade} className="bg-slate-900 hover:bg-black text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-slate-200 gap-2">
              <Check className="h-5 w-5" /> Save Results
            </Button>
          </div>
        )}
      </div>

      {view === 'COURSES' && (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <Input 
                    placeholder="Search by course or teacher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-indigo-500 transition-all shadow-sm"
                 />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                 <SelectTrigger className="w-full md:w-64 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium shadow-sm">
                    <div className="flex items-center gap-2">
                       <Filter className="h-4 w-4 text-slate-400" />
                       <SelectValue placeholder="All Classes" />
                    </div>
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-2">
                    <SelectItem value="all" className="font-bold text-slate-600">All Classes</SelectItem>
                    {uniqueClasses.map(cls => (
                       <SelectItem key={cls} value={cls} className="font-bold text-indigo-600">{cls}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>

           <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                       <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Class Assignment</th>
                       <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Instructor</th>
                       <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">Size</th>
                       <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">Quizzes</th>
                       <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-right">View</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredCourses.map((row, idx) => (
                       <tr key={`${row.id}-${row.classId}-${idx}`} className="hover:bg-slate-50/80 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center">
                                   <BookOpen className="h-7 w-7" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1.5">{row.name}</p>
                                   <div className="flex items-center gap-1.5">
                                      <ClassIcon className="h-3 w-3 text-indigo-500" />
                                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{row.className}</p>
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-600 text-sm">{row.teacher}</td>
                          <td className="px-8 py-6 text-center">
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold group-hover:bg-white border group-hover:border-slate-200 transition-all">
                                <Users className="h-3.5 w-3.5" />
                                <span className="text-sm font-black">{row.studentsCount}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <Badge className="bg-slate-900 text-white font-black rounded-lg px-3 uppercase text-[10px]">{row.quizCount}</Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => navigateToQuizzes(row)} variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                                <ChevronRight className="h-6 w-6" />
                             </Button>
                          </td>
                       </tr>
                    ))}
                    {filteredCourses.length === 0 && (
                       <tr>
                          <td colSpan={5} className="px-8 py-32 text-center bg-slate-50/10">
                             <div className="flex flex-col items-center gap-4">
                                <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-100">
                                   <Search className="h-12 w-12" />
                                </div>
                                <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching results found</p>
                                <Button onClick={() => { setSearchTerm(""); setClassFilter("all"); }} variant="link" className="text-indigo-600 font-black uppercase text-xs tracking-widest">Clear all filters</Button>
                             </div>
                          </td>
                       </tr>
                    )}
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
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Quiz Title</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Attempts</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {quizzes.map(quiz => (
                       <tr key={quiz.id} className="hover:bg-emerald-50/20 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white shadow-sm transition-all">
                                   <FileText className="h-6 w-6" />
                                </div>
                                <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{quiz.title}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <Badge variant="outline" className="text-xs font-black rounded-lg border-slate-200 px-3 py-1 bg-slate-50">
                                {quiz._count.attempts} Attempts
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => navigateToSubmissions(quiz)} className="h-12 px-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
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
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Information</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Completion</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Result</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {submissions.map(attempt => {
                       const results = attempt.results as any[]
                       const pendingCount = results.filter(r => r.manual).length
                       return (
                          <tr key={attempt.id} className="hover:bg-indigo-50/20 transition-all group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-sm">
                                      {attempt.student?.firstName?.[0]}{attempt.student?.lastName?.[0]}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900 uppercase tracking-tight">{attempt.student?.firstName} {attempt.student?.lastName}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{attempt.student?.studentId}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <p className="text-sm font-bold text-slate-500">{format(new Date(attempt.createdAt), "MMM dd, hh:mm a")}</p>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <div className="space-y-1">
                                   <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{attempt.score}%</p>
                                   {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] font-black px-2 tracking-widest border-none">UNSANCTIONED</Badge>}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <Button onClick={() => openAttempt(attempt)} className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                                   {pendingCount > 0 ? 'SANCTION GRADE' : 'REVise ASSESSMENT'}
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
           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-40 bg-indigo-600/5 -skew-x-12 translate-x-10" />
              <div className="flex items-center gap-8 relative">
                 <div className="h-24 w-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <GraduationCap className="h-12 w-12" />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{selectedAttempt.student?.firstName} {selectedAttempt.student?.lastName}</h2>
                    <div className="flex items-center gap-3">
                       <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] tracking-widest">{selectedCourse?.className}</Badge>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedQuiz?.title}</p>
                    </div>
                 </div>
              </div>
              <div className="text-right bg-white p-8 rounded-[2rem] border-2 border-indigo-50 shadow-xl shadow-indigo-50/40 relative min-w-[200px]">
                 <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-2">SCORE CARRIER</p>
                 <div className="flex items-baseline justify-end gap-1">
                    <h3 className="text-7xl font-black text-slate-900 leading-none tracking-tighter">{selectedAttempt.score}</h3>
                    <span className="text-2xl font-black text-slate-300">%</span>
                 </div>
              </div>
           </div>

           {/* Questions */}
           <div className="space-y-8">
              {editedResults.map((r: any, idx: number) => {
                 const isUnapproved = r.manual === true
                 return (
                    <div key={idx} className={`p-10 rounded-[3.5rem] border-2 transition-all ${isUnapproved ? "bg-amber-50/20 border-amber-100 shadow-sm shadow-amber-50" : "bg-emerald-50/30 border-emerald-100 shadow-sm shadow-emerald-50"}`}>
                       <div className="flex flex-col lg:flex-row gap-12">
                          <div className="flex-1 space-y-8">
                             <div className="flex items-center gap-4">
                                <span className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl ${isUnapproved ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-emerald-100 text-emerald-600 shadow-sm'}`}>{idx + 1}</span>
                                <Badge className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl shadow-sm border-none ${isUnapproved ? 'bg-white text-amber-600' : 'bg-white text-emerald-600'}`}>
                                   {isUnapproved ? "In-Decision / Manual Review Required" : "Sanctioned & Archived"}
                                </Badge>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{r.question}</h4>
                                <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 space-y-5 relative group overflow-hidden shadow-sm">
                                   <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-indigo-600 transition-colors" />
                                   <div className="flex items-center gap-2">
                                      <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Submission</p>
                                   </div>
                                   <p className="text-xl font-bold text-slate-700 leading-relaxed italic group-hover:text-slate-900 transition-colors">"{r.studentAnswer || "No Response"}"</p>
                                </div>
                             </div>
                          </div>

                          <div className="w-full lg:w-96 space-y-8 shrink-0 bg-white/70 p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm backdrop-blur-xl">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between px-1">Evaluation Score <span>MAX: {r.total}</span></label>
                                <Input type="number" max={r.total} min={0} value={r.earned} onChange={(e) => handleInputChange(idx, 'earned', e.target.value)} className="h-16 rounded-22xl text-3xl font-black focus:ring-4 focus:ring-indigo-100 border-2 transition-all" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Constructive Feedback</label>
                                <Textarea placeholder="Share insights..." value={r.feedback || ""} onChange={(e) => handleInputChange(idx, 'feedback', e.target.value)} className="rounded-2xl resize-none text-base h-40 focus:ring-4 focus:ring-indigo-100 border-2 leading-relaxed" />
                             </div>
                             <div className="space-y-4 pt-4">
                                {isUnapproved ? (
                                   <div className="grid grid-cols-1 gap-3">
                                      <Button onClick={() => approveQuestion(idx)} className="h-16 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 gap-3 shadow-lg shadow-emerald-100 flex items-center justify-center text-lg active:scale-95 transition-all">
                                         <Check className="h-6 w-6" /> Sanction Grade
                                      </Button>
                                      <Button onClick={() => handleAIGrade(idx, r)} disabled={aiLoading === idx} variant="outline" className="h-16 rounded-2xl border-2 border-indigo-100 text-indigo-700 font-black gap-3 hover:bg-indigo-50 transition-all text-lg group">
                                         {aiLoading === idx ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform" />} 
                                         AI Proposal
                                      </Button>
                                   </div>
                                ) : (
                                   <div className="space-y-4">
                                      <div className="w-full h-16 rounded-2xl border-2 border-emerald-200 text-emerald-700 bg-white shadow-inner flex items-center justify-center gap-3 font-black text-lg">
                                         <CheckCircle2 className="h-6 w-6" /> SANCTIONED
                                      </div>
                                      <Button onClick={() => {
                                         setEditedResults(prev => {
                                            const next = [...prev];
                                            next[idx].manual = true;
                                            return next;
                                         });
                                      }} variant="ghost" className="w-full h-10 text-[9px] font-black uppercase text-slate-400 hover:text-indigo-600 tracking-widest transition-colors">
                                         <RotateCcw className="h-3 w-3 mr-2" /> Revoke Decision
                                      </Button>
                                   </div>
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
