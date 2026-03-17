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
import { getCourseStructure, getQuizWithQuestions } from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"

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
  if (score === 100) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20", message: "Mashallah! Perfect score!" }
  if (score >= 90) return { label: "Outstanding", color: "text-emerald-400", bg: "bg-emerald-500/20", message: "Aad u wanaagsan! Close to perfection." }
  if (score >= 80) return { label: "Very Good", color: "text-blue-400", bg: "bg-blue-500/20", message: "Aad u fiican! Great job." }
  if (score >= 70) return { label: "Good", color: "text-indigo-400", bg: "bg-indigo-500/20", message: "Waa lagu mahadsanyahay! You passed." }
  if (score >= 60) return { label: "Average", color: "text-amber-400", bg: "bg-amber-500/20", message: "Isku day wanaagsan! You are getting there." }
  return { label: "Poor", color: "text-red-400", bg: "bg-red-500/20", message: "Dadaal ayaa lagaa rabaa! Don't give up." }
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
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  // Quiz-taking state
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [results, setResults] = React.useState<any[]>([])
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [currentQ, setCurrentQ] = React.useState(0)
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
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
    setExpandedSections(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid])

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
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Loading Quiz...</p>
        </div>
      </div>
    )

    const questions = activeQuiz?.questions || []
    const totalPts = questions.reduce((a: number, q: any) => a + q.points, 0)
    const passed = score >= (activeQuiz?.passingScore || 70)

    if (submitted) {
      const gradeInfo = getQualitativeGrade(score)
      const advice = getAdvice(score, passed)

      return (
        <div className="fixed inset-0 z-[110] bg-[#0F172A] overflow-y-auto">
          <div className="min-h-screen flex flex-col p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
              
              {/* Top Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Trophy className="h-40 w-40 text-white" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className={cn("h-32 w-32 rounded-full flex items-center justify-center shrink-0 ring-4", gradeInfo.bg, passed ? "ring-emerald-500/30" : "ring-red-500/30")}>
                    {passed ? <Trophy className="h-16 w-16 text-emerald-400" /> : <AlertCircle className="h-16 w-16 text-red-400" />}
                  </div>

                  <div className="text-center md:text-left space-y-2">
                    <p className="text-indigo-300 font-bold text-xs uppercase tracking-[0.2em]">Quiz Result</p>
                    <h2 className="text-5xl font-black text-white">{score}%</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <Badge className={cn("text-xs font-bold px-3 py-1 rounded-full", gradeInfo.bg, gradeInfo.color)}>{gradeInfo.label}</Badge>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-sm font-medium">{activeQuiz?.title}</span>
                    </div>
                  </div>

                  <div className="flex-1 border-white/5 md:border-l md:pl-12 space-y-4">
                    <div className="space-y-1">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Course</p>
                      <p className="text-white font-bold text-lg">{course?.title}</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="space-y-1">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Pass Mark</p>
                        <p className="text-white font-black">{activeQuiz?.passingScore}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Questions</p>
                        <p className="text-white font-black">{questions.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Message */}
              <div className="bg-indigo-600/10 border border-indigo-400/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-white font-bold text-lg">Message for {user?.firstName || "Student"}</h3>
                  <p className="text-indigo-100/70 text-sm leading-relaxed italic">
                    "{gradeInfo.message} {advice}"
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Teacher feedback generated
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <BookOpenCheck className="h-6 w-6 text-indigo-400" /> Detailed Review 
                  </h3>
                  <div className="text-white/40 text-xs font-bold">Scroll down to see all questions</div>
                </div>

                <div className="grid gap-4">
                  {results.map((res, idx) => (
                    <div key={idx} className={cn("group rounded-[2rem] border transition-all duration-300", res.isCorrect ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" : "bg-red-500/5 border-red-500/20 hover:border-red-500/40")}>
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                {idx + 1}
                              </span>
                              <Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md", res.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                {res.isCorrect ? "Correct" : "Needs Review"}
                              </Badge>
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{res.earned} / {res.total} Points</span>
                            </div>
                            <h4 className="text-lg md:text-xl font-bold text-white leading-snug">{res.question}</h4>
                          </div>
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", res.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                            {res.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                          </div>
                        </div>

                        {res.type === "MATCHING" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {res.matches.map((m: any, mi: number) => (
                              <div key={mi} className="bg-black/20 p-4 rounded-2xl flex items-center justify-between gap-4 border border-white/5">
                                <span className="text-xs font-bold text-white/50">{m.prompt}</span>
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="h-3 w-3 text-white/20" />
                                  <span className={cn("text-xs font-black", m.isCorrect ? "text-emerald-400" : "text-red-400")}>{m.answer}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Your Response</p>
                              <div className={cn("p-4 rounded-2xl text-sm font-bold border", res.isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-white" : "bg-red-500/10 border-red-500/20 text-red-200")}>
                                {res.studentAnswer}
                              </div>
                            </div>
                            {!res.manual && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest">Model Correct Answer</p>
                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-bold">
                                  {res.correctAnswer}
                                </div>
                              </div>
                            )}
                            {res.type === "SHORT_ANSWER" && (
                              <div className="col-span-full pt-1">
                                <p className="text-[10px] text-white/40 font-bold">Auto-grading Similarity Match: {res.similarity}%</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!res.isCorrect && (
                          <div className="flex items-start gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs text-indigo-300">
                            <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 opacity-50" />
                            <p><strong>Review Note:</strong> Pay closer attention to this concept. You might want to re-read the relevant part of the lesson to understand why the model answer is correct.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-8">
                <Button onClick={retakeQuiz} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 gap-3 font-bold text-lg">
                  <RotateCcw className="h-5 w-5" /> Retake Preview
                </Button>
                <Button onClick={() => setMode("overview")} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white gap-3 font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                  <BookOpen className="h-5 w-5" /> Exit Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const q = questions[currentQ]
    const progressPct = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0
    const isLast = currentQ === questions.length - 1

    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFD] flex flex-col">
        {/* Quiz Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setMode("overview")} className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 shrink-0">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500">{activeQuiz?.title}</span>
              <span className="text-xs font-bold text-slate-400">{currentQ + 1} / {questions.length}</span>
            </div>
            <Progress value={progressPct} className="h-1.5 rounded-full bg-slate-100" />
          </div>
          {timeLeft !== null && (
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold", timeLeft < 60 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600")}>
              <Clock className="h-3.5 w-3.5" />
              {fmtTime(timeLeft)}
            </div>
          )}
        </header>

        {/* Question Area */}
        {questions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
            <HelpCircle className="h-16 w-16" />
            <div className="text-center">
              <p className="text-base font-semibold text-slate-400">No questions in this quiz yet</p>
              <p className="text-sm text-slate-300 mt-1">The instructor hasn't added questions yet.</p>
            </div>
            <Button onClick={() => setMode("overview")} className="mt-4 rounded-xl">Back to Course</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
              {/* Question Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Question {currentQ + 1}</span>
                    {q.required && <Badge className="text-[9px] bg-red-50 text-red-500 border-red-100 font-bold">Required</Badge>}
                    <Badge className="text-[9px] bg-slate-50 text-slate-500 border-slate-100 font-bold">{q.points} pt{q.points !== 1 ? "s" : ""}</Badge>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{q.question || "No question text provided"}</h2>
                </div>

                {q.hint && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>Hint:</strong> {q.hint}</span>
                  </div>
                )}

                {/* ── MCQ ──────────────────────────────── */}
                {q.type === "MCQ" && (
                  <div className="space-y-3">
                    {q.options.map((opt: any, oi: number) => {
                      const isSelected = answers[q.id] === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswer(q.id, opt.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 shadow-sm"
                              : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-200")}>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 w-4">{String.fromCharCode(65 + oi)}.</span>
                          <span className={cn("text-sm font-medium flex-1", isSelected ? "text-indigo-700" : "text-slate-700")}>{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* ── TRUE/FALSE ────────────────────────── */}
                {q.type === "TRUE_FALSE" && (
                  <div className="flex gap-4">
                    {["True", "False"].map(val => {
                      const isSelected = answers[q.id] === val
                      return (
                        <button
                          key={val}
                          onClick={() => setAnswer(q.id, val)}
                          className={cn(
                            "flex-1 h-16 rounded-2xl border-2 font-bold text-base transition-all",
                            isSelected
                              ? val === "True"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-red-400 bg-red-50 text-red-700 shadow-sm"
                              : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* ── MATCHING ─────────────────────────── */}
                {q.type === "MATCHING" && (
                  <MatchingQuestion
                    options={q.options}
                    value={answers[q.id] || {}}
                    onChange={v => setAnswer(q.id, v)}
                  />
                )}

                {/* ── FILL_BLANK ────────────────────────── */}
                {q.type === "FILL_BLANK" && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Fill in the blank:</p>
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm transition-colors"
                    />
                  </div>
                )}

                {/* ── SHORT_ANSWER ─────────────────────── */}
                {q.type === "SHORT_ANSWER" && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Write a brief answer:</p>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Write your answer here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm resize-none transition-colors"
                    />
                  </div>
                )}

                {/* ── ESSAY ────────────────────────────── */}
                {q.type === "ESSAY" && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Write your essay response:</p>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Write your essay here..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-sm resize-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="h-11 px-6 rounded-2xl border-slate-200 text-slate-600 font-semibold disabled:opacity-40"
                >
                  ← Previous
                </Button>
                <div className="flex-1 flex justify-center gap-1.5 flex-wrap">
                  {questions.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                        i === currentQ ? "bg-indigo-600 text-white shadow-sm" :
                        answers[questions[i].id] !== undefined ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                {isLast ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    Submit Quiz ✓
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
                    className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     COURSE OVERVIEW PAGE
     ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Premium Hero */}
      <div className="bg-gradient-to-br from-[#101828] via-[#1a2333] to-[#101828] py-10 px-6 md:px-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/5 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-10">
            <Button 
              variant="ghost" 
              className="text-white/40 hover:text-white hover:bg-white/5 gap-2 p-0 h-auto text-[11px] font-bold uppercase tracking-widest transition-colors" 
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" /> Back to Builder
            </Button>
            <Badge className="bg-amber-500 text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Admin Preview
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-500 text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {course?.category || "Course"}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Level {course?.level || 1}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white focus:outline-none">
                {course?.name}
              </h1>
              
              <p className="text-base text-white/60 max-w-xl leading-relaxed font-normal">
                {course?.description || "Master the concepts through our structured curriculum and interactive assessments."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 lg:justify-end">
              {[
                { Icon: Layers, val: course?.sections?.length || 0, sub: "Chapters" },
                { Icon: Video,  val: totalLessons, sub: "Lessons" },
                { Icon: Zap,    val: totalQuizzes, sub: "Quizzes" },
              ].map(s => (
                <div key={s.sub} className="bg-white/5 border border-white/10 rounded-[2rem] p-5 min-w-[140px] flex flex-col gap-1 transition-all hover:bg-white/10 hover:border-white/20">
                  <s.Icon className="h-5 w-5 text-indigo-400 mb-2" />
                  <p className="text-2xl font-black text-white">{s.val}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 mt-16 pb-24">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpenCheck className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900 leading-none">Curriculum Journey</h2>
            </div>

            <div className="space-y-3">
              {course?.sections?.map((section: any, idx: number) => {
                const isExpanded = expandedSections.includes(section.id)
                return (
                  <div key={section.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-11 w-11 rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-none">{section.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 border-l-2 border-slate-100 pl-2">
                            {section.lessons?.length || 0} units • {section.quizzes?.length || 0} assessments
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-slate-300 transition-transform duration-500 shrink-0", isExpanded && "rotate-180")} />
                    </button>

                    <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                      <div className="border-t border-slate-50 px-6 pb-6 pt-3 space-y-1">
                        {(() => {
                          const items = [
                            ...(section.lessons || []).map((l: any) => ({ ...l, type: "lesson" })),
                            ...(section.quizzes || []).map((q: any) => ({ ...q, type: "quiz" }))
                          ].sort((a, b) => (a.order || 0) - (b.order || 0))

                          return items.map((item: any, iIdx: number) => (
                            item.type === "lesson" ? (
                              <div
                                key={item.id}
                                onClick={() => openLesson(item)}
                                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50/40 border-2 border-transparent hover:border-indigo-100 cursor-pointer transition-all"
                              >
                                <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all text-[11px] font-black shrink-0">
                                  {iIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{item.title}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.duration || 0} min unit</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.videoUrl && <Video className="h-4 w-4 text-indigo-400" />}
                                  {item.attachmentUrl && <FileText className="h-4 w-4 text-amber-400" />}
                                  <ChevronRightCircle className="h-5 w-5 text-indigo-500" />
                                </div>
                              </div>
                            ) : (
                              <div
                                key={item.id}
                                onClick={() => openQuiz(item)}
                                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50/40 border-2 border-transparent hover:border-amber-100 cursor-pointer transition-all"
                              >
                                <div className="h-9 w-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-500 shrink-0 transition-all">
                                  <Zap className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-700 group-hover:text-amber-800 transition-colors truncate">{item.title}</p>
                                  <p className="text-[10px] text-amber-600/60 font-black uppercase tracking-widest">Assessment • {item.passingScore}% threshold</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-amber-100/50 text-amber-600 border-none text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg">Launch</Badge>
                                  <ChevronRightCircle className="h-5 w-5 text-amber-500" />
                                </div>
                              </div>
                            )
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Course Progress</h3>
                  <Progress value={0} className="h-3 rounded-full bg-slate-100" />
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <span>0% Complete</span>
                    <span>0/{totalLessons + totalQuizzes}</span>
                  </div>
                </div>
                <Separator />
                <Button
                  onClick={() => {
                    const first = course?.sections?.[0]?.lessons?.[0]
                    if (first) openLesson(first)
                  }}
                  className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 gap-2"
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Includes</h4>
                <div className="space-y-3">
                  {[
                    { Icon: Video,        text: `${totalLessons} video lessons`,       color: "text-indigo-500" },
                    { Icon: Zap,          text: `${totalQuizzes} assessments`,          color: "text-amber-500"  },
                    { Icon: Clock,        text: `${totalDuration} min total`,           color: "text-emerald-500"},
                    { Icon: FileText,     text: "Downloadable resources",              color: "text-purple-500" },
                    { Icon: CheckCircle2, text: "Certificate of completion",           color: "text-teal-500"   },
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
