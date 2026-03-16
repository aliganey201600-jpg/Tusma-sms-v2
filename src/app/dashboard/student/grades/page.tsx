"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  TrendingUp,
  Award,
  Star,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react"

const gradeData = [
  {
    subject: "Computer Science", teacher: "Mr. Khalid Hassan", grade: "A", gpa: 4.0, color: "emerald",
    exams: [
      { name: "Mid-term Exam", score: 94, max: 100, date: "Mar 10", grade: "A" },
      { name: "Chapter 3 Quiz", score: 90, max: 100, date: "Feb 25", grade: "A-" },
      { name: "Lab Practical", score: 88, max: 100, date: "Feb 10", grade: "B+" },
    ]
  },
  {
    subject: "English Literature", teacher: "Mr. Mahad Yusuf", grade: "A-", gpa: 3.7, color: "violet",
    exams: [
      { name: "Essay Analysis", score: 91, max: 100, date: "Mar 8", grade: "A-" },
      { name: "Shakespeare Quiz", score: 85, max: 100, date: "Feb 20", grade: "B+" },
    ]
  },
  {
    subject: "Mathematics", teacher: "Mr. Abdi Warsame", grade: "B+", gpa: 3.3, color: "blue",
    exams: [
      { name: "Chapter 5 Test", score: 87, max: 100, date: "Mar 7", grade: "B+" },
      { name: "Mid-term Exam", score: 82, max: 100, date: "Feb 15", grade: "B" },
      { name: "Algebra Quiz", score: 79, max: 100, date: "Feb 1", grade: "C+" },
    ]
  },
  {
    subject: "History", teacher: "Ms. Hodan Jama", grade: "B-", gpa: 2.7, color: "amber",
    exams: [
      { name: "WWI Essay", score: 78, max: 100, date: "Mar 5", grade: "B-" },
      { name: "Chapter 4 Quiz", score: 72, max: 100, date: "Feb 18", grade: "C+" },
    ]
  },
  {
    subject: "Physics", teacher: "Ms. Fadumo Ali", grade: "B", gpa: 3.0, color: "indigo",
    exams: [
      { name: "Lab Practical", score: 80, max: 100, date: "Mar 5", grade: "B" },
      { name: "Chapter 2 Exam", score: 76, max: 100, date: "Feb 12", grade: "C+" },
    ]
  },
  {
    subject: "Biology", teacher: "Ms. Sagal Omar", grade: "C+", gpa: 2.3, color: "lime",
    exams: [
      { name: "Cell Biology Quiz", score: 72, max: 100, date: "Mar 3", grade: "C+" },
    ]
  },
]

const overallGPA = (gradeData.reduce((acc, g) => acc + g.gpa, 0) / gradeData.length).toFixed(2)

export default function StudentGradesPage() {
  const [expanded, setExpanded] = React.useState<number | null>(0)

  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
          <GraduationCap className="h-3 w-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Academic Record</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">
          My <span className="text-emerald-600">Grades.</span>
        </h1>
        <p className="text-slate-500 font-medium">Your full academic performance breakdown for this semester.</p>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Big GPA card */}
        <Card className="md:col-span-1 rounded-[32px] border-none bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-2xl shadow-emerald-200">
          <Award className="h-10 w-10 text-white/40 fill-white/10 mb-6" />
          <p className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-2">Cumulative GPA</p>
          <p className="text-7xl font-black tracking-tighter leading-none mb-2">{overallGPA}</p>
          <p className="text-emerald-100 text-sm font-semibold">out of 4.0 · Semester 2, 2025</p>
          <div className="mt-6 flex items-center gap-2 text-sm font-black text-emerald-100">
            <TrendingUp className="h-4 w-4" />
            +0.2 from last semester
          </div>
        </Card>

        {/* Subject GPAs */}
        <Card className="md:col-span-2 rounded-[32px] border-none shadow-xl shadow-slate-100 bg-white p-8">
          <CardTitle className="text-lg font-black text-slate-900 mb-6">GPA by Subject</CardTitle>
          <div className="space-y-4">
            {gradeData.map((g, i) => {
              const pct = (g.gpa / 4.0) * 100
              const colorMap: any = {
                emerald: "bg-emerald-500",
                violet: "bg-violet-500",
                blue: "bg-blue-500",
                amber: "bg-amber-500",
                indigo: "bg-indigo-500",
                lime: "bg-lime-500",
              }
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{g.subject}</span>
                    <span className="text-xs font-black text-slate-900">{g.gpa.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", colorMap[g.color])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Detailed Subject Grades (Accordion) */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">Exam Results by Subject</h2>
        {gradeData.map((subject, i) => (
          <SubjectAccordion
            key={i}
            subject={subject}
            isOpen={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}

function SubjectAccordion({ subject, isOpen, onToggle }: any) {
  const gradeColor: any = {
    "A": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "A-": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "B+": "bg-blue-50 text-blue-700 border-blue-100",
    "B": "bg-violet-50 text-violet-700 border-violet-100",
    "B-": "bg-amber-50 text-amber-700 border-amber-100",
    "C+": "bg-orange-50 text-orange-700 border-orange-100",
    "C": "bg-red-50 text-red-600 border-red-100",
  }

  const colBg: any = {
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
    lime: "bg-lime-500",
  }

  return (
    <Card className="border-none shadow-xl shadow-slate-100 rounded-[24px] overflow-hidden bg-white">
      <button
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", colBg[subject.color])} />
        <div className="flex-1">
          <p className="font-black text-slate-900">{subject.subject}</p>
          <p className="text-xs font-semibold text-slate-400">{subject.teacher}</p>
        </div>
        <Badge variant="outline" className={cn("rounded-full text-xs font-black border", gradeColor[subject.grade])}>
          {subject.grade}
        </Badge>
        <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="px-5 md:px-6 pb-6">
          <div className="border-t border-slate-50 pt-4 space-y-3">
            {subject.exams.map((exam: any, j: number) => {
              const pct = Math.round((exam.score / exam.max) * 100)
              return (
                <div key={j} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0", gradeColor[exam.grade] || "bg-slate-100 text-slate-500")}>
                    {exam.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{exam.name}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{exam.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-900">{exam.score}<span className="text-slate-400 font-medium">/{exam.max}</span></p>
                    <p className="text-[11px] font-bold text-slate-400">{pct}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
