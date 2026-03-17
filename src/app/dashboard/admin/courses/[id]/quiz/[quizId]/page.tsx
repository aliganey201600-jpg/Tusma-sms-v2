"use client"

import * as React from "react"
import {
  Plus, Trash2, ChevronLeft, Save, Upload, Download,
  HelpCircle, CheckSquare, ArrowLeftRight, PenLine,
  AlignLeft, FileText, ChevronDown, GripVertical,
  Star, Shuffle, Eye, EyeOff, AlertCircle, Check, X, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getQuizWithQuestions, saveQuizQuestions, updateQuiz } from "../../../builder-actions"
import { generateQuizQuestions } from "../../../../../student/courses/[id]/ai-actions"

// ─── Question Types ────────────────────────────────────────────────────────
const QUESTION_TYPES = [
  { value: "MCQ",           label: "Multiple Choice",   icon: HelpCircle,      color: "indigo" },
  { value: "TRUE_FALSE",    label: "True / False",      icon: CheckSquare,     color: "emerald" },
  { value: "MATCHING",      label: "Matching",          icon: ArrowLeftRight,  color: "amber" },
  { value: "FILL_BLANK",    label: "Fill in the Blank", icon: PenLine,         color: "purple" },
  { value: "SHORT_ANSWER",  label: "Short Answer",      icon: AlignLeft,       color: "rose" },
  { value: "ESSAY",         label: "Essay",             icon: FileText,        color: "slate" },
]

const typeColor: Record<string, string> = {
  MCQ:          "bg-indigo-50 text-indigo-700 border-indigo-100",
  TRUE_FALSE:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  MATCHING:     "bg-amber-50 text-amber-700 border-amber-100",
  FILL_BLANK:   "bg-purple-50 text-purple-700 border-purple-100",
  SHORT_ANSWER: "bg-rose-50 text-rose-700 border-rose-100",
  ESSAY:        "bg-slate-50 text-slate-700 border-slate-100",
}

