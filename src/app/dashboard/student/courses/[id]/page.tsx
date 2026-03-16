"use client"

import * as React from "react"
import {
  BookOpen, ChevronLeft, ChevronDown, ChevronRight,
  Clock, FileText, CheckCircle2, Video, Zap, ArrowRight,
  X, FileDown, BookOpenCheck, GraduationCap,
  Layers, AlertCircle, Trophy, RotateCcw, Check, Eye,
  Sparkles, MessageSquare, User, Shuffle, Star, Type, Target,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  getCourseStructure, 
  getQuizWithQuestions, 
  saveQuizAttempt, 
  getQuizAttempts,
  completeLesson,
  getCourseProgress,
  updateLastAccessed,
  issueCertificate,
  getCertificate
} from "../../../admin/courses/builder-actions"
import { useParams, useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LessonDiscussions } from "./lesson-discussions"
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

interface Material {
  id: string;
  name: string;
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  type: "lesson";
  content?: string;
  videoUrl?: string;
  materials?: Material[];
  attachmentUrl?: string;
  objectives?: string;
  order: number;
  sectionId?: string;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  matchKey?: string;
  points?: number;
  options?: { id: string; text: string }[];
}

interface Quiz {
  id: string;
  title: string;
  type: "quiz";
  timeLimit?: number;
  passingScore?: number;
  questions?: Question[];
  order: number;
  sectionId?: string;
  description?: string;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  quizzes: Quiz[];
}

interface Question {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "SHORT_ANSWER" | "ESSAY" | "MATCHING";
  question: string;
  points: number;
  options: QuizOption[];
  correctAnswer?: string;
  required?: boolean;
}

interface QuizAttemptResult {
  question: string;
  isCorrect: boolean;
  earned: number;
  total: number;
  studentAnswer: string;
  correctAnswer?: string;
  manual?: boolean;
  matches?: { prompt: string; answer: string; studentAnswer: string; isCorrect: boolean }[];
}

interface QuizAttempt {
  id: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
  results: QuizAttemptResult[];
}

interface Course {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sections?: Section[];
  teacher?: {
    firstName: string;
    lastName: string;
  };
  enrollments?: { points: number; lastLessonId: string }[];
}

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
  return { label: "Poor", color: "text-red-400", bg: "bg-red-500/20", message: "Don&apos;t give up! Review the material and try again." }
}

function getAdvice(score: number, passed: boolean) {
  if (score === 100) return "You have mastered this topic! You are ready to move on to more advanced lessons. Keep up this momentum!"
  if (passed) return "Congratulations on passing! Review the questions you missed to solidify your understanding and reach a perfect score next time."
  return "It happens to the best of us. Take a short break, review the lesson materials one more time, and try again. You've got this!"
}

// ─── Certificate Visual Component ───────────────────────────────────────────
interface Certificate {
  certificateUniqueId: string;
  issuedAt: string | Date;
}

