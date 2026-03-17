"use client"

import * as React from "react"
import {
  BookOpen, ChevronLeft, ChevronDown, ChevronRight, ChevronRightCircle,
  Clock, FileText, CheckCircle2, Video, Zap, ArrowRight,
  X, FileDown, BookOpenCheck, HelpCircle, GraduationCap,
  Layers, AlertCircle, Trophy, RotateCcw, Check, Eye,
  Sparkles, MessageSquare, User, Plus, Trash2, Save, Upload,
  Download, CheckSquare, ArrowLeftRight, PenLine, AlignLeft,
  GripVertical, Star, Shuffle, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCourseStructure, getQuizWithQuestions } from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────
type Mode = "overview" | "lesson" | "quiz"

// ─── Helpers ────────────────────────────────────────────────────────────────
function getSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0
  const a = s1.toLowerCase().replace(/\s+/g, " ").trim()
  const b = s2.toLowerCase().replace(/\s+/g, " ").trim()
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>()
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2))
    }
    return bigrams
  }

  const aBigrams = getBigrams(a)
  const bBigrams = getBigrams(b)
  let intersection = 0
  aBigrams.forEach(bg => { if (bBigrams.has(bg)) intersection++ })
  return (2 * intersection) / (aBigrams.size + bBigrams.size)
}

function getQualitativeGrade(score: number) {
  if (score === 100) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20", message: "Mashallah! A perfect score!" }
  if (score >= 90) return { label: "Outstanding", color: "text-emerald-400", bg: "bg-emerald-500/20", message: "Outstanding work! Very close to perfection." }
  if (score >= 80) return { label: "Very Good", color: "text-blue-400", bg: "bg-blue-500/20", message: "Great job! Keep pushing higher." }
  if (score >= 70) return { label: "Good", color: "text-indigo-400", bg: "bg-indigo-500/20", message: "Well done! You passed this assessment." }
  if (score >= 60) return { label: "Average", color: "text-amber-400", bg: "bg-amber-500/20", message: "Good effort! You are getting there." }
  return { label: "Poor", color: "text-red-400", bg: "bg-red-500/20", message: "Don't give up! Review the material and try again." }
}

function getAdvice(score: number, passed: boolean) {
  if (score === 100) return "You have mastered this topic! You are ready to move on to more advanced lessons. Keep up this momentum!"
  if (passed) return "Congratulations on passing! Review the questions you missed to solidify your understanding and reach a perfect score next time."
  return "It happens to the best of us. Take a short break, review the lesson materials one more time, and try again. You've got this!"
}