// ─── Default question factory ──────────────────────────────────────────────
const makeQuestion = (type = "MCQ") => ({
  id: crypto.randomUUID(),
  type,
  question: "",
  points: 1,
  required: true,
  shuffleOptions: false,
  hint: "",
  correctAnswer: "",
  options: type === "MCQ" ? [
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
  ] : type === "TRUE_FALSE" ? [
    { id: crypto.randomUUID(), text: "True",  isCorrect: true,  matchKey: "" },
    { id: crypto.randomUUID(), text: "False", isCorrect: false, matchKey: "" },
  ] : type === "MATCHING" ? [
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
    { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" },
  ] : [],
})

// ─── Excel sample download ────────────────────────────────────────────────
function downloadSampleExcel() {
  const csv = [
    ["type","question","option_a","option_b","option_c","option_d","correct_answer","points","required","hint"],
    ["MCQ","What is 2+2?","3","4","5","6","B","1","true","Think addition"],
    ["TRUE_FALSE","The sky is blue.","","","","","True","1","true",""],
    ["FILL_BLANK","The capital of France is _____.","","","","","Paris","2","true",""],
    ["SHORT_ANSWER","Explain photosynthesis briefly.","","","","","","3","true",""],
    ["ESSAY","Describe the causes of World War I.","","","","","","10","false",""],
  ].map(row => row.map(c => `"${c}"`).join(",")).join("\n")
  
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "quiz_questions_sample.csv"; a.click()
  URL.revokeObjectURL(url)
}

// ─── Parse imported CSV rows ────────────────────────────────────────────────
function parseImportedRows(rows: any[]): any[] {
  return rows.map(row => {
    const type = (row.type || "MCQ").toUpperCase().replace(" ", "_").replace("/", "_")
    const q: any = {
      id: crypto.randomUUID(),
      type,
      question: row.question || "",
      points: Number(row.points) || 1,
      required: row.required !== "false",
      shuffleOptions: false,
      hint: row.hint || "",
      correctAnswer: row.correct_answer || "",
      options: [],
    }
    if (type === "MCQ") {
      const opts = ["option_a","option_b","option_c","option_d"].filter(k => row[k])
      const correctIdx = { A:0, B:1, C:2, D:3 }[String(row.correct_answer || "A").toUpperCase()] ?? 0
      q.options = opts.map((k, i) => ({ id: crypto.randomUUID(), text: row[k], isCorrect: i === correctIdx, matchKey: "" }))
    } else if (type === "TRUE_FALSE") {
      const isTrue = String(row.correct_answer || "True").toLowerCase() === "true"
      q.options = [
        { id: crypto.randomUUID(), text: "True",  isCorrect: isTrue,  matchKey: "" },
        { id: crypto.randomUUID(), text: "False", isCorrect: !isTrue, matchKey: "" },
      ]
    }
    return q
  })
}

export default function QuizBuilderPage() {
  const { id: courseId, quizId } = useParams() as { id: string; quizId: string }
  const router = useRouter()
  const [quiz, setQuiz] = React.useState<any>(null)
  const [questions, setQuestions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showTypeMenu, setShowTypeMenu] = React.useState(false)
  const [expandedQ, setExpandedQ] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false)
  const [aiCounts, setAiCounts] = React.useState<Record<string, number>>({
    MCQ: 2, TRUE_FALSE: 1, MATCHING: 1, FILL_BLANK: 1, SHORT_ANSWER: 0
  })
  const [showAIConfig, setShowAIConfig] = React.useState(false)

  // Quiz settings state
  const [quizTitle, setQuizTitle] = React.useState("")
  const [passingScore, setPassingScore] = React.useState(70)
  const [timeLimit, setTimeLimit] = React.useState<number | "">("")
  const [shuffleQuestions, setShuffleQuestions] = React.useState(false)
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    async function load() {
      const data = await getQuizWithQuestions(quizId)
      if (data) {
        setQuiz(data)
        setQuizTitle(data.title)
        setPassingScore(data.passingScore)
        setTimeLimit(data.timeLimit || "")
        setShuffleQuestions(data.shuffleQuestions || false)
        setDescription(data.description || "")
        const qs = (data.questions || []).map((q: any) => ({
          ...q,
          id: q.id,
          options: (q.options || []).map((o: any) => ({ ...o, id: o.id }))
        }))
        setQuestions(qs)
        if (qs.length > 0) setExpandedQ(qs[0].id)
      }
      setLoading(false)
    }
    load()
  }, [quizId])

  const addQuestion = (type: string) => {
    const q = makeQuestion(type)
    setQuestions(prev => [...prev, q])
    setExpandedQ(q.id)
    setShowTypeMenu(false)
  }

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true)
    try {
      // Pass the quiz ID directly instead of lessonId. The backend handles finding the right content.
      const res = await generateQuizQuestions(quiz.id, aiCounts)
      if (res.success && res.questions) {
        setQuestions(prev => [...prev, ...res.questions])
        toast.success(`Neural Network Sync: ${res.questions.length} New Challenges Deployed`)
        if (res.questions.length > 0) setExpandedQ(res.questions[0].id)
      } else {
        toast.error(res.error || "AI Synthesis Failed")
      }
    } catch (err) {
      toast.error("Strategic Link Failure")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const removeQuestion = (qid: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qid))
    if (expandedQ === qid) setExpandedQ(null)
  }

  const updateQ = (qid: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, [field]: value } : q))
  }

  const updateOption = (qid: string, oid: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q
      return { ...q, options: q.options.map((o: any) => o.id === oid ? { ...o, [field]: value } : o) }
    }))
  }

  const setCorrectOption = (qid: string, oid: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q
      return { ...q, options: q.options.map((o: any) => ({ ...o, isCorrect: o.id === oid })) }
    }))
  }

  const addOption = (qid: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q
      return { ...q, options: [...q.options, { id: crypto.randomUUID(), text: "", isCorrect: false, matchKey: "" }] }
    }))
  }

  const removeOption = (qid: string, oid: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q
      return { ...q, options: q.options.filter((o: any) => o.id !== oid) }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Save quiz settings
    await updateQuiz(quizId, {
      title: quizTitle,
      passingScore,
      timeLimit: timeLimit ? Number(timeLimit) : undefined,
      shuffleQuestions,
      description,
    })
    // Save questions
    const res = await saveQuizQuestions(quizId, questions)
    if (res.success) {
      toast.success("Quiz saved successfully!")
    } else {
      toast.error("Save failed: " + (res as any).error)
    }
    setSaving(false)
  }

  // CSV Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").filter(l => l.trim())
      const headers = lines[0].split(",").map(h => h.replace(/"/g,"").trim().toLowerCase())
      const rows = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.replace(/"/g,"").trim())
        const obj: any = {}
        headers.forEach((h, i) => obj[h] = values[i] || "")
        return obj
      }).filter(r => r.question)
      const parsed = parseImportedRows(rows)
      setQuestions(prev => [...prev, ...parsed])
      toast.success(`Imported ${parsed.length} questions!`)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const totalPoints = questions.reduce((sum: number, q: any) => {
    if (q.type === "MATCHING") {
      return sum + q.options.reduce((a: number, b: any) => a + (Number(b.points) || 0), 0)
    }
    return sum + (Number(q.points) || 0)
  }, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Quiz Builder...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Quiz Builder</h1>
            <p className="text-[10px] text-slate-400">{quiz?.section?.courseId ? `${quizTitle}` : "Loading..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold">{questions.length} Questions</Badge>
          <Badge variant="secondary" className="text-xs font-semibold">{totalPoints} pts</Badge>
          <Button variant="outline" size="sm" onClick={downloadSampleExcel} className="gap-1.5 text-xs h-9 rounded-xl border-dashed">
            <Download className="h-3.5 w-3.5" /> Sample
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5 text-xs h-9 rounded-xl">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 text-xs h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* ─ Left: Questions ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Add Question Button */}
          <div className="flex gap-4 relative">
            <div className="flex-1 relative">
              <Button
                onClick={() => setShowTypeMenu(v => !v)}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-semibold text-sm gap-2 transition-all"
                variant="ghost"
              >
                <Plus className="h-4 w-4" /> Add Question
                <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", showTypeMenu && "rotate-180")} />
              </Button>

              {showTypeMenu && (
                <div className="absolute top-14 left-0 right-0 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 grid grid-cols-3 gap-2">
                  {QUESTION_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => addQuestion(t.value)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${t.color}-50 text-${t.color}-600 group-hover:scale-110 transition-transform`}>
                        <t.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                onClick={() => setShowAIConfig(!showAIConfig)}
                disabled={isGeneratingAI}
                className="h-12 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm gap-2 px-8 shadow-md border-b-4 border-slate-800 active:border-b-0 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isGeneratingAI ? (
                  <div className="h-5 w-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-400" />
                )}
                {isGeneratingAI ? "Generating..." : "Generate with AI"}
              </Button>

              {showAIConfig && !isGeneratingAI && (
                <div className="absolute top-14 right-0 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl w-72 p-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">AI Assessment Config</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      <Label className="text-[10px] uppercase text-indigo-400 tracking-wider">Configure Quantity</Label>
                      {QUESTION_TYPES.filter(t => t.value !== 'ESSAY').map(t => (
                        <div key={t.value} className="flex items-center justify-between gap-3">
                          <Label className={`text-[10px] uppercase font-bold text-${t.color}-600`}>{t.label}</Label>
                          <Input 
                            type="number" 
                            min={0} max={20}
                            value={aiCounts[t.value] || 0}
                            onChange={e => setAiCounts(prev => ({ ...prev, [t.value]: Number(e.target.value) || 0 }))}
                            className="h-8 w-16 border-slate-200 bg-slate-50 text-center font-bold text-xs rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => {
                        setShowAIConfig(false);
                        handleAIGenerate();
                      }}
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl"
                    >
                      Execute Synthesis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-300">
              <HelpCircle className="h-12 w-12 mb-3" />
              <p className="text-sm font-semibold text-slate-400">No questions yet</p>
              <p className="text-xs text-slate-300 mt-1">Click "Add Question" above or import a CSV file</p>
            </div>
          )}

          {/* Question Cards */}
          {questions.map((q, idx) => {
            const typeInfo = QUESTION_TYPES.find(t => t.value === q.type)
            const isExpanded = expandedQ === q.id
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                {/* Question Header */}
                <div
                  onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50/50 select-none"
                >
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {q.question || <span className="text-slate-300 italic">No question text</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-[9px] font-bold uppercase border", typeColor[q.type])}>{typeInfo?.label}</Badge>
                      <span className="text-[10px] text-slate-400">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                      {q.required && <Badge className="text-[9px] bg-red-50 text-red-500 border-red-100">Required</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg" onClick={(e) => { e.stopPropagation(); removeQuestion(q.id) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>

                {/* Question Form */}
                {isExpanded && (
                  <div className="border-t border-slate-50 p-6 space-y-5">
                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question</Label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={q.required} onChange={e => updateQ(q.id, "required", e.target.checked)} className="rounded" />
                          <span className="text-xs text-slate-500 font-medium">Required</span>
                        </label>
                      </div>
                      <Textarea
                        value={q.question}
                        onChange={e => updateQ(q.id, "question", e.target.value)}
                        placeholder="Enter your question..."
                        className="rounded-xl border-slate-200 resize-none text-sm min-h-[80px]"
                      />
                    </div>

                    {/* Points + Shuffle row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {q.type !== "MATCHING" && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Points</Label>
                          <Input type="number" min={0} value={q.points} onChange={e => updateQ(q.id, "points", Number(e.target.value))} className="w-20 h-9 rounded-xl border-slate-200 text-sm" />
                        </div>
                      )}
                      {["MCQ","MATCHING"].includes(q.type) && (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={q.shuffleOptions} onChange={e => updateQ(q.id, "shuffleOptions", e.target.checked)} className="rounded" />
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Shuffle className="h-3.5 w-3.5" /> Shuffle Options</span>
                        </label>
                      )}
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Hint</Label>
                        <Input value={q.hint} onChange={e => updateQ(q.id, "hint", e.target.value)} placeholder="Optional hint..." className="h-9 rounded-xl border-slate-200 text-xs flex-1" />
                      </div>
                    </div>

                    {/* ── MCQ Options ─────────────────────────── */}
                    {q.type === "MCQ" && (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Options</Label>
                        {q.options.map((opt: any, oi: number) => (
                          <div key={opt.id} className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all", opt.isCorrect ? "border-emerald-400 bg-emerald-50" : "border-slate-100 bg-slate-50/50")}>
                            <button onClick={() => setCorrectOption(q.id, opt.id)} className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
                              {opt.isCorrect && <Check className="h-3 w-3 text-white" />}
                            </button>
                            <span className="text-xs font-bold text-slate-400 w-4 shrink-0">{String.fromCharCode(65+oi)}.</span>
                            <Input value={opt.text} onChange={e => updateOption(q.id, opt.id, "text", e.target.value)} placeholder={`Option ${String.fromCharCode(65+oi)}`} className="flex-1 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-400 rounded-lg shrink-0" onClick={() => removeOption(q.id, opt.id)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="text-xs text-indigo-500 hover:text-indigo-700 gap-1 h-8 pl-1">
                          <Plus className="h-3.5 w-3.5" /> Add Option
                        </Button>
                      </div>
                    )}

                    {/* ── True / False ─────────────────────────── */}
                    {q.type === "TRUE_FALSE" && (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Answer</Label>
                        <div className="flex gap-3">
                          {["True","False"].map(val => (
                            <button key={val} onClick={() => updateQ(q.id, "correctAnswer", val)} className={cn("flex-1 h-12 rounded-xl border-2 font-semibold text-sm transition-all", q.correctAnswer === val ? (val === "True" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700") : "border-slate-200 text-slate-400 hover:border-slate-300")}>
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Matching ─────────────────────────────── */}
                    {q.type === "MATCHING" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matching Pairs (Prompt → Answer → Points)</Label>
                          <span className="text-[10px] text-slate-400 font-bold">Sum: {q.options.reduce((a: number, b: any) => a + (Number(b.points) || 0), 0)} pts</span>
                        </div>
                        {q.options.map((opt: any) => (
                          <div key={opt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={opt.matchKey}
                                  onChange={e => updateOption(q.id, opt.id, "matchKey", e.target.value)}
                                  placeholder="Prompt (left side)"
                                  className="h-9 rounded-xl border-white bg-white text-sm shadow-sm"
                                />
                                <ArrowLeftRight className="h-4 w-4 text-slate-300 shrink-0" />
                                <Input
                                  value={opt.text}
                                  onChange={e => updateOption(q.id, opt.id, "text", e.target.value)}
                                  placeholder="Answer (right side)"
                                  className="h-9 rounded-xl border-white bg-white text-sm shadow-sm"
                                />
                              </div>
                            </div>
                            <div className="w-16 shrink-0">
                              <Input
                                type="number"
                                min={0}
                                step={0.5}
                                value={opt.points}
                                onChange={e => updateOption(q.id, opt.id, "points", Number(e.target.value))}
                                className="h-9 rounded-xl border-white bg-white text-sm text-center font-bold text-indigo-600 shadow-sm"
                              />
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-400 shrink-0 transition-opacity" onClick={() => removeOption(q.id, opt.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="text-xs text-amber-600 hover:text-amber-700 gap-1 h-9 rounded-xl bg-amber-50/50 hover:bg-amber-50 w-full border border-dashed border-amber-200">
                          <Plus className="h-3.5 w-3.5" /> Add New Pair
                        </Button>
                      </div>
                    )}

                    {/* ── Fill in the Blank ─────────────────────── */}
                    {q.type === "FILL_BLANK" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Answer</Label>
                        <Input value={q.correctAnswer} onChange={e => updateQ(q.id, "correctAnswer", e.target.value)} placeholder="Enter the expected answer..." className="rounded-xl border-slate-200 text-sm h-10" />
                        <p className="text-[10px] text-slate-400">Use _____ in the question text to mark blank positions.</p>
                      </div>
                    )}

                    {/* ── Short Answer ──────────────────────────── */}
                    {q.type === "SHORT_ANSWER" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sample / Model Answer</Label>
                        <Textarea value={q.correctAnswer} onChange={e => updateQ(q.id, "correctAnswer", e.target.value)} placeholder="Enter a model answer for grading reference..." className="rounded-xl border-slate-200 text-sm resize-none min-h-[80px]" />
                      </div>
                    )}

                    {/* ── Essay ─────────────────────────────────── */}
                    {q.type === "ESSAY" && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium text-center">Essay questions are manually graded. Students will see a large text area to write their response.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ─ Right: Quiz Settings ───────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900">Quiz Settings</h3>
            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</Label>
              <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="rounded-xl border-slate-200 text-sm h-10" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." className="rounded-xl border-slate-200 text-sm resize-none min-h-[70px]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passing %</Label>
                <Input type="number" min={0} max={100} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} className="rounded-xl border-slate-200 text-sm h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time (min)</Label>
                <Input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(e.target.value ? Number(e.target.value) : "")} placeholder="None" className="rounded-xl border-slate-200 text-sm h-10" />
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Shuffle Questions</span>
              </div>
              <div onClick={() => setShuffleQuestions(v => !v)} className={cn("h-5 w-9 rounded-full transition-all relative", shuffleQuestions ? "bg-indigo-600" : "bg-slate-200")}>
                <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", shuffleQuestions ? "left-4" : "left-0.5")} />
              </div>
            </label>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Total Questions</span>
                <span className="font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Total Points</span>
                <span className="font-bold text-indigo-600">{totalPoints}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Required Questions</span>
                <span className="font-bold">{questions.filter(q => q.required).length}</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 shadow-sm">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