function CertificateContent({ certificate, studentName, courseName }: { certificate: Certificate | null, studentName: string, courseName: string }) {
  return (
    <div id="certificate-print" className="relative w-full aspect-[1.414/1] bg-white border-[16px] border-double border-indigo-900 p-12 flex flex-col items-center justify-between text-center overflow-hidden font-serif">
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-amber-400 -translate-x-4 -translate-y-4" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-amber-400 translate-x-4 -translate-y-4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-amber-400 -translate-x-4 translate-y-4" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-amber-400 translate-x-4 translate-y-4" />
      
      {/* Background Seal */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <GraduationCap className="w-[80%] h-[80%] text-indigo-900" />
      </div>

      <div className="space-y-6 relative z-10 w-full">
        <div className="flex flex-col items-center gap-2">
           <div className="h-20 w-20 bg-indigo-900 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-amber-400" />
           </div>
           <h4 className="text-xl font-bold uppercase tracking-[0.3em] text-indigo-900">Certificate of Completion</h4>
           <div className="w-48 h-1 bg-amber-400 mx-auto" />
        </div>

        <div className="pt-8">
           <p className="text-lg italic text-slate-500">This is to certify that</p>
           <h2 className="text-6xl font-black text-indigo-950 mt-4 mb-2 capitalize">{studentName}</h2>
           <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">has successfully completed all requirements and mastered the concepts presented in the comprehensive course</p>
        </div>

        <div className="pt-4">
           <h3 className="text-4xl font-bold text-indigo-900 underline decoration-amber-400 decoration-4 underline-offset-8">{courseName}</h3>
        </div>
      </div>

      <div className="w-full flex justify-between items-end relative z-10 pt-12">
        <div className="text-left space-y-2 border-t-2 border-slate-200 pt-4 px-8">
           <p className="text-sm font-bold text-slate-900">Dr. Aliganey</p>
           <p className="text-[10px] uppercase tracking-widest text-slate-400 font-sans">Academic Director</p>
        </div>
        
        <div className="flex flex-col items-center pb-4">
           <div className="h-24 w-24 border-4 border-amber-400 rounded-full flex items-center justify-center relative bg-white/50 backdrop-blur-sm">
              <Sparkles className="h-12 w-12 text-amber-500" />
              <div className="absolute inset-2 border-2 border-dashed border-amber-200 rounded-full animate-spin-slow" />
           </div>
           <p className="text-[8px] mt-4 font-mono text-slate-400">ID: {certificate?.certificateUniqueId}</p>
        </div>

        <div className="text-right space-y-2 border-t-2 border-slate-200 pt-4 px-8">
           <p className="text-sm font-bold text-slate-900">{certificate ? format(new Date(certificate.issuedAt), "MMMM dd, yyyy") : "-"}</p>
           <p className="text-[10px] uppercase tracking-widest text-slate-400 font-sans">Date Issued</p>
        </div>
      </div>
    </div>
  )
}
function MatchingQuestion({ options, value, onChange }: {
  options: QuizOption[]
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  const [shuffled, setShuffled] = React.useState<QuizOption[]>([])

  React.useEffect(() => {
    const copy = [...options]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    setShuffled(copy)
  }, [options])

  const assigned = new Set(Object.values(value))

  const handleDrop = (promptId: string) => {
    if (!draggedId) return
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
    options.find((o: QuizOption) => o.id === answerId)?.text || ""

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 font-medium">
        Drag answers from the right and drop them onto the matching prompt on the left.
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prompts</p>
           {options.map((opt: QuizOption) => {
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
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answers</p>
          {shuffled.map((opt) => {
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

export default function StudentCourseViewerPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useCurrentUser()
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [mode, setMode] = React.useState<Mode>("overview")
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null)
  const [activeLessonTab, setActiveLessonTab] = React.useState("body")
  const [activeQuiz, setActiveQuiz] = React.useState<Quiz | null>(null)
  const [quizLoading, setQuizLoading] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  const [submitted, setSubmitted] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [results, setResults] = React.useState<QuizAttemptResult[]>([])
  const [currentQ, setCurrentQ] = React.useState(0)
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
  const [quizTab, setQuizTab] = React.useState<string>("questions")
  const [quizAttempts, setQuizAttempts] = React.useState<QuizAttempt[]>([])
  const [selectedAttempt, setSelectedAttempt] = React.useState<QuizAttempt | null>(null)
  const [courseProgress, setCourseProgress] = React.useState<number>(0)
  const [completedLessons, setCompletedLessons] = React.useState<string[]>([])
  const [certificate, setCertificate] = React.useState<Certificate | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = React.useRef<number>(0)

  // Quiz-taking state
  const [answers, setAnswers] = React.useState<Record<string, string | Record<string, string>>>({})
  const setAnswer = (qid: string, value: string | Record<string, string>) =>
    setAnswers(prev => ({ ...prev, [qid]: value }))

  const handleSubmitQuiz = React.useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!activeQuiz?.questions) return
    let earnedPoints = 0
    let totalPoints = 0
    const feedback: QuizAttemptResult[] = []

    for (const q of activeQuiz.questions) {
      const ans = answers[q.id]
      let qCorrect = false
      let qEarned = 0
      let qTotal = q.points

      if (q.type === "MATCHING") {
        qTotal = 0
        const matches: { prompt: string; answer: string; studentAnswer: string; isCorrect: boolean }[] = []
        q.options.forEach((opt: QuizOption) => {
          const pt = opt.points || 0
          qTotal += pt
          const studentChoice = (ans && typeof ans === 'object') ? (ans as Record<string, string>)[opt.id] : null
          const isMatchCorrect = studentChoice === opt.id
          if (isMatchCorrect) qEarned += pt
          
          let displayAnswer = "None"
          if (studentChoice) {
             const found = opt.options?.find((o) => o.id === studentChoice)
             displayAnswer = found ? found.text : "Matched"
          }

          matches.push({ 
            prompt: opt.matchKey || "", 
            answer: opt.text, 
            studentAnswer: displayAnswer,
            isCorrect: isMatchCorrect 
          })
        })
        qCorrect = qEarned === qTotal
        feedback.push({ 
          question: q.question, 
          isCorrect: qCorrect, 
          earned: qEarned, 
          total: qTotal, 
          studentAnswer: "Matching Assessment Applied",
          matches 
        })
      } else {
        const stringAns = typeof ans === 'string' ? ans : ""
        if (q.type === "MCQ") {
          const correct = q.options.find((o) => o.isCorrect)
          qCorrect = !!(stringAns && stringAns === correct?.id)
          feedback.push({ 
            question: q.question, 
            isCorrect: qCorrect, 
            earned: qCorrect ? q.points : 0,
            total: q.points,
            studentAnswer: q.options.find((o)=>o.id===stringAns)?.text || "No answer", 
            correctAnswer: correct?.text 
          })
        } else if (q.type === "TRUE_FALSE") {
          qCorrect = !!(stringAns && stringAns.toLowerCase() === q.correctAnswer?.toLowerCase())
          feedback.push({ 
            question: q.question, 
            isCorrect: qCorrect, 
            earned: qCorrect ? q.points : 0,
            total: q.points,
            studentAnswer: stringAns || "No answer", 
            correctAnswer: q.correctAnswer 
          })
        } else if (q.type === "FILL_BLANK") {
          qCorrect = !!(stringAns && stringAns.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase())
          feedback.push({ 
            question: q.question, 
            isCorrect: qCorrect, 
            earned: qCorrect ? q.points : 0,
            total: q.points,
            studentAnswer: stringAns || "No answer", 
            correctAnswer: q.correctAnswer 
          })
        } else if (q.type === "SHORT_ANSWER") {
          const similarity = getSimilarity(stringAns || "", q.correctAnswer || "")
          qCorrect = similarity >= 0.7
          feedback.push({ 
            question: q.question, 
            isCorrect: qCorrect, 
            earned: qCorrect ? q.points : 0,
            total: q.points,
            studentAnswer: stringAns || "No answer", 
            correctAnswer: q.correctAnswer 
          })
        } else {
          feedback.push({ 
            question: q.question, 
            isCorrect: false, 
            earned: 0,
            total: q.points,
            studentAnswer: stringAns || "No answer", 
            manual: true 
          })
        }
        if (qCorrect) qEarned = q.points
      }
      earnedPoints += qEarned
      totalPoints += qTotal
    }
    
    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = finalScore >= (activeQuiz?.passingScore || 70)
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

    setResults(feedback)
    setScore(finalScore)
    setSubmitted(true)
    setTimeLeft(null)

    if (user?.studentId && activeQuiz) {
      await saveQuizAttempt({
        quizId: activeQuiz.id,
        studentId: user.studentId,
        score: finalScore,
        earnedPoints,
        totalPoints,
        passed,
        results: feedback,
        timeSpent
      })
      const updatedAttempts = await getQuizAttempts(activeQuiz.id, user.studentId)
      setQuizAttempts(updatedAttempts)

      const prog = await getCourseProgress(id as string, user.studentId)
      setCourseProgress(prog.progress)
      setCompletedLessons(prog.completedLessonIds)

      if (prog.progress === 100 && !certificate) {
        const certRes = await issueCertificate(id as string, user.studentId)
        if (certRes?.success && certRes.certificate) setCertificate(certRes.certificate)
      }
    }
  }, [activeQuiz, answers, user, id, certificate])

  React.useEffect(() => {
    async function load() {
      const data = await getCourseStructure(id as string, user?.studentId || undefined)
      if (data) setCourse(data as Course)
      
      if (user?.studentId) {
        const [prog, cert] = await Promise.all([
          getCourseProgress(id as string, user.studentId),
          getCertificate(id as string, user.studentId)
        ])
        setCourseProgress(prog.progress)
        setCompletedLessons(prog.completedLessonIds)
        setCertificate(cert)
      }
      setLoading(false)
    }
    load()
  }, [id, user?.studentId])

  React.useEffect(() => {
    if (mode === "quiz" && activeQuiz?.timeLimit && !submitted) {
      setTimeLeft(activeQuiz.timeLimit * 60)
    }
  }, [mode, activeQuiz, submitted])

  React.useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { handleSubmitQuiz(); return }
    const t = setTimeout(() => setTimeLeft(prev => (prev ?? 1) - 1), 1000)
    timerRef.current = t
    return () => clearTimeout(t)
  }, [timeLeft, handleSubmitQuiz])

  const toggleSection = (sid: string) =>
    setExpandedSections(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid])

  const openLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson)
    setActiveLessonTab("body")
    setMode("lesson")
    if (user?.studentId) {
      updateLastAccessed(id as string, user.studentId, lesson.id)
      setCourse((prev: Course | null) => {
        if (!prev || !prev.enrollments?.[0]) return prev
        const newEnrollments = [{ ...prev.enrollments[0], lastLessonId: lesson.id }]
        return { ...prev, enrollments: newEnrollments }
      })
    }
  }

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user?.studentId) return
    const res = await completeLesson(lessonId, user.studentId)
    if (res?.success) {
      setCompletedLessons(prev => [...prev, lessonId])
      const prog = await getCourseProgress(id as string, user.studentId)
      setCourseProgress(prog.progress)
      
      if (prog.progress === 100 && !certificate) {
        const certRes = await issueCertificate(id as string, user.studentId)
        if (certRes?.success && certRes.certificate) setCertificate(certRes.certificate)
      }
    }
  }

  const openQuiz = async (quiz: Quiz) => {
    setQuizLoading(true)
    const data = await getQuizWithQuestions(quiz.id, user?.studentId || undefined) as (Quiz & { type: "quiz", attempts: QuizAttempt[] });
    if (data) {
      setActiveQuiz(data)
      setAnswers({})
      setSubmitted(false)
      setScore(0)
      setCurrentQ(0)
      setTimeLeft(null)
      setQuizTab("questions")
      setQuizAttempts(data.attempts || [])
      setMode("quiz")
      startTimeRef.current = Date.now()
    }
    setQuizLoading(false)
  }

  const retakeQuiz = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setResults([])
    setCurrentQ(0)
    setTimeLeft(activeQuiz?.timeLimit ? activeQuiz.timeLimit * 60 : null)
    setQuizTab("questions")
    startTimeRef.current = Date.now()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Course...</p>
      </div>
    </div>
  )

  const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`

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
        <header className="h-20 bg-white border-b border-slate-100 flex items-center px-4 md:px-10 gap-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setMode("overview")} className="h-11 w-11 rounded-2xl text-slate-400 hover:text-slate-700 shrink-0 bg-slate-50">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm md:text-base font-black text-slate-900 leading-none truncate max-w-[200px] md:max-w-md">{activeQuiz?.title}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 leading-none">Assessment Suite</p>
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
        <div className="md:hidden bg-white border-b border-slate-50 p-2 overflow-x-auto shrink-0">
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-10">
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
                                {score >= 90 ? "Outstanding performance! You&apos;ve mastered this topic perfectly." : 
                                 score >= 70 ? "Well done! You have a solid grasp of the material." : 
                                 "Don&apos;t discourage yourself. Learning is a journey, try reviewing the lesson and attempt again."}
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
                               <p className="text-[11px] font-bold text-white/70 italic leading-relaxed">&quot;{getAdvice(score, passed)}&quot;</p>
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
                        <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{q?.question}</h2>
                      </div>

                      <div className="space-y-4">
                        {q?.type === "MCQ" && (
                          <div className="grid gap-3">
                            {q.options.map((opt: QuizOption, oi: number) => {
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
                          <MatchingQuestion options={q.options} value={answers[q.id] || {}} onChange={v => setAnswer(q.id, v)} />
                        )}

                        {(q?.type === "FILL_BLANK" || q?.type === "SHORT_ANSWER" || q?.type === "ESSAY") && (
                          <div className="space-y-4">
                             <div className="relative group">
                                <textarea
                                  value={answers[q.id] || ""}
                                  onChange={e => setAnswer(q.id, e.target.value)}
                                  placeholder="Formulate your intellectual response..."
                                  className="w-full min-h-[200px] p-8 rounded-[2.5rem] border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:shadow-2xl focus:shadow-indigo-100/50 outline-none text-xl font-medium transition-all duration-500 resize-none"
                                />
                                <Type className="absolute top-8 right-8 h-6 w-6 text-slate-200 group-focus-within:text-indigo-400 transition-colors" />
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
                          disabled={q?.required && (q.type === 'MATCHING' ? Object.keys(answers[q.id] || {}).length < q.options.length : !answers[q.id])}
                          className={cn(
                            "flex-1 h-16 rounded-[20px] font-black uppercase tracking-[.2em] text-xs gap-4 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]",
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
                    <h2 className="text-2xl font-black text-slate-900">Your Journey Path</h2>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{quizAttempts.length} Attempts recorded</Badge>
                 </div>

                 {selectedAttempt ? (
                   <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                      <Button variant="ghost" className="text-slate-400 hover:text-slate-900 font-bold gap-2 p-0 px-2" onClick={() => setSelectedAttempt(null)}>
                        <ArrowRight className="h-4 w-4 rotate-180" /> Back to History
                      </Button>
                      
                      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
                         <div className={cn("p-10 text-white flex items-center justify-between", selectedAttempt.passed ? "bg-emerald-600" : "bg-red-600")}>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Attempt Results • {selectedAttempt.createdAt ? format(new Date(selectedAttempt.createdAt), 'PPP') : 'N/A'}</p>
                               <h3 className="text-3xl font-black">{selectedAttempt.score}% Recorded</h3>
                            </div>
                            <Trophy className="h-12 w-12 opacity-40" />
                         </div>
                         <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               {[
                                 { label: "Points", val: `${selectedAttempt.earnedPoints} / ${selectedAttempt.totalPoints}`, icon: Star },
                                 { label: "Time Taken", val: `${Math.floor((selectedAttempt.timeSpent || 0) / 60)}m ${(selectedAttempt.timeSpent || 0) % 60}s`, icon: Clock },
                                 { label: "Date", val: selectedAttempt.createdAt ? format(new Date(selectedAttempt.createdAt), 'MMM d, p') : 'N/A', icon: GraduationCap }
                               ].map((stat, i) => (
                                 <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><stat.icon className="h-5 w-5" /></div>
                                    <div>
                                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                       <p className="text-sm font-black text-slate-700">{stat.val}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Historical Feedback</h4>
                               <div className="grid gap-3">
                                  {selectedAttempt?.results?.map((res, idx) => (
                                    <div key={idx} className={cn("p-6 rounded-3xl border-2 transition-all cursor-default", res.isCorrect ? "bg-emerald-50/20 border-emerald-50" : "bg-red-50/20 border-red-50")}>
                                       <div className="flex items-start gap-4">
                                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black", res.isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                                            {res.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                          </div>
                                          <div className="flex-1 space-y-2">
                                             <p className="text-sm font-bold text-slate-800">{res.question}</p>
                                             <div className="flex gap-4">
                                                <p className="text-[10px]"><span className="text-slate-400 uppercase font-black tracking-widest mr-2">Your:</span> <span className="font-bold text-slate-600">{typeof res.studentAnswer === 'string' ? res.studentAnswer || "No Response" : "Matched"}</span></p>
                                                {!res.isCorrect && <p className="text-[11px]"><span className="text-indigo-400 uppercase font-black tracking-widest mr-2">Valid:</span> <span className="font-bold text-indigo-600">{typeof res.correctAnswer === 'string' ? res.correctAnswer : "Matched"}</span></p>}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                      {quizAttempts.length > 0 ? quizAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          onClick={() => setSelectedAttempt(attempt)}
                          className="group bg-white rounded-3xl border-2 border-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer"
                        >
                           <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500", attempt.passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                                 {attempt.passed ? <Trophy className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black text-slate-900">{attempt.score}%</h4>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{attempt.createdAt ? format(new Date(attempt.createdAt), 'PPP @ p') : 'N/A'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Points</p>
                                 <p className="text-xs font-black text-slate-600">{attempt.earnedPoints} / {attempt.totalPoints}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time</p>
                                 <p className="text-xs font-black text-slate-600">{Math.floor((attempt.timeSpent || 0) / 60)}m {(attempt.timeSpent || 0) % 60}s</p>
                              </div>
                              <Button variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all ml-auto">
                                 <Eye className="h-5 w-5" />
                              </Button>
                           </div>
                        </div>
                      )) : (
                        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center space-y-6">
                           <div className="h-20 w-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto text-slate-200"><Shuffle className="h-10 w-10" /></div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-slate-800">No Historical Records</h3>
                               <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">You haven&apos;t completed any attempts for this assessment yet. Your journey begins with the first question.</p>
                           </div>
                           <Button onClick={() => setQuizTab('questions')} className="h-12 px-8 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">Start First Attempt</Button>
                        </div>
                      )}
                   </div>
                 )}
              </TabsContent>

              <TabsContent value="performance" className="mt-0 outline-none space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Best Score", val: `${quizAttempts.length > 0 ? Math.max(...quizAttempts.map(a => a.score)) : 0}%`, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Average Score", val: `${quizAttempts.length > 0 ? Math.round(quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length) : 0}%`, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Success Rate", val: `${quizAttempts.length > 0 ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100) : 0}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Total Sessions", val: quizAttempts.length, icon: RotateCcw, color: "text-slate-600", bg: "bg-slate-50" },
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
                       <h3 className="text-xl font-black text-slate-900 leading-none">Progression Analytics</h3>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score (%)</span></div>
                       </div>
                    </div>

                    <div className="h-[400px] w-full mt-10">
                       {quizAttempts.length > 1 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...quizAttempts].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis
                                 dataKey="createdAt"
                                 tickFormatter={(str: string) => str ? format(new Date(str), 'MMM d') : ''}
                                 axisLine={false}
                                 tickLine={false}
                                 tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                               />
                               <YAxis
                                 domain={[0, 100]}
                                 axisLine={false}
                                 tickLine={false}
                                 tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                 tickCount={6}
                               />
                               <Tooltip
                                 contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff' }}
                                 itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                                 labelStyle={{ display: 'none' }}
                               />
                               <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                         </ResponsiveContainer>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                            <Trophy className="h-10 w-10 text-slate-200" />
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-[200px]">Insufficient data for analytics. Complete multiple attempts to see your progress.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "lesson") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex flex-col">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMode("overview")} className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400"><ChevronLeft className="h-5 w-5" /></Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{activeLesson?.title}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{course?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button
                onClick={async () => {
                  try {
                    const btn = document.getElementById("mark-done-btn");
                    if (btn) {
                      btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Completing...`;
                      btn.setAttribute("disabled", "true");
                    }
                    if (activeLesson) {
                      await handleCompleteLesson(activeLesson.id);
                    }
                  } finally {
                    const btn = document.getElementById("mark-done-btn");
                    if (btn && activeLesson && !completedLessons.includes(activeLesson.id)) {
                      btn.innerHTML = "Mark as Complete";
                      btn.removeAttribute("disabled");
                    }
                  }
                }}
                id="mark-done-btn"
                disabled={activeLesson ? completedLessons.includes(activeLesson.id) : true}
                className={cn(
                  "flex text-[10px] font-black uppercase tracking-widest h-9 px-5 rounded-xl transition-all",
                  activeLesson && completedLessons.includes(activeLesson.id)
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                )}
              >
                {activeLesson && completedLessons.includes(activeLesson.id) ? "✓ Completed" : "Mark as Complete"}
              </Button>
             <Button variant="ghost" size="sm" onClick={() => setMode("overview")} className="text-slate-500 gap-1.5 text-xs font-semibold hover:bg-slate-50 rounded-xl h-9 px-3 sm:px-4"><X className="h-4 w-4 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Close</span></Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
            {/* ── Lesson Banner ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-500">
                <Layers className="h-3 w-3" />
                {course?.sections?.find((s) => s.id === activeLesson?.sectionId)?.title || "Course Module"}
                <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                Lesson {activeLesson && (course?.sections?.find((s) => s.id === activeLesson?.sectionId)?.lessons?.findIndex((l) => l.id === activeLesson.id) || 0) + 1}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter animate-in fade-in slide-in-from-left-4 duration-700">
                {activeLesson?.title}
              </h1>
            </div>

            {/* ── Premium Objectives Card ── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group animate-in zoom-in-95 duration-700">
               {/* Abstract background shapes */}
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
               <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />

               <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border border-white/20 shadow-xl">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-100">Learning Objectives</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target outcomes for this lesson</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeLesson?.objectives ? (
                    activeLesson.objectives.split('\n').filter((line: string) => line.trim()).map((line: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 group/item">
                         <div className="mt-2 h-2 w-2 rounded-full bg-yellow-400 shrink-0 shadow-[0_0_12px_rgba(250,204,21,0.6)] group-hover/item:scale-125 transition-transform" />
                         <p className="text-white/90 text-sm md:text-lg leading-relaxed font-medium">
                           {line.replace(/^[•\-\*]\s*/, '')}
                         </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 italic text-white/60 text-sm">
                      <Sparkles className="h-4 w-4" />
                      Focus on the primary concepts defined in this teaching module.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center border-b border-slate-100">
                {[
                  { key: "body", label: "Lesson Body", icon: BookOpen },
                  { key: "materials", label: "Materials", icon: FileText },
                  { key: "video", label: "Video", icon: Video },
                  { key: "qa", label: "Q&A Discussion", icon: MessageSquare },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveLessonTab(tab.key)} className={cn("flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2", activeLessonTab === tab.key ? "border-indigo-600 text-indigo-600 bg-indigo-50/40" : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50")}><tab.icon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span></button>
                ))}
              </div>
              <div className="p-8">
                {activeLessonTab === "body" && <div className="space-y-4"><h3 className="text-2xl font-bold text-slate-900">{activeLesson?.title}</h3><Separator /><div className="prose prose-slate max-w-none text-slate-600 leading-[1.9] whitespace-pre-wrap text-[15px]">{activeLesson?.content || "No content yet."}</div></div>}
                {activeLessonTab === "materials" && (
                  <div className="space-y-4">
                    {activeLesson?.attachmentUrl ? (
                      <a href={activeLesson.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-amber-50 hover:bg-amber-100/70 rounded-2xl border border-amber-100 transition-all group"><div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm"><FileDown className="h-6 w-6" /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900">Lesson PDF Document</p></div><ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" /></a>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-300"><FileText className="h-12 w-12 mb-4" /><p className="text-sm font-semibold text-slate-400">No materials attached</p></div>
                    )}
                  </div>
                )}
                {activeLessonTab === "video" && (
                  <div className="space-y-4">
                    {activeLesson?.videoUrl ? (
                      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video shadow-xl"><iframe src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("vimeo.com/", "player.vimeo.com/video/")} className="w-full h-full" allowFullScreen /></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl text-slate-300 border border-dashed border-slate-200"><Video className="h-12 w-12 mb-4" /><p className="text-sm font-semibold text-slate-400">No video available</p></div>
                    )}
                  </div>
                )}
                {activeLessonTab === "qa" && activeLesson && (
                  <LessonDiscussions lessonId={activeLesson.id} user={user} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Lesson Navigation Footer ── */}
        <div className="h-20 bg-white border-t border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 z-50">
           {(() => {
             const courseItems = course?.sections?.flatMap((s: Section) => {
                const lessons = (s.lessons || []).map((l: Lesson) => ({ ...l, type: "lesson" as const, sectionId: s.id }));
                const quizzes = (s.quizzes || []).map((q: Quiz) => ({ ...q, type: "quiz" as const, sectionId: s.id }));
                return [...lessons, ...quizzes].sort((a, b) => (a.order || 0) - (b.order || 0));
             }) || []

             const currentIndex = courseItems.findIndex((ci) => ci.id === activeLesson?.id)
             const prevItem = currentIndex > 0 ? courseItems[currentIndex - 1] : null
             const nextItem = currentIndex < courseItems.length - 1 ? courseItems[currentIndex + 1] : null

             // Check if next item is locked
             let nextIsLocked = activeLesson ? !completedLessons.includes(activeLesson.id) : true;
             // If the next item is already completed, it's definitely not locked
             if (nextItem && completedLessons.includes(nextItem.id)) {
               nextIsLocked = false;
             }

             return (
               <>
                 <Button
                   variant="outline"
                   disabled={!prevItem}
                   onClick={() => {
                     if (prevItem) {
                       if (prevItem.type === "lesson") {
                         openLesson(prevItem);
                       } else {
                         openQuiz(prevItem);
                       }
                     }
                   }}
                   className="rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest gap-2 border-slate-200 text-slate-600 disabled:opacity-30"
                 >
                   <ChevronLeft className="h-4 w-4" /> Previous
                 </Button>

                 <div className="hidden md:flex flex-col items-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Lesson Progress</p>
                    <div className="flex items-center gap-1 mt-1">
                       {courseItems.map((item: Lesson | Quiz, idx: number) => (
                         <div
                           key={idx}
                           className={cn(
                             "h-1.5 w-6 rounded-full transition-all",
                             idx === currentIndex ? "bg-indigo-600" : (completedLessons.includes(item.id) ? "bg-emerald-400" : "bg-slate-100")
                           )}
                         />
                       ))}
                    </div>
                 </div>

                 <Button
                   disabled={!nextItem || nextIsLocked}
                   onClick={() => {
                     if (nextItem) {
                       if (nextItem.type === "lesson") {
                         openLesson(nextItem);
                       } else {
                         openQuiz(nextItem);
                       }
                     }
                   }}
                   className={cn(
                     "rounded-xl h-11 px-8 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all",
                     nextIsLocked ? "bg-slate-100 text-slate-300 border-none opacity-50 shadow-none" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                   )}
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

  const totalLessons = course?.sections?.reduce((a: number, s: Section) => a + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((a: number, s: Section) => a + (s.quizzes?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Premium Dynamic Header ── */}
      <div className="relative pt-24 pb-48 px-6 md:px-10 overflow-hidden">
        {/* Background Layer: Deep professional gradient with accent pops */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-500/20 to-transparent" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <Button
            variant="ghost"
            className="text-white/40 hover:text-white hover:bg-white/5 mb-16 gap-2 p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Return to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                       <User className="h-4 w-4 text-slate-500" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">+124 students enrolled</span>
                <Separator orientation="vertical" className="h-5 bg-white/10" />
                <Badge className="bg-amber-400 text-slate-950 border-none px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-amber-400/20">
                  <Star className="h-3.5 w-3.5 fill-slate-950" /> {course?.enrollments?.[0]?.points || 0} XP
                </Badge>
                <Badge className="bg-white/5 text-white/60 border border-white/10 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                  {course?.category || "Core Module"}
                </Badge>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-[0.9] text-white">
                  {course?.name}<span className="text-indigo-500">.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed font-medium">
                  {course?.description || "Master the concepts through our structured curriculum and interactive assessments."}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8 animate-in fade-in slide-in-from-right-6 duration-700">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

                  <div className="flex items-center justify-between relative z-10">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-3">Mastery Progress</p>
                       <h3 className="text-5xl font-black text-white">{courseProgress}%</h3>
                     </div>
                     <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                        <Trophy className="h-8 w-8 text-white" />
                     </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                       <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${courseProgress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      <span>{completedLessons.length} Completed</span>
                      <span>{totalLessons} Lessons</span>
                    </div>
                  </div>
               </div>

               <div className="flex gap-6">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-2 hover:bg-white/10 transition-all cursor-default border-b-4 border-b-transparent hover:border-b-indigo-500/50">
                    <Layers className="h-5 w-5 text-indigo-400 mb-2" />
                    <p className="text-3xl font-black text-white">{course?.sections?.length || 0}</p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Chapters</p>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-2 hover:bg-white/10 transition-all cursor-default border-b-4 border-b-transparent hover:border-b-amber-500/50">
                    <Zap className="h-5 w-5 text-amber-400 mb-2" />
                    <p className="text-3xl font-black text-white">{totalQuizzes}</p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Quizzes</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 -mt-28 relative z-20 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* ── Integrated Curriculum Section ── */}
            <div className="bg-white rounded-[4rem] p-10 md:p-14 shadow-[0_30px_100px_-30px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col">
               <div className="flex items-center justify-between mb-16">
                  <div className="border-l-[6px] border-indigo-600 pl-8">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Curriculum <span className="text-indigo-600">Structure</span></h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mt-3">Comprehensive syllabus for this module</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-[20px] border border-slate-100 shadow-sm">
                    <BookOpenCheck className="h-5 w-5 text-indigo-500" />
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Self-Paced</span>
                  </div>
               </div>

               <div className="space-y-6">
                {course?.sections?.map((section: Section, idx: number) => {
                  const isExpanded = expandedSections.includes(section.id)
                  const sectionCompletedItems = [
                    ...(section.lessons || []).filter((l:Lesson) => completedLessons.includes(l.id)),
                    ...(section.quizzes || []).filter((q:Quiz) => completedLessons.includes(q.id))
                  ].length
                  const sectionTotalItems = (section.lessons?.length || 0) + (section.quizzes?.length || 0)
                  const sectionProgress = sectionTotalItems > 0 ? Math.round((sectionCompletedItems / sectionTotalItems) * 100) : 0

                  return (
                    <div key={section.id} className={cn("group bg-white rounded-[3rem] border-2 transition-all duration-700 overflow-hidden", isExpanded ? "border-indigo-100 shadow-2xl shadow-indigo-50/50" : "border-slate-50 hover:border-slate-100")}>
                      <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-8 md:p-10 hover:bg-slate-50/50 transition-colors text-left relative overflow-hidden">
                        {/* Section highlight for expanded state */}
                        {isExpanded && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />}

                        <div className="flex items-center gap-8">
                          <div className={cn("h-20 w-20 rounded-[28px] flex flex-col items-center justify-center shrink-0 border-2 transition-all duration-500", isExpanded ? "bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-200" : "bg-white border-slate-50 text-slate-900")}>
                             <span className="text-[10px] font-black uppercase opacity-60">Unit</span>
                             <span className="text-2xl font-black leading-none">{idx + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{section.title}</h3>
                            <div className="flex items-center gap-4 mt-3">
                               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                                 <BookOpen className="h-3.5 w-3.5" /> {section.lessons?.length || 0} Lessons
                               </div>
                               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-600">
                                 <Zap className="h-3.5 w-3.5" /> {section.quizzes?.length || 0} Quizzes
                               </div>
                               {sectionProgress > 0 && (
                                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase">
                                   <Check className="h-3.5 w-3.5" /> {sectionProgress}% done
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="hidden sm:block h-2 w-32 bg-slate-100 rounded-full overflow-hidden p-0.5">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]" style={{ width: `${sectionProgress}%` }} />
                           </div>
                           <div className={cn("h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-500", isExpanded ? "bg-indigo-50 text-indigo-600 rotate-180" : "bg-white text-slate-300")}>
                             <ChevronDown className="h-6 w-6" />
                           </div>
                        </div>
                      </button>

                      <div className={cn("transition-all duration-700 ease-in-out overflow-hidden bg-slate-50/50", isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0")}>
                        <div className="p-6 md:p-10 space-y-4">
                          {(() => {
                            const items = [
                              ...(section.lessons || []).map((l: Lesson) => ({ ...l, type: "lesson" as const })),
                              ...(section.quizzes || []).map((q: Quiz) => ({ ...q, type: "quiz" as const }))
                            ].sort((a, b) => (a.order || 0) - (b.order || 0))

                            return items.map((item: Lesson | Quiz, iIdx: number) => {
                              const courseItems = course?.sections?.flatMap((s: Section) =>
                                [
                                  ...(s.lessons || []).map((l: Lesson) => ({ ...l, type: "lesson" as const, sectionId: s.id })),
                                  ...(s.quizzes || []).map((q: Quiz) => ({ ...q, type: "quiz" as const, sectionId: s.id }))
                                ].sort((a, b) => (a.order || 0) - (b.order || 0))
                              ) || []

                              const globalIndex = courseItems.findIndex((ci) => ci.id === item.id)
                              const isFirstItem = globalIndex === 0
                              let isLocked = false
                              if (!isFirstItem) {
                                const previousItems = courseItems.slice(0, globalIndex)
                                for (const pItem of previousItems) {
                                  if (!completedLessons.includes(pItem.id)) {
                                    isLocked = true
                                    break
                                  }
                                }
                              }
                              if (completedLessons.includes(item.id)) isLocked = false

                              if (item.type === "lesson") {
                                return (
                                  <div key={item.id} onClick={() => !isLocked && openLesson(item)} className={cn("group flex items-center gap-6 p-5 rounded-[2rem] transition-all duration-500 border-2", isLocked ? "bg-white/50 border-transparent opacity-60 cursor-not-allowed" : "bg-white border-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100/50 group-hover:translate-x-1 cursor-pointer shadow-sm")}>
                                    <div className={cn("h-12 w-12 rounded-[18px] flex items-center justify-center text-sm font-black shrink-0 transition-all duration-500", isLocked ? "bg-slate-100 text-slate-300" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-500/30 group-hover:shadow-lg")}>
                                      {completedLessons.includes(item.id) ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : isLocked ? <Clock className="h-5 w-5 opacity-40" /> : iIdx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-base font-bold truncate transition-colors duration-300", isLocked ? "text-slate-400" : "text-slate-800")}>{item.title}</p>
                                      <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1 opacity-60", isLocked ? "text-slate-400" : "text-indigo-400")}>Theory Lecture</p>
                                    </div>
                                    {!isLocked && <ArrowRight className="h-5 w-5 text-indigo-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />}
                                  </div>
                                )
                              } else {
                                return (
                                  <div key={item.id} onClick={() => !isLocked && openQuiz(item)} className={cn("group flex items-center gap-6 p-5 rounded-[2rem] transition-all duration-500 border-2", isLocked ? "bg-white/50 border-transparent opacity-60 cursor-not-allowed" : "bg-white border-white hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-100/50 group-hover:translate-x-1 cursor-pointer shadow-sm")}>
                                    <div className={cn("h-12 w-12 rounded-[18px] flex items-center justify-center shrink-0 transition-all duration-500", isLocked ? "bg-slate-100 text-slate-300" : "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30 group-hover:shadow-lg")}>
                                      <Zap className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-base font-bold truncate transition-colors duration-300", isLocked ? "text-slate-400" : "text-slate-800")}>{item.title}</p>
                                      <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1 opacity-60", isLocked ? "text-slate-400" : "text-amber-500")}>Knowledge Assessment</p>
                                    </div>
                                    {!isLocked && <ChevronRight className="h-5 w-5 text-amber-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />}
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
                {(() => {
                  const items = course?.sections?.flatMap((s: Section) =>
                    [
                      ...(s.lessons || []).map((l: Lesson) => ({ ...l, type: "lesson" as const })),
                      ...(s.quizzes || []).map((q: Quiz) => ({ ...q, type: "quiz" as const }))
                    ].sort((a, b) => (a.order || 0) - (b.order || 0))
                  ) || []
                  const next = items.find((it) => !completedLessons.includes(it.id)) || items[0]
                  const started = completedLessons.length > 0
                  return (
                    <div className="space-y-8">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500/60">{started ? "Resume Your Path" : "Begin Excellence"}</p>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight">{next?.title || "Welcome to the course!"}</h4>
                      </div>
                      <Button onClick={() => {
                          if (!next) return;
                          if (next.type === "lesson") {
                            openLesson(next);
                          } else {
                            openQuiz(next);
                          }
                        }} className="w-full h-20 rounded-[30px] bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 gap-4 border-b-[6px] border-indigo-800 active:border-b-0 active:translate-y-1 transition-all group/btn overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                        <span className="relative z-10 flex items-center gap-4">
                           {started ? "Continue Journey" : "Start Learning"} <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-500" />
                        </span>
                      </Button>
                    </div>
                  )
                })()}
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

            {courseProgress === 100 && (
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-950 text-white p-10 relative group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000"><Trophy className="h-28 w-28" /></div>
                <div className="relative z-10 space-y-8">
                   <div className="h-16 w-16 bg-amber-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-400/30 animate-bounce">
                      <Star className="h-8 w-8 text-indigo-950 fill-indigo-950" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-2xl font-black tracking-tight">Mastery Achieved!</h3>
                      <p className="text-sm text-white/50 leading-relaxed font-medium">You have successfully completed all course requirements. Your professional certificate is now ready.</p>
                   </div>
                   <Dialog>
                      <DialogTrigger asChild>
                         <Button className="w-full h-14 rounded-[22px] bg-amber-400 text-indigo-950 font-black text-xs uppercase tracking-widest hover:bg-amber-300 transition-all border-b-6 border-amber-600 active:border-b-0 active:translate-y-2">View Certificate</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 bg-white border-none overflow-hidden rounded-[3rem] shadow-2xl">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                           <DialogTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Official Course Certificate</DialogTitle>
                           <Button variant="outline" size="sm" className="h-10 rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all" onClick={() => {
                                const printContent = document.getElementById('certificate-print');
                                const WinPrint = window.open('', '', 'width=1200,height=850');
                                WinPrint?.document.write('<html><head><title>Certificate</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none; } }</style></head><body>');
                                WinPrint?.document.write(printContent?.innerHTML || '');
                                WinPrint?.document.write('</body></html>');
                                WinPrint?.document.close();
                                WinPrint?.focus();
                                setTimeout(() => { WinPrint?.print(); WinPrint?.close(); }, 1000);
                           }}>
                             <Printer className="h-4 w-4" /> Export as PDF
                           </Button>
                        </div>
                        <div className="p-4 md:p-14 overflow-x-auto bg-slate-100/50">
                           <div className="min-w-[800px] shadow-2xl">
                              <CertificateContent certificate={certificate} studentName={`${user?.firstName} ${user?.lastName}`} courseName={course?.name}/>
                           </div>
                        </div>
                      </DialogContent>
                   </Dialog>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