// ─── Matching Drag-and-Drop Component ────────────────────────────────────────
function MatchingQuestion({ options, value, onChange }: {
  options: any[]
  value: Record<string, string>   // { promptId: answerId }
  onChange: (v: Record<string, string>) => void
}) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  // Shuffle answers once on mount
  const shuffled = React.useMemo(() => {
    const copy = [...options]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [options.map((o: any) => o.id).join(",")])

  const assigned = new Set(Object.values(value)) // answer IDs already placed

  const handleDrop = (promptId: string) => {
    if (!draggedId) return
    // Remove this answer from any previous prompt
    const updated = { ...value }
    Object.keys(updated).forEach(k => { if (updated[k] === draggedId) delete updated[k] })
    updated[promptId] = draggedId
    onChange(updated)
    setDraggedId(null)
    setDragOver(null)
  }

  const removeMatch = (promptId: string) => {
    const updated = { ...value }
    delete updated[promptId]
    onChange(updated)
  }

  const getAnswerText = (answerId: string) =>
    options.find((o: any) => o.id === answerId)?.text || ""

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 font-medium">
        Drag answers from the right and drop them onto the matching prompt on the left.
      </p>
      <div className="grid grid-cols-2 gap-6">
        {/* Left — Prompts (drop zones) */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prompts</p>
          {options.map((opt: any) => {
            const matchedId = value[opt.id]
            const isOver = dragOver === opt.id
            return (
              <div
                key={opt.id}
                onDragOver={e => { e.preventDefault(); setDragOver(opt.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(opt.id)}
                className={cn(
                  "rounded-2xl border-2 p-3 min-h-[56px] transition-all",
                  isOver ? "border-indigo-400 bg-indigo-50 scale-[1.01]" :
                  matchedId ? "border-emerald-300 bg-emerald-50" :
                  "border-dashed border-slate-200 bg-slate-50/50"
                )}
              >
                <p className="text-xs font-semibold text-slate-600 mb-2">{opt.matchKey}</p>
                {matchedId ? (
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-emerald-200">
                    <span className="text-xs font-semibold text-emerald-700 flex-1">{getAnswerText(matchedId)}</span>
                    <button onClick={() => removeMatch(opt.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 font-medium">{isOver ? "Release to match" : "Drop answer here"}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right — Draggable Answers */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answers</p>
          {shuffled.map((opt: any) => {
            const isUsed = assigned.has(opt.id)
            const isDragging = draggedId === opt.id
            return (
              <div
                key={opt.id}
                draggable={!isUsed}
                onDragStart={() => setDraggedId(opt.id)}
                onDragEnd={() => { setDraggedId(null); setDragOver(null) }}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all select-none",
                  isUsed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-400 opacity-50 cursor-not-allowed"
                    : isDragging
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xl scale-105 cursor-grabbing"
                    : "border-slate-200 bg-white text-slate-700 cursor-grab hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]"
                )}
              >
                {isUsed ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {opt.text}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-slate-300">⠿</span> {opt.text}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export default function CoursePreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useCurrentUser()
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [mode, setMode] = React.useState<Mode>("overview")
  const [activeLesson, setActiveLesson] = React.useState<any>(null)
  const [activeLessonTab, setActiveLessonTab] = React.useState("body")
  const [activeQuiz, setActiveQuiz] = React.useState<any>(null)
  const [quizLoading, setQuizLoading] = React.useState(false)
  const [expandedSectionId, setExpandedSectionId] = React.useState<string | null>(null)

  // Quiz-taking state
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [results, setResults] = React.useState<any[]>([])
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [currentQ, setCurrentQ] = React.useState(0)
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
  const [quizTab, setQuizTab] = React.useState<string>("questions")
  const timerRef = React.useRef<any>(null)

  React.useEffect(() => {
    async function load() {
      const data = await getCourseStructure(id as string)
      if (data) setCourse(data)
      setLoading(false)
    }
    load()
  }, [id])

  // Timer countdown
  React.useEffect(() => {
    if (mode === "quiz" && activeQuiz?.timeLimit && !submitted) {
      setTimeLeft(activeQuiz.timeLimit * 60)
    }
  }, [mode, activeQuiz, submitted])

  React.useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { handleSubmitQuiz(); return }
    timerRef.current = setTimeout(() => setTimeLeft(t => (t ?? 1) - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [timeLeft])

  const toggleSection = (sid: string) =>
    setExpandedSectionId(prev => prev === sid ? null : sid)

  const openLesson = (lesson: any) => {
    setActiveLesson(lesson)
    setActiveLessonTab("body")
    setMode("lesson")
  }

  const openQuiz = async (quiz: any) => {
    setQuizLoading(true)
    const data = await getQuizWithQuestions(quiz.id)
    setActiveQuiz(data)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setCurrentQ(0)
    setTimeLeft(null)
    setMode("quiz")
    setQuizLoading(false)
  }

  const setAnswer = (qid: string, value: any) =>
    setAnswers(prev => ({ ...prev, [qid]: value }))

  const handleSubmitQuiz = () => {
    clearTimeout(timerRef.current)
    if (!activeQuiz?.questions) return
    let earned = 0
    let total = 0
    const feedback: any[] = []

    for (const q of activeQuiz.questions) {
      const ans = answers[q.id]
      let qCorrect = false
      let qEarned = 0
      let qTotal = q.points

      if (q.type === "MATCHING") {
        qTotal = 0
        const matches: any[] = []
        q.options.forEach((opt: any) => {
          const pt = opt.points || 0
          qTotal += pt
          const studentChoice = ans ? ans[opt.id] : null
          const isMatchCorrect = studentChoice === opt.id
          if (isMatchCorrect) qEarned += pt
          matches.push({ prompt: opt.matchKey, answer: opt.text, studentAnswer: opt.options?.find((o:any)=>o.id===studentChoice)?.text || (studentChoice ? "Matched" : "None"), isCorrect: isMatchCorrect })
        })
        qCorrect = qEarned === qTotal
        feedback.push({ ...q, isCorrect: qCorrect, earned: qEarned, total: qTotal, matches })
      } else {
        if (q.type === "MCQ") {
          const correct = q.options.find((o: any) => o.isCorrect)
          qCorrect = !!(ans && ans === correct?.id)
          feedback.push({ ...q, isCorrect: qCorrect, studentAnswer: q.options.find((o:any)=>o.id===ans)?.text || "No answer", correctAnswer: correct?.text })
        } else if (q.type === "TRUE_FALSE") {
          qCorrect = !!(ans && ans.toLowerCase() === q.correctAnswer?.toLowerCase())
          feedback.push({ ...q, isCorrect: qCorrect, studentAnswer: ans || "No answer", correctAnswer: q.correctAnswer })
        } else if (q.type === "FILL_BLANK") {
          qCorrect = !!(ans && ans.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase())
          feedback.push({ ...q, isCorrect: qCorrect, studentAnswer: ans || "No answer", correctAnswer: q.correctAnswer })
        } else if (q.type === "SHORT_ANSWER") {
          const similarity = getSimilarity(ans || "", q.correctAnswer || "")
          qCorrect = similarity >= 0.7
          feedback.push({ ...q, isCorrect: qCorrect, studentAnswer: ans || "No answer", correctAnswer: q.correctAnswer, similarity: Math.round(similarity * 100) })
        } else {
          feedback.push({ ...q, isCorrect: false, studentAnswer: ans || "No answer", manual: true })
        }
        if (qCorrect) qEarned = q.points
      }
      earned += qEarned
      total += qTotal
    }
    setResults(feedback)
    setScore(total > 0 ? Math.round((earned / total) * 100) : 0)
    setSubmitted(true)
    setTimeLeft(null)
  }

  const retakeQuiz = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setResults([])
    setShowFeedback(false)
    setCurrentQ(0)
    setTimeLeft(activeQuiz?.timeLimit ? activeQuiz.timeLimit * 60 : null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading...</p>
      </div>
    </div>
  )

  const totalLessons = course?.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((a: number, s: any) => a + (s.quizzes?.length || 0), 0) || 0
  const totalDuration = course?.sections?.reduce((a: number, s: any) =>
    a + (s.lessons?.reduce((b: number, l: any) => b + (l.duration || 0), 0) || 0), 0) || 0

  const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`

  /* ══════════════════════════════════════════════
     QUIZ TAKING MODE — FULL SCREEN
     ══════════════════════════════════════════════ */
  if (mode === "quiz") {
    if (quizLoading) return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Loading Quiz Suite...</p>
        </div>
      </div>
    )

    const questions = activeQuiz?.questions || []
    const passed = score >= (activeQuiz?.passingScore || 70)
    const isLast = currentQ === questions.length - 1
    const q = questions[currentQ]

    return (
      <div className="fixed inset-0 z-[100] bg-[#FDFDFD] flex flex-col">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center px-4 md:px-10 gap-4 shrink-0 z-[101]">
          <Button variant="ghost" size="icon" onClick={() => setMode("overview")} className="h-11 w-11 rounded-2xl text-slate-400 hover:text-slate-700 shrink-0 bg-slate-50">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm md:text-base font-black text-slate-900 leading-none truncate max-w-[200px] md:max-w-md">{activeQuiz?.title}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 leading-none">Assessment Suite (Preview)</p>
          </div>
          
          <Tabs value={quizTab} onValueChange={setQuizTab} className="hidden md:flex bg-slate-100 p-1 rounded-xl">
             <TabsList className="bg-transparent gap-1">
                <TabsTrigger value="questions" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">Questions</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all">Attempts</TabsTrigger>
                <TabsTrigger value="performance" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">Stats</TabsTrigger>
             </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {timeLeft !== null && !submitted && (
              <div className={cn("hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest", timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200")}>
                <Clock className="h-4 w-4" /> {fmtTime(timeLeft)}
              </div>
            )}
            <Badge className="bg-slate-900 text-white border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{currentQ + 1} / {questions.length}</Badge>
          </div>
        </header>

        {/* Mobile Tabs Wrapper */}
        <div className="md:hidden bg-white border-b border-slate-50 p-2 overflow-x-auto shrink-0 z-[101]">
          <div className="flex gap-2 min-w-max">
            {['questions', 'history', 'performance'].map((t) => (
              <button
                key={t}
                onClick={() => setQuizTab(t)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  quizTab === t ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#FDFDFD]">
          <div className="max-w-5xl mx-auto p-4 md:p-10 pb-32">
            <Tabs value={quizTab} className="w-full">
              <TabsContent value="questions" className="mt-0 outline-none">
                {submitted ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-slate-950 rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
                      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                         <div className={cn("h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl transition-all", passed ? "bg-emerald-500 shadow-emerald-500/20 rotate-3" : "bg-red-500 shadow-red-500/20 -rotate-3")}>
                            {passed ? <Trophy className="h-16 w-16 md:h-20 md:w-20 text-white" /> : <AlertCircle className="h-16 w-16 md:h-20 md:w-20 text-white" />}
                         </div>
                         <div className="text-center md:text-left space-y-4">
                            <div>
                               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[.3em] mb-2 px-1 border-l-2 border-indigo-500/50">Performance Summary</p>
                               <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{score}<span className="text-indigo-400/50">%</span></h2>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                               <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl", passed ? "bg-emerald-500 text-white" : "bg-red-50 text-red-600 border border-red-100")}>
                                {passed ? "Passed" : "Needs Review"}
                               </Badge>
                               <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                                  {getQualitativeGrade(score).label}
                               </Badge>
                             </div>
                             <p className="text-white/40 text-[11px] font-medium max-w-md leading-relaxed">
                                {score >= 90 ? "Outstanding performance! You've mastered this topic perfectly." : 
                                 score >= 70 ? "Well done! You have a solid grasp of the material." : 
                                 "Don't discourage yourself. Learning is a journey, try reviewing the lesson and attempt again."}
                             </p>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2" onClick={retakeQuiz}>
                                  <RotateCcw className="h-4 w-4" /> Retake
                               </Button>
                            </div>
                         </div>
                         <div className="hidden lg:flex flex-1 justify-end">
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4 min-w-[200px]">
                               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mastery Level</p>
                               <Progress value={score} className="h-3 rounded-full bg-white/5" />
                               <p className="text-[11px] font-bold text-white/70 italic leading-relaxed">"{getAdvice(score, passed)}"</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><BookOpenCheck className="h-5 w-5" /></div>
                            Insight Review
                         </h3>
                         <Badge variant="outline" className="rounded-full px-4 text-[10px] font-bold text-slate-400 border-slate-100">Feedback Breakdown</Badge>
                      </div>

                      <div className="grid gap-4">
                        {results.map((res, idx) => (
                          <div key={idx} className={cn("group rounded-[2rem] border-2 transition-all p-6 md:p-10", res.isCorrect ? "bg-white border-emerald-50 hover:border-emerald-100" : "bg-white border-red-50 hover:border-red-100")}>
                             <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                                <div className="space-y-6 flex-1">
                                   <div className="flex items-center gap-4">
                                      <span className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-900">{idx + 1}</span>
                                      <Badge className={cn("text-[9px] font-black uppercase px-3 py-1.5 rounded-lg", res.isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                                        {res.isCorrect ? "Precision Matched" : "Review Needed"}
                                      </Badge>
                                      <span className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">{res.earned} / {res.total} PTS</span>
                                   </div>
                                   <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-[1.2]">{res.question}</h4>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Your Answer</p>
                                         <p className={cn("text-sm font-bold", res.isCorrect ? "text-slate-900" : "text-red-600")}>{typeof res.studentAnswer === 'string' ? res.studentAnswer || "No Response" : "Matched Item"}</p>
                                      </div>
                                      {!res.isCorrect && !res.manual && (
                                        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                                           <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Valid Solution</p>
                                           <p className="text-sm font-bold text-indigo-700">{res.correctAnswer}</p>
                                        </div>
                                      )}
                                   </div>
                                </div>
                                <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-3xl flex items-center justify-center shrink-0 motion-safe:animate-in motion-safe:zoom-in duration-1000", res.isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                                   {res.isCorrect ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-8 py-4 md:py-10">
                    <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border-2 border-slate-50 p-6 md:p-12 space-y-10">
                      <div className="space-y-6 leading-none">
                        <div className="flex items-center gap-3">
                          <span className="h-10 w-10 flex items-center justify-center bg-indigo-600 rounded-xl text-white text-xs font-black shadow-lg shadow-indigo-200">{currentQ + 1}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em]">Intellectual Challenge</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{q?.question || "No question text defined."}</h2>
                      </div>



                      <div className="space-y-4">
                        {q?.type === "MCQ" && (
                          <div className="grid gap-3">
                            {q.options.map((opt: any, oi: number) => {
                              const isSelected = answers[q.id] === opt.id
                              return (
                                <button key={opt.id} onClick={() => setAnswer(q.id, opt.id)} className={cn("w-full group flex items-center gap-5 p-5 md:p-7 rounded-[2rem] border-2 text-left transition-all duration-300", isSelected ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50 translate-x-2" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50")}>
                                  <div className={cn("h-8 w-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-500", isSelected ? "bg-indigo-600 border-indigo-600 rotate-12" : "border-slate-200 group-hover:border-indigo-300")}>
                                    {isSelected ? <Check className="h-4 w-4 text-white" /> : <span className="text-[10px] font-black text-slate-200 group-hover:text-indigo-400">{String.fromCharCode(65 + oi)}</span>}
                                  </div>
                                  <span className={cn("text-lg font-bold transition-colors", isSelected ? "text-indigo-900" : "text-slate-700")}>{opt.text}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {q?.type === "TRUE_FALSE" && (
                          <div className="grid grid-cols-2 gap-6 h-32 md:h-48">
                            {["True", "False"].map(val => {
                              const isSelected = answers[q.id] === val
                              const isTrue = val === "True"
                              return (
                                <button
                                  key={val}
                                  onClick={() => setAnswer(q.id, val)}
                                  className={cn(
                                    "rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:scale-[1.02]",
                                    isSelected 
                                      ? (isTrue ? "bg-emerald-600 border-emerald-600 text-white shadow-2xl shadow-emerald-200" : "bg-red-600 border-red-600 text-white shadow-2xl shadow-red-200")
                                      : "bg-white border-slate-100 text-slate-400"
                                  )}
                                >
                                  {isTrue ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
                                  <span className="text-xl font-black uppercase tracking-widest">{val}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {q?.type === "MATCHING" && (
                           <div className="py-4">
                              <MatchingQuestion options={q.options} value={(answers[q.id] as Record<string, string>) || {}} onChange={v => setAnswer(q.id, v)} />
                           </div>
                        )}

                        {(q?.type === "FILL_BLANK" || q?.type === "SHORT_ANSWER" || q?.type === "ESSAY") && (
                          <div className="space-y-4">
                             <div className="relative group">
                                <textarea
                                  value={(answers[q.id] as string) || ""}
                                  onChange={e => setAnswer(q.id, e.target.value)}
                                  placeholder="Formulate your intellectual response..."
                                  className="w-full min-h-[200px] p-8 rounded-[2.5rem] border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:shadow-2xl focus:shadow-indigo-100/50 outline-none text-xl font-medium transition-all duration-500 resize-none"
                                />
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-6">
                        {currentQ > 0 && (
                          <Button variant="ghost" className="h-16 px-10 rounded-[20px] text-slate-400 font-bold hover:bg-slate-50 gap-3" onClick={() => setCurrentQ(q => q - 1)}>
                            <ArrowRight className="h-4 w-4 rotate-180" /> Back
                          </Button>
                        )}
                        <Button
                          onClick={isLast ? handleSubmitQuiz : () => setCurrentQ(q => q + 1)}
                          className={cn(
                            "flex-1 h-16 px-12 rounded-[20px] font-black uppercase tracking-[.2em] text-xs gap-4 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]",
                            isLast ? "bg-emerald-600 shadow-emerald-100" : "bg-indigo-600 shadow-indigo-100"
                          )}
                        >
                          {isLast ? "Finalize Intellect" : "Continue Journey"} <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0 outline-none space-y-6">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-slate-900">Your Journey Path (Preview)</h2>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">3 Attempts Recorded (Mock)</Badge>
                 </div>

                 <div className="grid gap-4">
                    {[
                      { id: '1', score: 92, passed: true, date: '2024-03-15T10:00:00Z', earned: 46, total: 50, time: 420 },
                      { id: '2', score: 78, passed: true, date: '2024-03-14T14:30:00Z', earned: 39, total: 50, time: 580 },
                      { id: '3', score: 45, passed: false, date: '2024-03-13T09:15:00Z', earned: 22, total: 50, time: 310 }
                    ].map((attempt) => (
                      <div
                        key={attempt.id}
                        className="group bg-white rounded-3xl border-2 border-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer"
                      >
                         <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500", attempt.passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                               {attempt.passed ? <Trophy className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                            </div>
                            <div>
                               <h4 className="text-2xl font-black text-slate-900">{attempt.score}%</h4>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{format(new Date(attempt.date), 'PPP @ p')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Points</p>
                               <p className="text-xs font-black text-slate-600">{attempt.earned} / {attempt.total}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time</p>
                               <p className="text-xs font-black text-slate-600">{Math.floor(attempt.time / 60)}m {attempt.time % 60}s</p>
                            </div>
                            <Button variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all ml-auto">
                               <Eye className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>
                    ))}
                    <div className="p-6 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Historical tracking mockup for preview mode
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-0 outline-none space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Best Score", val: "92%", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Average Score", val: "84%", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Success Rate", val: "100%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Total Sessions", val: 3, icon: RotateCcw, color: "text-slate-600", bg: "bg-slate-50" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
                         <div className={cn("absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700", stat.color)}><stat.icon className="h-24 w-24" /></div>
                         <div className="relative z-10 space-y-4">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}><stat.icon className="h-6 w-6" /></div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[.2em]">{stat.label}</p>
                               <h4 className="text-3xl font-black text-slate-900 mt-1">{stat.val}</h4>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-10">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-slate-900 leading-none">Progression Analytics (Preview)</h3>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mock Data</span></div>
                       </div>
                    </div>
                    <div className="h-[300px] w-full mt-10">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:70}, {v:85}, {v:92}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" hide />
                             <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                             <Area type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     LESSON VIEW — FULL SCREEN
     ══════════════════════════════════════════════ */
  if (mode === "lesson") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex flex-col">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMode("overview")} className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{activeLesson.title}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{course?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMode("overview")} className="text-slate-500 gap-1.5 text-xs font-semibold hover:bg-slate-50 rounded-xl h-9 px-4">
            <X className="h-3.5 w-3.5" /> Close
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            {/* Objectives */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-indigo-200" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Lesson Objectives</h3>
                </div>
                <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                  {activeLesson.objectives || "No objectives defined for this lesson."}
                </p>
              </div>
            </div>

            {/* Tab Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center border-b border-slate-100">
                {[
                  { key: "body", label: "Lesson Body", icon: BookOpen },
                  { key: "materials", label: "Materials", icon: FileText },
                  { key: "video", label: "Video", icon: Video },
                  { key: "qa", label: "Discussions", icon: MessageSquare },
                  { key: "ai", label: "AI Tutor", icon: Sparkles },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveLessonTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                      activeLessonTab === tab.key
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-8">
                {activeLessonTab === "body" && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900">{activeLesson.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /><span>{activeLesson.duration || 0} min</span></div>
                    </div>
                    <Separator />
                    <div className="prose prose-slate max-w-none text-slate-600 leading-[1.9] whitespace-pre-wrap text-[15px]">
                      {activeLesson.content || "No content yet."}
                    </div>
                  </div>
                )}
                {activeLessonTab === "materials" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Reading Materials</h3>
                    {activeLesson.attachmentUrl ? (
                      <a href={activeLesson.attachmentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-amber-50 hover:bg-amber-100/70 rounded-2xl border border-amber-100 transition-all group">
                        <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                          <FileDown className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">Lesson PDF Document</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="text-sm font-semibold text-slate-400">No materials attached</p>
                      </div>
                    )}
                  </div>
                )}
                {activeLessonTab === "video" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Video Lesson</h3>
                    {activeLesson.videoUrl ? (
                      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video shadow-xl">
                        <iframe
                          src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("vimeo.com/", "player.vimeo.com/video/")}
                          className="w-full h-full" allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl text-slate-300 border border-dashed border-slate-200">
                        <Video className="h-12 w-12 mb-4" />
                        <p className="text-sm font-semibold text-slate-400">No video available</p>
                      </div>
                    )}
                  </div>
                )}
                {activeLessonTab === "qa" && (
                   <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="h-20 w-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-200 border-2 border-dashed border-indigo-100">
                        <MessageSquare className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-black text-slate-900">Module Discussions</h3>
                         <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">In the live environment, students can engage in deep intellectual discourse here. This is a preview of the interface.</p>
                      </div>
                      <Button variant="outline" className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-50 transition-all">Preview Conversation</Button>
                   </div>
                )}
                {activeLessonTab === "ai" && (
                   <div className="space-y-8 animate-in fade-in duration-500 text-left">
                      <div className="flex items-center justify-between">
                         <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                               <Sparkles className="h-5 w-5 text-indigo-500" /> AI Lesson Assistant
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Personalized guidance and semantic summaries</p>
                         </div>
                         <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active Intelligence</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="border-none shadow-sm bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all p-8 rounded-3xl group cursor-pointer border-2 border-transparent hover:border-indigo-100">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FileText className="h-6 w-6" /></div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Lesson Executive Summary</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Extract the most critical insights and core concepts from this lesson into a high-density summary.</p>
                            <Button variant="ghost" className="mt-6 p-0 h-auto text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-transparent flex items-center gap-2 group/btn">
                               Generate Now <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                         </Card>

                         <Card className="border-none shadow-sm bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all p-8 rounded-3xl group border-2 border-transparent hover:border-amber-100">
                            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><HelpCircle className="h-6 w-6" /></div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Semantic Concept Explainer</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Struggling with a specific concept? Describe what you don&apos;t understand and get a personalized explanation.</p>
                            <div className="mt-6 flex gap-2">
                               <input type="text" placeholder="Explain the..." className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-amber-400 transition-all" />
                               <Button size="icon" className="h-8 w-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200"><ArrowRight className="h-4 w-4" /></Button>
                            </div>
                         </Card>
                      </div>

                      <div className="bg-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:rotate-6 transition-transform">
                               <Sparkles className="h-10 w-10 text-indigo-300" />
                            </div>
                            <div className="space-y-4">
                               <h4 className="text-xl font-black tracking-tight">AI Status: Waiting for Inquiry</h4>
                               <p className="text-sm text-white/50 leading-relaxed font-medium">Your personal AI tutor is ready to assist. Select an option above to generate a summary or ask for an explanation of complex topics.</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Lesson Navigation Footer ── */}
        <div className="h-20 bg-white border-t border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 z-50">
           {(() => {
             const courseItems = course?.sections?.flatMap((s: any) => {
                const lessons = (s.lessons || []).map((l: any) => ({ ...l, type: "lesson" as const, sectionId: s.id }));
                const quizzes = (s.quizzes || []).map((q: any) => ({ ...q, type: "quiz" as const, sectionId: s.id }));
                return [...lessons, ...quizzes].sort((a, b) => (a.order || 0) - (b.order || 0));
             }) || []

             const currentIndex = courseItems.findIndex((ci: any) => ci.id === activeLesson?.id)
             const prevItem = currentIndex > 0 ? courseItems[currentIndex - 1] : null
             const nextItem = currentIndex < courseItems.length - 1 ? courseItems[currentIndex + 1] : null

             return (
               <>
                 <Button
                   variant="outline"
                   disabled={!prevItem}
                   onClick={() => {
                     if (prevItem) {
                       if (prevItem.type === "lesson") { openLesson(prevItem) }
                       else { openQuiz(prevItem) }
                     }
                   }}
                   className="rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest gap-2 border-slate-200 text-slate-600 disabled:opacity-30"
                 >
                   <ChevronLeft className="h-4 w-4" /> Previous
                 </Button>

                 <div className="hidden md:flex flex-col items-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Lesson Progress</p>
                    <div className="flex items-center gap-1 mt-1">
                       {courseItems.map((item: any, idx: number) => (
                         <div
                           key={idx}
                           className={cn(
                             "h-1.5 w-6 rounded-full transition-all",
                             idx === currentIndex ? "bg-indigo-600" : "bg-slate-100"
                           )}
                         />
                       ))}
                    </div>
                 </div>

                 <Button
                   disabled={!nextItem}
                   onClick={() => {
                     if (nextItem) {
                       if (nextItem.type === "lesson") { openLesson(nextItem) }
                       else { openQuiz(nextItem) }
                     }
                   }}
                   className="rounded-xl h-11 px-8 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                 >
                   Next {nextItem?.type === "quiz" ? "Quiz" : "Lesson"} <ChevronRight className="h-4 w-4" />
                 </Button>
               </>
             )
           })()}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     COURSE OVERVIEW PAGE
     ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Hero Section */}
      <div className="relative pt-4 pb-12 px-6 md:px-10 overflow-hidden">
        {/* Background Layer: Deep modern gradient with mesh-like texture */}
        <div className="absolute inset-0 bg-[#0F172A]">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,#4f46e520,transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_100%,#6366f110,transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="text-white/30 hover:text-white hover:bg-white/5 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all group/back"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" /> Return to Builder
            </Button>
            <Badge className="bg-amber-400 text-slate-950 border-none px-3 py-1.5 text-[9px] font-black uppercase tracking-widest animate-pulse shadow-xl shadow-amber-400/10">
              Admin Preview Mode
            </Badge>
          </div>
 
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Course Info */}
            <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0F172A] bg-slate-800 flex items-center justify-center overflow-hidden">
                       <User className="h-4 w-4 text-slate-500" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">+124 students enrolled</span>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <Badge className="bg-amber-400 text-slate-950 border-none px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl shadow-amber-400/10">
                  <Star className="h-3 w-3 fill-slate-950" /> 0 XP
                </Badge>
                <Badge className="bg-white/5 text-white/40 border border-white/10 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                  {course?.category || "Core Module"}
                </Badge>
              </div>
 
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {course?.name}
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed font-medium">
                  {course?.description || "Master the concepts through our structured curriculum and interactive assessments."}
                </p>
              </div>
            </div>
 
            {/* Right Column: Progress & Stats Widget (Mocked for Admin) */}
            <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-6 duration-700">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-12 -mt-12" />
 
                  <div className="flex items-center justify-between relative z-10">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-3">Course Completion</p>
                       <h3 className="text-5xl font-black text-white">0<span className="text-indigo-400 text-3xl">%</span></h3>
                     </div>
                     <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                        <Trophy className="h-7 w-7 text-white" />
                     </div>
                  </div>
 
                   <div className="space-y-3 relative z-10">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                       <div className="h-full bg-indigo-500 rounded-full w-0 transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                      <span>0 Modules Done</span>
                      <span>{totalLessons} Lessons total</span>
                    </div>
                  </div>
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-all cursor-default group/stat">
                    <Layers className="h-4 w-4 text-indigo-400 mb-1 group-hover/stat:scale-110 transition-transform" />
                    <p className="text-xl font-black text-white">{course?.sections?.length || 0}</p>
                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Chapters</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-all cursor-default group/stat">
                    <Zap className="h-4 w-4 text-amber-400 mb-1 group-hover/stat:scale-110 transition-transform" />
                    <p className="text-xl font-black text-white">{totalQuizzes}</p>
                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Quizzes</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 mt-16 relative z-20 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* ── Curriculum Section ── */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-12">
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200"><BookOpen className="h-6 w-6" /></div>
                      Academic Path
                   </h2>
                   <div className="hidden sm:flex items-center gap-3">
                      <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-black text-slate-400 border-slate-100 uppercase tracking-widest">Digital Learning Environment</Badge>
                   </div>
                </div>

               <div className="space-y-6">
                {course?.sections?.map((section: any, idx: number) => {
                  const isExpanded = expandedSectionId === section.id
                  const sectionTotalItems = (section.lessons?.length || 0) + (section.quizzes?.length || 0)

                  return (
                    <div key={section.id} className={cn("group bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden", isExpanded ? "border-indigo-100 shadow-[0_12px_40px_-12px_rgba(79,70,229,0.1)]" : "border-slate-100 hover:border-slate-200 shadow-sm")}>
                      <button 
                        onClick={() => toggleSection(section.id)} 
                        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-slate-50/30 transition-colors text-left relative"
                      >
                        {/* Section highlight for expanded state */}
                        {isExpanded && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />}

                        <div className="flex items-center gap-8">
                          <div className={cn("h-14 w-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all duration-500", isExpanded ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-400")}>
                             <span className="text-[7px] font-black uppercase opacity-60">Module</span>
                             <span className="text-lg font-black leading-none">{idx + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{section.title}</h3>
                            <div className="flex items-center gap-2.5 mt-2">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{sectionTotalItems} items</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="text-[9px] font-bold text-indigo-500/60 uppercase tracking-widest leading-none">0% complete</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={cn("h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center transition-all duration-500", isExpanded ? "bg-indigo-50 text-indigo-600 rotate-180" : "bg-white text-slate-300")}>
                             <ChevronDown className="h-4 w-4" />
                           </div>
                        </div>
                      </button>

                      <div className={cn("transition-all duration-700 ease-in-out overflow-hidden bg-slate-50/30", isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0")}>
                        <div className="p-4 md:p-8 space-y-3">
                          {(() => {
                            const items = [
                              ...(section.lessons || []).map((l: any) => ({ ...l, type: "lesson" as const })),
                              ...(section.quizzes || []).map((q: any) => ({ ...q, type: "quiz" as const }))
                            ].sort((a, b) => (a.order || 0) - (b.order || 0))

                            return items.map((item: any, iIdx: number) => {
                              if (item.type === "lesson") {
                                return (
                                  <div key={item.id} onClick={() => openLesson(item)} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 cursor-pointer shadow-sm transition-all duration-300">
                                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-500">
                                      {iIdx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold truncate text-slate-700 transition-colors duration-300">{item.title}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40 text-indigo-400">Module Content</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-indigo-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                  </div>
                                )
                              } else {
                                return (
                                  <div key={item.id} onClick={() => openQuiz(item)} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-50/50 cursor-pointer shadow-sm transition-all duration-300">
                                    <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-500">
                                      <Zap className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold truncate text-slate-700 transition-colors duration-300">{item.title}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40 text-amber-500">Assessment</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-amber-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                  </div>
                                )
                              }
                            })
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-[0_40px_120px_-30px_rgba(79,70,229,0.15)] rounded-[4rem] overflow-hidden bg-white group/cta">
              <CardContent className="p-10 md:p-14 space-y-10">
                <div className="space-y-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Launch Full Preview</p>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight">Experience Student Path</h4>
                  </div>
                  <Button 
                    onClick={() => {
                      const first = course?.sections?.[0]?.lessons?.[0]
                      if (first) openLesson(first)
                    }} 
                    className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100/50 hover:bg-slate-900 transition-all duration-300 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                    <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                       Start Learn Preview <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {course?.teacher && (
              <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[3rem] bg-white border border-slate-100 p-10 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors" />
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[28px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700">
                      <User className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60 mb-2">Lead Instructor</p>
                      <h4 className="text-2xl font-black text-slate-900 leading-none">{course.teacher.firstName} {course.teacher.lastName}</h4>
                      <div className="flex items-center gap-2 mt-3">
                         <div className="h-1 w-1 rounded-full bg-emerald-500" />
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Certified Master Expert</p>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-slate-50" />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed opacity-80">
                    Dedicated to providing the highest quality education and mentoring for future excellence.
                  </p>
              </Card>
            )}

            <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Preview Includes</h4>
                <div className="space-y-3">
                  {[
                    { Icon: Video,        text: `${totalLessons} video lessons`,       color: "text-indigo-500" },
                    { Icon: Zap,          text: `${totalQuizzes} assessments`,          color: "text-amber-500"  },
                    { Icon: Clock,        text: `${totalDuration} min total`,           color: "text-emerald-500"},
                    { Icon: FileDown,     text: "Material Downloads",                  color: "text-purple-500" },
                    { Icon: CheckCircle2, text: "Certificate (Preview)",               color: "text-teal-500"   },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3 text-sm">
                      <item.Icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-slate-600 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
