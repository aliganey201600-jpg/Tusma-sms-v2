"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  TrendingUp,
  Award,
  ChevronDown,
  BookOpen,
  Target,
  Zap,
  Star,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentGrades } from "./actions"

const scoreToGrade = (score: number) => {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

const scoreToGPA = (score: number) => {
  if (score >= 90) return 4.0
  if (score >= 80) return 3.0
  if (score >= 70) return 2.0
  if (score >= 60) return 1.0
  return 0.0
}

export default function StudentGradesPage() {
  const { user } = useCurrentUser()
  const [gradeData, setGradeData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expanded, setExpanded] = React.useState<number | null>(0)

  React.useEffect(() => {
    async function loadData() {
      if (user?.studentId) {
        const enrollments = await getStudentGrades(user.studentId)
        
        const formatted = enrollments.map((en: any) => {
          const course = en.course
          const items: any[] = []
          
          // Add Exam results
          course.exams.forEach((exam: any) => {
            const result = exam.results[0]
            if (result) {
              items.push({
                name: exam.title,
                score: result.marksObtained,
                max: exam.maxMarks,
                date: new Date(result.gradedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
                grade: scoreToGrade((result.marksObtained / exam.maxMarks) * 100),
                type: 'Exam'
              })
            }
          })

          // Add Assignment results
          course.assignments.forEach((ass: any) => {
            const grade = ass.grades[0]
            if (grade) {
              items.push({
                name: ass.title,
                score: grade.score,
                max: 100,
                date: new Date(grade.gradedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
                grade: scoreToGrade(grade.score),
                type: 'Assignment'
              })
            }
          })

          // Calculate average for this course
          let avgScore = 0
          if (items.length > 0) {
            avgScore = items.reduce((acc, curr) => acc + (curr.score / curr.max), 0) / items.length * 100
          }

          return {
            subject: course.name,
            teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
            grade: scoreToGrade(avgScore),
            gpa: scoreToGPA(avgScore),
            color: ["indigo", "emerald", "violet", "blue", "amber", "rose"][Math.floor(Math.random() * 6)],
            items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          }
        })

        setGradeData(formatted)
      }
      setLoading(false)
    }
    loadData()
  }, [user?.studentId])

  const overallGPA = gradeData.length > 0 
    ? (gradeData.reduce((acc, g) => acc + g.gpa, 0) / gradeData.length).toFixed(2)
    : "0.00"

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Academic History...</p>
         </div>
       </div>
     )
  }

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Header */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-[40px] blur-2xl opacity-100 transition-opacity" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 shadow-xl shadow-slate-200 text-white">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Academic Transcripts</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            My <span className="text-emerald-600">Performance.</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed">
            A comprehensive breakdown of your achievements and learning trajectory this semester.
          </p>
        </div>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Big GPA card */}
        <div className="lg:col-span-5 relative group">
           <div className="absolute inset-0 bg-emerald-600 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
           <Card className="h-full rounded-[48px] border-none bg-slate-900 p-10 md:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Award className="h-48 w-48" />
              </div>
              <div className="space-y-6 relative z-10">
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Cumulative GPA Score</p>
                 <div className="flex items-baseline gap-4">
                    <h2 className="text-8xl md:text-9xl font-black tracking-tighter leading-none text-white">{overallGPA}</h2>
                    <span className="text-2xl font-black text-slate-500">/ 4.0</span>
                 </div>
              </div>
              <div className="pt-10 space-y-4 relative z-10">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                   <TrendingUp className="h-5 w-5 text-emerald-400" />
                   <p className="text-sm font-bold">Academic standing: <span className="text-emerald-400">Excellent</span></p>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-2">Updated: Semester 2, 2026</p>
              </div>
           </Card>
        </div>

        {/* Subject Insights */}
        <Card className="lg:col-span-7 rounded-[48px] border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] bg-white p-10 md:p-14 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">GPA by Subject</h3>
            <div className="flex gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500" />
               <div className="h-2 w-2 rounded-full bg-slate-100" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {gradeData.map((g, i) => {
              const pct = (g.gpa / 4.0) * 100
              const colorClasses: any = {
                emerald: "bg-emerald-500",
                violet: "bg-violet-500",
                blue: "bg-blue-500",
                amber: "bg-amber-500",
                indigo: "bg-indigo-500",
                rose: "bg-rose-500",
              }
              return (
                <div key={i} className="space-y-4 group">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Grade</p>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{g.subject}</h4>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{g.gpa.toFixed(1)}</span>
                  </div>
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner p-0.5">
                    <div className={cn("h-full rounded-full transition-all duration-1000", colorClasses[g.color] || "bg-indigo-500")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {gradeData.length === 0 && (
               <div className="col-span-full py-10 text-center text-slate-400">
                  <p className="text-sm font-bold italic">No academic data synchronized yet.</p>
               </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Subject Grades */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Performance Breakdown</h2>
           <div className="h-px flex-1 bg-slate-100" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {gradeData.map((subject, i) => (
            <SubjectAccordion
              key={i}
              subject={subject}
              isOpen={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
          {gradeData.length === 0 && (
             <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Waiting for instructor assessment data.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SubjectAccordion({ subject, isOpen, onToggle }: any) {
  const gradeColors: any = {
    "A": "bg-emerald-50 text-emerald-700",
    "B": "bg-indigo-50 text-indigo-700",
    "C": "bg-amber-50 text-amber-700",
    "D": "bg-orange-50 text-orange-700",
    "F": "bg-rose-50 text-rose-700",
  }

  const dotColors: any = {
    emerald: "bg-emerald-500 shadow-emerald-200",
    indigo: "bg-indigo-500 shadow-indigo-200",
    violet: "bg-violet-500 shadow-violet-200",
    blue: "bg-blue-500 shadow-blue-200",
    amber: "bg-amber-500 shadow-amber-200",
    rose: "bg-rose-500 shadow-rose-200",
  }

  return (
    <Card className={cn("border-none shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden bg-white transition-all duration-500", isOpen && "shadow-2xl shadow-slate-200/50 scale-[1.01]")}>
      <button
        className="w-full flex items-center gap-6 p-8 md:px-12 text-left hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className={cn("h-4 w-4 rounded-full shrink-0 shadow-lg", dotColors[subject.color] || dotColors.indigo)} />
        <div className="flex-1 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Course</p>
          <p className="text-xl font-black text-slate-900">{subject.subject}</p>
        </div>
        <div className="hidden md:block text-right px-10 border-r border-slate-100 mr-6">
           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Instructor</p>
           <p className="text-xs font-black text-slate-600">{subject.teacher}</p>
        </div>
        <div className="flex items-center gap-6">
           <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-slate-100", gradeColors[subject.grade] || "bg-slate-100")}>
             {subject.grade}
           </div>
           <ChevronDown className={cn("h-6 w-6 text-slate-300 transition-transform duration-500", isOpen && "rotate-180 text-indigo-500")} />
        </div>
      </button>

      {isOpen && (
        <div className="px-8 md:px-12 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {subject.items.map((item: any, j: number) => {
              const pct = Math.round((item.score / item.max) * 100)
              return (
                <div key={j} className="group relative overflow-hidden flex items-center gap-6 p-6 rounded-[28px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                   <div className={cn("flex flex-col items-center justify-center h-14 w-14 rounded-2xl text-[10px] font-black border-2 border-white shadow-xl bg-white", 
                     item.type === 'Exam' ? 'text-indigo-600' : 'text-emerald-600')}>
                      {item.type.charAt(0)}
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type} Result</p>
                      <h5 className="text-sm font-black text-slate-900">{item.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold">{item.date}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-slate-900 tracking-tight">{item.score}<span className="text-slate-300 text-xs font-bold leading-none ml-1">/{item.max}</span></p>
                      <Badge className={cn("rounded-lg text-[9px] font-black border-none px-2 py-0.5", gradeColors[item.grade] || "bg-slate-100 text-slate-500")}>
                        {pct}%
                      </Badge>
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
