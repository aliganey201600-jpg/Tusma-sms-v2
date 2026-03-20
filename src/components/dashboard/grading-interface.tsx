"use client"

import * as React from "react"
import { Suspense } from "react"
import { 
  getGradingCourses, 
  getCourseQuizzes, 
  getQuizSubmissions, 
  submitGradeUpdate, 
  generateAIGrade,
  generateBatchAIGrades,
  generateGlobalQuizAIGrades,
  getCourseGradebookData,
  getClassOverallGradebook,
  getGradingClasses
} from "@/app/dashboard/admin/grading/actions"
import { useSearchParams } from "next/navigation"
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
  GraduationCap as ClassIcon,
  Zap
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type ViewState = 'COURSES' | 'QUIZZES' | 'SUBMISSIONS' | 'GRADE' | 'GRADEBOOK' | 'CLASS_REPORT'

export function GradingInterfaceContent({ userRole }: { userRole: 'ADMIN' | 'TEACHER' | 'STUDENT' }) {
  const searchParams = useSearchParams()
  const isGradebookMode = searchParams.get('view') === 'gradebook'
  const [view, setView] = React.useState<ViewState>('COURSES')
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'COURSES' | 'CLASSES'>('COURSES')
  
  // Data States
  const [courses, setCourses] = React.useState<any[]>([])
  const [quizzes, setQuizzes] = React.useState<any[]>([])
  const [submissions, setSubmissions] = React.useState<any[]>([])
  const [gradebookData, setGradebookData] = React.useState<{quizzes: any[], gradebook: any[]}>({ quizzes: [], gradebook: [] })
  const [classReportData, setClassReportData] = React.useState<{className: string, courses: string[], students: any[]}>({ className: "", courses: [], students: [] })
  const [classesList, setClassesList] = React.useState<any[]>([])
  
  // Search/Filter States
  const [searchTerm, setSearchTerm] = React.useState("")
  const [classFilter, setClassFilter] = React.useState("all")
  const [quizSearch, setQuizSearch] = React.useState("")
  const [submissionSearch, setSubmissionSearch] = React.useState("")

  // Selection States
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null)
  const [selectedQuiz, setSelectedQuiz] = React.useState<any>(null)
  const [selectedAttempt, setSelectedAttempt] = React.useState<any>(null)
  
  // Grading States
  const [editedResults, setEditedResults] = React.useState<any[]>([])
  const [aiLoading, setAiLoading] = React.useState<number | null>(null)
  const [bulkAiLoading, setBulkAiLoading] = React.useState(false)
  const [globalAiLoading, setGlobalAiLoading] = React.useState(false)

  const loadInitialData = React.useCallback(async () => {
    setLoading(true)
    const [coursesData, classesData] = await Promise.all([
      getGradingCourses(),
      getGradingClasses()
    ])
    setCourses(coursesData)
    setClassesList(classesData)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const navigateToQuizzes = async (course: any) => {
    setLoading(true)
    setSelectedCourse(course)
    const data = await getCourseQuizzes(course.id, course.classId)
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

  const navigateToGradebook = async (course: any) => {
    setLoading(true)
    setSelectedCourse(course)
    const data = await getCourseGradebookData(course.id, course.classId)
    setGradebookData(data)
    setView('GRADEBOOK')
    setLoading(false)
  }

  const navigateToClassReport = async (classId: string) => {
    setLoading(true)
    const data = await getClassOverallGradebook(classId)
    setClassReportData(data)
    setView('CLASS_REPORT')
    setLoading(false)
  }

  const goBack = () => {
    if (view === 'GRADE') setView('SUBMISSIONS')
    else if (view === 'SUBMISSIONS') setView('QUIZZES')
    else if (view === 'QUIZZES') setView('COURSES')
    else if (view === 'GRADEBOOK') setView('COURSES')
    else if (view === 'CLASS_REPORT') setView('COURSES')
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

  const handleGlobalAutoGrade = async () => {
    if (!confirm("Ma hubtaa inaad rabto inaad hal mar u wada saxdo dhammaan ardayda AI? Tani waxay qaadan kartaa waqti.")) return

    setGlobalAiLoading(true)
    try {
      const res = await generateGlobalQuizAIGrades(selectedQuiz.id, selectedCourse.classId)
      if (res.success) {
        toast.success(res.message || "Dhammaan ardayda waa loo wada saxay!")
        const updatedData = await getQuizSubmissions(selectedQuiz.id, selectedCourse.classId)
        setSubmissions(updatedData)
      } else {
        toast.error(res.error || "Cillad ayaa dhacday")
      }
    } catch (e) {
      toast.error("Internal Error")
    }
    setGlobalAiLoading(false)
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

  const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(quizSearch.toLowerCase()))

  const filteredSubmissions = submissions.filter(s => 
    `${s.student?.firstName} ${s.student?.lastName}`.toLowerCase().includes(submissionSearch.toLowerCase()) ||
    s.student?.studentId?.toLowerCase().includes(submissionSearch.toLowerCase())
  )

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
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 max-w-[1200px] mx-auto animate-in fade-in duration-700 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-full overflow-hidden">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {view !== 'COURSES' && (
              <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-all shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="outline" className="border-indigo-200 text-indigo-600 px-3 py-1 bg-indigo-50/30 font-black text-[10px] tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
              {view === 'COURSES' ? (isGradebookMode ? 'GRADEBOOK REGISTRY' : 'MASTER REGISTRY') : 
               view === 'QUIZZES' ? `${selectedCourse?.name} (${selectedCourse?.className})` : 
               view === 'SUBMISSIONS' ? selectedQuiz?.title : 
               view === 'GRADEBOOK' ? `${selectedCourse?.name} MATRIX` :
               view === 'CLASS_REPORT' ? `${classReportData.className} OVERALL` :
               'EVALUATION MODE'}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none break-words">
            {view === 'COURSES' ? (isGradebookMode ? 'Academic Gradebook.' : 'Course Grading.') : 
             view === 'QUIZZES' ? 'Quizzes List.' : 
             view === 'SUBMISSIONS' ? 'Submissions.' : 
             view === 'GRADEBOOK' ? 'Mark Sheet / Matrix.' :
             view === 'CLASS_REPORT' ? 'Class Master Sheet.' :
             'Assignment Review.'}
          </h1>
        </div>
        
        {view === 'SUBMISSIONS' && (
           <Button 
            onClick={handleGlobalAutoGrade} 
            disabled={globalAiLoading} 
            className="h-14 bg-indigo-600 hover:bg-slate-900 text-white font-black px-6 rounded-2xl shadow-xl shadow-indigo-100 gap-2 w-full md:w-auto"
           >
              {globalAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-indigo-300" />}
              AI Auto-Grade All Students
           </Button>
        )}

        {view === 'GRADE' && (
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <Button onClick={handleBulkAIGrade} disabled={bulkAiLoading} variant="outline" className="flex-1 md:flex-none h-12 md:h-14 px-4 md:px-6 rounded-2xl border-2 border-indigo-100 text-indigo-700 font-black hover:bg-indigo-50 gap-2 shadow-sm text-sm">
               {bulkAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-indigo-500" />}
               <span className="hidden sm:inline">Bulk AI Evaluation</span>
               <span className="sm:hidden">AI Bulk</span>
            </Button>
            <Button onClick={approveAll} variant="outline" className="flex-1 md:flex-none h-12 md:h-14 px-4 md:px-6 rounded-2xl border-2 border-emerald-100 text-emerald-700 font-black hover:bg-emerald-50 gap-2 shadow-sm text-sm">
               <CheckCircle2 className="h-4 w-4" />
               <span className="hidden sm:inline">Approve All</span>
            </Button>
            <Button onClick={saveGrade} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black px-6 md:px-8 h-12 md:h-14 rounded-2xl shadow-xl shadow-slate-200 gap-2 text-sm">
              <Check className="h-4 w-4" /> Save
            </Button>
          </div>
        )}
      </div>

      {view === 'COURSES' && (
        <div className="space-y-6">
            {/* TABS Navigation */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full md:w-fit mb-8 border border-white shadow-inner">
              <button 
                onClick={() => setActiveTab('COURSES')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'COURSES' ? "bg-white text-indigo-600 shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
              >
                Course Gradebook
              </button>
              <button 
                onClick={() => setActiveTab('CLASSES')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CLASSES' ? "bg-white text-indigo-600 shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
              >
                Class Master Sheet
              </button>
            </div>

            {activeTab === 'COURSES' ? (
              <>
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

                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30">
                            <th className="px-6 md:px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Class Assignment</th>
                            <th className="px-6 md:px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Instructor</th>
                            <th className="px-6 md:px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">Size</th>
                            <th className="px-6 md:px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">Quizzes</th>
                            <th className="px-6 md:px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.1em] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCourses.map((row, idx) => (
                            <tr key={`${row.id}-${row.classId}-${idx}`} className="hover:bg-slate-50/80 transition-all group">
                              <td className="px-6 md:px-8 py-6">
                                  <div className="flex items-center gap-5">
                                    <div className="h-12 md:h-14 w-12 md:w-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center shrink-0">
                                        <BookOpen className="h-6 md:h-7 w-6 md:w-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base md:text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1.5">{row.name}</p>
                                        <div className="flex items-center gap-1.5">
                                          <ClassIcon className="h-3 w-3 text-indigo-500" />
                                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{row.className}</p>
                                        </div>
                                    </div>
                                  </div>
                              </td>
                              <td className="px-6 md:px-8 py-6 font-bold text-slate-600 text-sm">{row.teacher}</td>
                              <td className="px-6 md:px-8 py-6 text-center">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold group-hover:bg-white border group-hover:border-slate-200 transition-all">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="text-sm font-black">{row.studentsCount}</span>
                                  </div>
                              </td>
                              <td className="px-6 md:px-8 py-6 text-center">
                                  <Badge className="bg-slate-900 text-white font-black rounded-lg px-3 uppercase text-[10px]">{row.quizCount}</Badge>
                              </td>
                                 <td className="px-6 md:px-8 py-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  {isGradebookMode ? (
                                    <Button onClick={() => navigateToGradebook(row)} className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-black hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 gap-2 text-xs">
                                      <FileText className="h-4 w-4" />View Gradebook
                                    </Button>
                                  ) : (
                                    userRole !== 'STUDENT' && (
                                      <Button onClick={() => navigateToQuizzes(row)} variant="ghost" className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shrink-0">
                                        <ChevronRight className="h-5 md:h-6 w-5 md:w-6" />
                                      </Button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesList
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((cls) => (
                  <Card key={cls.id} className="group overflow-hidden rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 bg-white">
                    <div className="p-8">
                       <div className="flex justify-between items-start mb-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                             <ClassIcon className="h-7 w-7" />
                          </div>
                          <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             ACTIVE
                          </Badge>
                       </div>
                       
                       <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cls.name}</h3>
                       
                       <div className="flex items-center gap-4 mb-8">
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500" />
                             <span className="text-[11px] font-bold text-slate-500">{cls.studentsCount} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-indigo-500" />
                             <span className="text-[11px] font-bold text-slate-500">{cls.coursesCount} Subjects</span>
                          </div>
                       </div>
                       
                       <Button 
                          onClick={() => navigateToClassReport(cls.id)}
                          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:shadow-slate-200 transition-all group-active:scale-95 gap-3"
                       >
                          View Master Report
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>
      )}

      {view === 'QUIZZES' && (
        <div className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                 placeholder="Search quiz title..." 
                 value={quizSearch}
                 onChange={(e) => setQuizSearch(e.target.value)}
                 className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-emerald-500 transition-all shadow-sm"
              />
           </div>

           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Quiz Title</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Students Worked</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Total Attempts</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredQuizzes.map(quiz => (
                       <tr key={quiz.id} className="hover:bg-emerald-50/20 transition-all group">
                          <td className="px-6 md:px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white shadow-sm transition-all shrink-0">
                                   <FileText className="h-6 w-6" />
                                </div>
                                <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{quiz.title}</p>
                             </div>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-center">
                             <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                   <Users className="h-4 w-4 text-emerald-500" />
                                   <p className="font-black text-slate-900">{quiz.uniqueStudents}</p>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Unique Students</p>
                             </div>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-center">
                             <Badge variant="outline" className="text-xs font-black rounded-lg border-slate-200 px-3 py-1 bg-slate-50">
                                {quiz.totalAttempts} Attempts
                             </Badge>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-right">
                             <Button onClick={() => navigateToSubmissions(quiz)} className="h-10 md:h-12 px-4 md:px-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm text-xs md:text-sm">
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
        <div className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                 placeholder="Search student by name or ID..." 
                 value={submissionSearch}
                 onChange={(e) => setSubmissionSearch(e.target.value)}
                 className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-indigo-500 transition-all shadow-sm"
              />
           </div>

           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                 <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Information</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Completion</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Result</th>
                       <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map(attempt => {
                       const results = attempt.results as any[]
                       const pendingCount = results.filter(r => r.manual).length
                       return (
                          <tr key={attempt.id} className="hover:bg-indigo-50/20 transition-all group">
                             <td className="px-6 md:px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 md:h-11 w-10 md:w-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-sm shrink-0">
                                      {attempt.student?.firstName?.[0]}{attempt.student?.lastName?.[0]}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{attempt.student?.firstName} {attempt.student?.lastName}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{attempt.student?.studentId}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 md:px-8 py-6 text-center whitespace-nowrap">
                                <p className="text-sm font-bold text-slate-500">{format(new Date(attempt.createdAt), "MMM dd, hh:mm a")}</p>
                             </td>
                             <td className="px-6 md:px-8 py-6 text-center">
                                <div className="space-y-1">
                                   <p className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                      {parseFloat(attempt.score).toFixed(1)}%
                                   </p>
                                   {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] font-black px-2 tracking-widest border-none whitespace-nowrap">UNSANCTIONED</Badge>}
                                </div>
                             </td>
                             <td className="px-6 md:px-8 py-6 text-right">
                                <Button onClick={() => openAttempt(attempt)} className="h-10 md:h-12 px-4 md:px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 text-xs md:text-sm whitespace-nowrap">
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
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-5 duration-500">
           {/* Attempt Summary */}
           <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-40 bg-indigo-600/5 -skew-x-12 translate-x-10" />
              <div className="flex items-center gap-6 md:gap-8 relative w-full md:w-auto">
                 <div className="h-16 md:h-24 w-16 md:w-24 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                    <GraduationCap className="h-8 md:h-12 w-8 md:w-12" />
                 </div>
                 <div className="min-w-0">
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2 overflow-hidden text-ellipsis">{selectedAttempt.student?.firstName} {selectedAttempt.student?.lastName}</h2>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                       <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] md:text-[10px] tracking-widest whitespace-nowrap">{selectedCourse?.className}</Badge>
                       <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest overflow-hidden text-ellipsis line-clamp-1">{selectedQuiz?.title}</p>
                    </div>
                 </div>
              </div>
              <div className="text-center md:text-right bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-indigo-50 shadow-xl shadow-indigo-50/40 relative min-w-full md:min-w-[200px]">
                 <p className="text-[9px] md:text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-2 leading-none">SCORE CARRIER</p>
                 <div className="flex items-baseline justify-center md:justify-end gap-1">
                    <h3 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter">{parseFloat(selectedAttempt.score).toFixed(1)}</h3>
                    <span className="text-xl md:text-2xl font-black text-slate-300">%</span>
                 </div>
              </div>
           </div>

           {/* Questions */}
           <div className="space-y-6 md:space-y-8">
              {editedResults.map((r: any, idx: number) => {
                 const isUnapproved = r.manual === true
                 return (
                    <div key={idx} className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all ${isUnapproved ? "bg-amber-50/20 border-amber-100 shadow-sm" : "bg-emerald-50/30 border-emerald-100 shadow-sm"}`}>
                       <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
                          <div className="flex-1 space-y-6 md:space-y-8">
                             <div className="flex items-center gap-4 flex-wrap">
                                <span className={`h-11 md:h-14 w-11 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shrink-0 ${isUnapproved ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-emerald-100 text-emerald-600 shadow-sm'}`}>{idx + 1}</span>
                                <Badge className={`text-[9px] md:text-[10px] font-black uppercase px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl shadow-sm border-none ${isUnapproved ? 'bg-white text-amber-600' : 'bg-white text-emerald-600'}`}>
                                   {isUnapproved ? "Review Required" : "Sanctioned & Archived"}
                                </Badge>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight break-words">{r.question}</h4>
                                <div className="p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-slate-100 space-y-4 md:space-y-5 relative group overflow-hidden shadow-sm">
                                   <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-slate-100 group-hover:bg-indigo-600 transition-colors" />
                                   <div className="flex items-center gap-2">
                                      <RotateCcw className="h-3 w-3 text-slate-400" />
                                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Student Response</p>
                                   </div>
                                   <p className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed italic group-hover:text-slate-900 transition-colors break-words">"{r.studentAnswer || "No Response"}"</p>
                                </div>
                             </div>
                          </div>

                          <div className="w-full lg:w-96 space-y-6 md:space-y-8 shrink-0 bg-white/70 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-50 shadow-sm backdrop-blur-xl">
                             <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between px-1">Evaluation Score <span>MAX: {r.total}</span></label>
                                <Input type="number" max={r.total} min={0} value={r.earned} onChange={(e) => handleInputChange(idx, 'earned', e.target.value)} className="h-14 md:h-16 rounded-xl md:rounded-2xl text-2xl md:text-3xl font-black focus:ring-4 focus:ring-indigo-100 border-2 transition-all" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Constructive Feedback</label>
                                <Textarea placeholder="Share insights..." value={r.feedback || ""} onChange={(e) => handleInputChange(idx, 'feedback', e.target.value)} className="rounded-xl md:rounded-2xl resize-none text-sm md:text-base h-32 md:h-40 focus:ring-4 focus:ring-indigo-100 border-2 leading-relaxed" />
                             </div>
                             <div className="space-y-3 md:space-y-4 pt-4">
                                {isUnapproved ? (
                                   <div className="grid grid-cols-1 gap-3">
                                      <Button onClick={() => approveQuestion(idx)} className="h-14 md:h-16 rounded-xl md:rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 gap-3 shadow-lg shadow-emerald-100 flex items-center justify-center text-base md:text-lg active:scale-95 transition-all">
                                         <Check className="h-5 md:h-6 w-5 md:w-6" /> Sanction
                                      </Button>
                                      <Button onClick={() => handleAIGrade(idx, r)} disabled={aiLoading === idx} variant="outline" className="h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-indigo-100 text-indigo-700 font-black gap-3 hover:bg-indigo-50 transition-all text-base md:text-lg group">
                                         {aiLoading === idx ? <Loader2 className="h-5 md:h-6 w-5 md:w-6 animate-spin" /> : <Sparkles className="h-5 md:h-6 w-5 md:w-6 text-indigo-500 group-hover:scale-110 transition-transform" />} 
                                         AI Proposal
                                      </Button>
                                   </div>
                                ) : (
                                   <div className="space-y-3 md:space-y-4">
                                      <div className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-emerald-200 text-emerald-700 bg-white shadow-inner flex items-center justify-center gap-2 md:gap-3 font-black text-base md:text-lg">
                                         <CheckCircle2 className="h-5 md:h-6 w-5 md:w-6" /> SANCTIONED
                                      </div>
                                      <Button onClick={() => {
                                         setEditedResults(prev => {
                                            const next = [...prev];
                                            next[idx].manual = true;
                                            return next;
                                         });
                                      }} variant="ghost" className="w-full h-10 text-[8px] md:text-[9px] font-black uppercase text-slate-400 hover:text-indigo-600 tracking-widest transition-colors">
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

      {view === 'GRADEBOOK' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
           {/* Course Header Summary */}
           <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 h-full w-32 bg-indigo-600/5 -skew-x-12 translate-x-10" />
              <div className="flex items-center gap-6 relative">
                 <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                    <BookOpen className="h-8 w-8" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{selectedCourse?.name}</h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCourse?.className} • MARK SHEET</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 relative">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Quizzes</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{gradebookData.quizzes.length}</p>
                 </div>
                 <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Students</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{gradebookData.gradebook.length}</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative group w-full md:max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <input 
                    placeholder="Search student by name or ID..." 
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    className="pl-12 h-12 w-full bg-white border-2 border-slate-100 rounded-xl text-sm font-medium focus:border-indigo-500 transition-all shadow-sm outline-none"
                 />
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto"><Button onClick={() => navigateToClassReport(selectedCourse.classId)} variant="outline" className="h-12 rounded-xl border-indigo-100 text-indigo-600 gap-2 font-black text-xs uppercase tracking-widest bg-indigo-50/50 hover:bg-indigo-100 transition-all shadow-sm"><Users className="h-4 w-4" />All Subjects Marksheet</Button><Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-slate-200 gap-2 font-black text-xs uppercase tracking-widest bg-white"><FileText className="h-4 w-4" />Print / Save PDF</Button></div>
           </div>

           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-x-auto print:shadow-none print:border-none">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 backdrop-blur-md">
                       <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest w-[250px] sticky left-0 bg-slate-50/80 z-10 backdrop-blur-md">Student Information</th>
                       {gradebookData.quizzes.map((q, i) => (
                          <th key={q.id} className="px-4 py-6 text-[10px] font-black uppercase text-indigo-500 tracking-tighter text-center">
                             <div className="truncate max-w-[120px] mx-auto" title={q.title}>Q{i+1}: {q.title}</div>
                          </th>
                       ))}
                       <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-900 tracking-widest w-[120px] text-center bg-slate-100/50">Grand Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {gradebookData.gradebook
                      .filter(s => s.name.toLowerCase().includes(submissionSearch.toLowerCase()) || s.manualId?.toLowerCase().includes(submissionSearch.toLowerCase()))
                      .map(student => (
                       <tr key={student.studentId} className="hover:bg-indigo-50/10 transition-all group">
                          <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-all z-10">
                             <div className="flex flex-col">
                                <p className="font-black text-slate-900 uppercase text-xs tracking-tight truncate">{student.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.manualId || student.studentId?.substring(0,8)}</p>
                             </div>
                          </td>
                          {gradebookData.quizzes.map(quiz => {
                             const score = student.quizScores[quiz.id]
                             return (
                                <td key={quiz.id} className="px-4 py-4 text-center">
                                   {score !== null ? (
                                      <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-slate-100 shadow-sm min-w-[60px]">
                                         <p className={`text-xs font-black ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                            {score}%
                                         </p>
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-bold text-slate-300">N/A</span>
                                   )}
                                </td>
                             )
                          })}
                          <td className="px-6 py-4 text-center bg-indigo-50/30">
                             <div className={`text-base font-black ${student.average >= 70 ? 'text-indigo-600' : student.average >= 50 ? 'text-slate-700' : 'text-rose-700'}`}>
                                {student.average}%
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
      {view === 'CLASS_REPORT' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500 max-w-full">
           {/* Class Header Summary */}
           <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 h-full w-32 bg-slate-900/5 -skew-x-12 translate-x-10" />
              <div className="flex items-center gap-6 relative">
                 <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-100 shrink-0">
                    <ClassIcon className="h-8 w-8" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Master Report</p>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{classReportData.className}</h2>
                 </div>
              </div>
              <div className="flex items-center gap-3 relative">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subjects</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{classReportData.courses.length}</p>
                 </div>
                 <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Students</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{classReportData.students.length}</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative group w-full md:max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <input 
                    placeholder="Filter students..." 
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    className="pl-12 h-12 w-full bg-white border-2 border-slate-100 rounded-xl text-sm font-medium focus:border-indigo-500 transition-all shadow-sm outline-none"
                 />
              </div>
              <Button 
                onClick={() => window.print()} 
                variant="outline" 
                className="w-full md:w-auto h-12 rounded-xl border-slate-200 gap-2 font-black text-xs uppercase tracking-widest bg-white"
              >
                  <FileText className="h-4 w-4" />
                  Print Master Sheet
              </Button>
           </div>

           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-x-auto print:shadow-none print:border-none">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 backdrop-blur-md">
                       <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest w-[250px] sticky left-0 bg-slate-50/80 z-10 backdrop-blur-md">Student Information</th>
                       {classReportData.courses.map((courseName) => (
                          <th key={courseName} className="px-4 py-6 text-[10px] font-black uppercase text-indigo-500 tracking-tighter text-center">
                             <div className="truncate max-w-[150px] mx-auto" title={courseName}>{courseName}</div>
                          </th>
                       ))}
                       <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-900 tracking-widest w-[120px] text-center bg-slate-100/50">Overall Avg</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {classReportData.students
                      .filter(s => s.name.toLowerCase().includes(submissionSearch.toLowerCase()))
                      .map(student => (
                       <tr key={student.studentId} className="hover:bg-indigo-50/10 transition-all group">
                          <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-all z-10">
                             <div className="flex flex-col">
                                <p className="font-black text-slate-900 uppercase text-xs tracking-tight truncate">{student.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.manualId || student.studentId?.substring(0,8)}</p>
                             </div>
                          </td>
                          {classReportData.courses.map(courseName => {
                             const score = student.courseGrades[courseName]
                             return (
                                <td key={courseName} className="px-4 py-4 text-center">
                                   {score !== null ? (
                                      <div className={`inline-flex items-center justify-center p-2 rounded-lg border shadow-sm min-w-[60px] ${score >= 70 ? 'bg-emerald-50 border-emerald-100' : score >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                                         <p className={`text-xs font-black ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                            {score}%
                                         </p>
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-bold text-slate-300">N/A</span>
                                   )}
                                </td>
                             )
                          })}
                          <td className="px-6 py-4 text-center bg-indigo-50/30">
                             <div className={`text-base font-black ${student.overallAverage >= 70 ? 'text-indigo-600' : student.overallAverage >= 50 ? 'text-slate-700' : 'text-rose-700'}`}>
                                {student.overallAverage}%
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  )
}


