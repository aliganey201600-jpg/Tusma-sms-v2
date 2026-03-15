"use client"

import * as React from "react"
import {
  BookOpen, ChevronLeft, ChevronDown, ChevronRight,
  Clock, FileText, CheckCircle2, Video, Zap, ArrowRight,
  X, FileDown, BookOpenCheck, HelpCircle, GraduationCap,
  Layers, AlertCircle, Trophy, RotateCcw, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getCourseStructure, getQuizWithQuestions } from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
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
    for (const q of activeQuiz.questions) {
      const ans = answers[q.id]
      
      if (q.type === "MATCHING") {
        q.options.forEach((opt: any) => {
          total += opt.points || 0
          const studentChoice = ans ? ans[opt.id] : null
          if (studentChoice === opt.id) earned += opt.points || 0
        })
      } else {
        total += q.points
        if (q.type === "MCQ") {
          const correct = q.options.find((o: any) => o.isCorrect)
          if (ans && ans === correct?.id) earned += q.points
        } else if (q.type === "TRUE_FALSE") {
          if (ans && ans.toLowerCase() === q.correctAnswer?.toLowerCase()) earned += q.points
        } else if (q.type === "FILL_BLANK") {
          if (ans && ans.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) earned += q.points
        } else if (q.type === "SHORT_ANSWER") {
          const similarity = getSimilarity(ans || "", q.correctAnswer || "")
          if (similarity >= 0.7) earned += q.points
        }
      }
    }
    setScore(total > 0 ? Math.round((earned / total) * 100) : 0)
    setSubmitted(true)
    setTimeLeft(null)
  }

  const retakeQuiz = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
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

    // Results screen
    if (submitted) {
      return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className={cn("mx-auto h-32 w-32 rounded-full flex items-center justify-center shadow-2xl", passed ? "bg-emerald-500/20 ring-4 ring-emerald-500/40" : "bg-red-500/20 ring-4 ring-red-500/40")}>
              {passed
                ? <Trophy className="h-16 w-16 text-emerald-400" />
                : <AlertCircle className="h-16 w-16 text-red-400" />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3">
                {passed ? "Congratulations!" : "Keep Practicing"}
              </p>
              <h2 className="text-5xl font-black">{score}%</h2>
              <p className="text-white/50 mt-2 text-lg">{activeQuiz?.title}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Your Score", value: `${score}%`, color: passed ? "emerald" : "red" },
                { label: "Pass Mark", value: `${activeQuiz?.passingScore || 70}%`, color: "slate" },
                { label: "Questions", value: `${questions.length}`, color: "indigo" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-2xl p-4 space-y-1">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={retakeQuiz} variant="outline" className="flex-1 h-12 rounded-2xl border-white/10 text-white hover:bg-white/5 gap-2">
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </Button>
              <Button onClick={() => setMode("overview")} className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                <BookOpen className="h-4 w-4" /> Back to Course
              </Button>
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-slate-900 pt-14 pb-24 px-6 md:px-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 mb-8 gap-2 p-0 h-auto text-xs font-bold" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" /> Back to Builder
          </Button>
          <div className="space-y-5">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              {course?.category || "General"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{course?.name}</h1>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              {course?.description || "A comprehensive course designed to build mastery through structured lessons and assessments."}
            </p>
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { Icon: Layers, val: `${course?.sections?.length || 0} Chapters`, sub: "Sections", color: "indigo" },
                { Icon: Video,  val: `${totalLessons} Lessons`,                  sub: "Total Units", color: "emerald" },
                { Icon: Zap,    val: `${totalQuizzes} Quizzes`,                  sub: "Assessments", color: "amber" },
                { Icon: Clock,  val: `${totalDuration} min`,                     sub: "Duration",    color: "purple" },
              ].map(s => (
                <div key={s.sub} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <s.Icon className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{s.val}</p>
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOC */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 -mt-10 pb-24">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpenCheck className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Table of Contents</h2>
            </div>

            <div className="space-y-3">
              {course?.sections?.map((section: any, idx: number) => {
                const isExpanded = expandedSections.includes(section.id)
                return (
                  <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">{section.title}</h3>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {section.lessons?.length || 0} lessons • {section.quizzes?.length || 0} quizzes
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-slate-300 transition-transform duration-300 shrink-0", isExpanded && "rotate-180")} />
                    </button>

                    <div className={cn("transition-all duration-300 overflow-hidden", isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                      <div className="border-t border-slate-50 px-5 pb-4 pt-2 space-y-1">
                        {section.lessons?.map((lesson: any, lIdx: number) => (
                          <div
                            key={lesson.id}
                            onClick={() => openLesson(lesson)}
                            className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-indigo-50/50 border-2 border-transparent hover:border-indigo-100 cursor-pointer transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all text-xs font-bold shrink-0">
                              {lIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{lesson.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{lesson.duration || 0} min</p>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {lesson.videoUrl && <Video className="h-3.5 w-3.5 text-indigo-400" />}
                              {lesson.attachmentUrl && <FileText className="h-3.5 w-3.5 text-amber-400" />}
                              <ChevronRight className="h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        ))}

                        {section.quizzes?.map((quiz: any) => (
                          <div
                            key={quiz.id}
                            onClick={() => openQuiz(quiz)}
                            className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-amber-50/60 border-2 border-transparent hover:border-amber-100 cursor-pointer transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-500 shrink-0 transition-all">
                              <Zap className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-amber-700 transition-colors truncate">{quiz.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Quiz • {quiz.passingScore}% to pass</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none text-[9px] font-bold uppercase tracking-wider">Take Quiz</Badge>
                              <ChevronRight className="h-4 w-4 text-amber-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                          </div>
                        ))}
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
