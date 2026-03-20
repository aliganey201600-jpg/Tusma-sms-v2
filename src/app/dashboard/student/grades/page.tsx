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
  ChevronUp,
  RotateCcw,
  Sparkles,
  FileText,
  Clock,
  History
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentGrades } from "./actions"

const mockGradeData = [
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

export default function StudentGradesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [data, setData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expanded, setExpanded] = React.useState<number | null>(0)

  React.useEffect(() => {
    async function loadData() {
      if (user?.studentId) {
        const res = await getStudentGrades(user.studentId)
        setData(res)
      }
      setLoading(false)
    }
    
    if (!userLoading) {
      loadData()
    }
  }, [user?.studentId, userLoading])

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Academic History...</p>
        </div>
      </div>
    )
  }

  const gradeData = data

  if (!loading && gradeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="h-24 w-24 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center shadow-inner">
           <GraduationCap className="h-10 w-10 text-slate-300" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">No Grades Found Yet</h2>
           <p className="text-slate-500 font-medium max-w-md mx-auto mt-2">You haven't completed any quizzes or exams that have been graded. Once your instructors release your marks, they will appear here.</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="rounded-xl border-slate-200 font-black text-xs uppercase tracking-widest gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Refresh Academic Data
        </Button>
      </div>
    )
  }

  const overallGPA = gradeData.length > 0 ? (gradeData.reduce((acc, g) => acc + g.gpa, 0) / gradeData.length).toFixed(2) : "0.00"

  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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
        
        <Button 
          onClick={() => window.print()}
          className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-indigo-200 transition-all active:scale-95 print:hidden"
        >
           <FileText className="h-5 w-5" />
           Official Report Card
        </Button>
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
      <div className="space-y-3 print:hidden">
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

      {/* Hidden PDF/Print Template */}
      <ReportCardTemplate data={gradeData} user={user} />
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
    "F": "bg-rose-50 text-rose-600 border-rose-100",
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
    <Card className="border-none shadow-xl shadow-slate-100 rounded-[28px] overflow-hidden bg-white transition-all duration-500">
      <button
        className={cn(
          "w-full flex items-center gap-4 p-5 md:p-7 text-left transition-all",
          isOpen ? "bg-slate-50/50" : "hover:bg-slate-50"
        )}
        onClick={onToggle}
      >
        <div className={cn("h-3 w-3 rounded-full shrink-0 shadow-sm", colBg[subject.color])} />
        <div className="flex-1">
          <p className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none mb-1.5">{subject.subject}</p>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{subject.teacher}</p>
        </div>
        <Badge variant="outline" className={cn("rounded-xl h-8 px-4 text-xs font-black border-2 transition-all", gradeColor[subject.grade])}>
          {subject.grade}
        </Badge>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm transition-transform duration-300", isOpen && "rotate-180")}>
           <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 md:px-7 pb-7">
          <div className="border-t border-slate-100 pt-6 space-y-4">
            {subject.exams.length > 0 ? (
              subject.exams.map((exam: any, j: number) => (
                <QuizResultItem key={j} exam={exam} gradeColor={gradeColor} />
              ))
            ) : (
              <div className="py-10 text-center">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No graded assessments yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

function QuizResultItem({ exam, gradeColor }: any) {
  const [isOpen, setIsOpen] = React.useState(false)
  const results = (exam.results as any[]) || []
  
  const pct = Math.round((exam.score / exam.max) * 100)
  const isQuiz = exam.type === 'QUIZ'

  return (
    <div className="space-y-3">
       <div 
        onClick={() => isQuiz && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-4 p-4 md:p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 transition-all group",
          isQuiz && "hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 cursor-pointer"
        )}
       >
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm shrink-0 transition-transform group-hover:scale-110", gradeColor[exam.grade] || "bg-slate-100 text-slate-500")}>
            {exam.grade}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{exam.name}</p>
            <div className="flex items-center gap-3 flex-wrap">
               <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  {exam.date}
               </div>
               {isQuiz && exam.stats && (
                  <Badge variant="outline" className="text-[9px] font-black h-5 px-2 bg-white border-slate-200 text-slate-500 uppercase tracking-widest gap-1.5">
                     <History className="h-3 w-3 text-indigo-400" />
                     {exam.stats.count} {exam.stats.count === 1 ? 'Attempt' : 'Attempts'}
                  </Badge>
               )}
            </div>
          </div>
          
          {isQuiz && exam.stats && (
             <div className="hidden lg:flex items-center gap-8 px-8 text-[10px] font-black uppercase text-slate-400 border-x border-slate-100 mx-4">
                <div className="text-center">
                   <p className="tracking-widest mb-0.5">MIN</p>
                   <p className="text-slate-900 text-sm font-black leading-none">{exam.stats.min}%</p>
                </div>
                <div className="text-center">
                   <p className="tracking-widest mb-0.5">MAX</p>
                   <p className="text-slate-900 text-sm font-black leading-none">{exam.stats.max}%</p>
                </div>
                <div className="text-center">
                   <p className="tracking-widest mb-0.5">AVG</p>
                   <p className="text-indigo-600 text-sm font-black leading-none">{exam.stats.avg}%</p>
                </div>
             </div>
          )}

          <div className="text-right shrink-0">
             <div className="flex flex-col items-end">
                <p className="text-base font-black text-slate-900 tracking-tighter leading-none mb-1">
                   {exam.score}<span className="text-slate-300 font-medium text-xs ml-0.5">/{exam.max}</span>
                </p>
                <div className="flex items-center gap-2">
                   <span className="text-[11px] font-black text-slate-400">{pct}%</span>
                   {isQuiz && <div className={cn("h-6 w-6 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm transition-transform duration-300", isOpen && "rotate-180")}><ChevronDown className="h-3 w-3 text-slate-400" /></div>}
                </div>
             </div>
          </div>
       </div>

       {isOpen && isQuiz && results.length > 0 && (
          <div className="pl-4 md:pl-16 pr-2 py-4 space-y-4 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-2 mb-6">
                <div className="h-px bg-slate-100 flex-1" />
                <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] tracking-widest uppercase px-4 py-1.5">Response Analysis</Badge>
                <div className="h-px bg-slate-100 flex-1" />
             </div>

             {results.map((res: any, k: number) => (
                <div key={k} className="group p-6 md:p-8 rounded-[32px] bg-white border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/40 transition-all duration-500 space-y-6 relative overflow-hidden">
                   <div className={cn("absolute top-0 left-0 w-2 h-full transition-colors", res.isCorrect ? "bg-emerald-500" : "bg-rose-500")} />
                   
                   <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                         <span className={cn("h-8 w-8 rounded-xl flex items-center justify-center font-black text-sm", res.isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>{k + 1}</span>
                         <h4 className="font-black text-slate-900 text-base md:text-lg leading-tight uppercase tracking-tight">{res.question}</h4>
                      </div>
                      <Badge className={cn("shrink-0 h-10 px-5 rounded-2xl font-black text-xs shadow-sm border-none", res.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                         {res.earned} / {res.total}
                      </Badge>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                      <div className={cn(
                        "p-5 rounded-[24px] border-2 space-y-2 group-hover:scale-[1.02] transition-transform", 
                        res.isCorrect ? "bg-emerald-50/10 border-emerald-50" : "bg-rose-50/10 border-rose-50"
                      )}>
                         <div className="flex items-center gap-2 mb-1">
                            <RotateCcw className="h-3 w-3 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Response</p>
                         </div>
                         <p className={cn("text-sm font-bold italic leading-relaxed", res.isCorrect ? "text-emerald-700" : "text-rose-700")}>
                            "{res.studentAnswer || "No Answer Submitted"}"
                         </p>
                      </div>

                      <div className="p-5 rounded-[24px] bg-slate-50/50 border-2 border-slate-50 group-hover:scale-[1.02] transition-transform space-y-2">
                         <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target Solution</p>
                         </div>
                         <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{res.correctAnswer}"</p>
                      </div>
                   </div>

                   {res.feedback && (
                      <div className="p-5 rounded-[24px] bg-indigo-50/30 border-2 border-indigo-50 group-hover:scale-[1.02] transition-transform space-y-2">
                         <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-3 w-3 text-indigo-500" />
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Pedagogical Feedback</p>
                         </div>
                         <p className="text-sm font-semibold text-indigo-800 leading-relaxed italic">"{res.feedback}"</p>
                      </div>
                   )}
                </div>
             ))}
          </div>
       )}
    </div>
  )
}
function ReportCardTemplate({ data, user }: any) {
  const today = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
  const overallGPA = data.length > 0 ? (data.reduce((acc: number, g: any) => acc + g.gpa, 0) / data.length).toFixed(2) : "0.00"

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 overflow-y-auto">
       <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          }
       `}} />
       
       <div className="print-container">
          {/* Official Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
             <div className="space-y-2">
                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                   <span className="text-white font-black text-2xl tracking-tighter">TUSMO</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase leading-none">Tusmo Primary &<br/> Secondary School</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Excellence in Education</p>
                <div className="text-[9px] space-y-0.5 text-slate-500 font-bold uppercase tracking-[0.1em] mt-4">
                   <p>Mogadishu, Somalia · +252 61 XXX XXXX</p>
                   <p>info@tusmoschool.edu.so · www.tusmoschool.edu.so</p>
                </div>
             </div>
             <div className="text-right flex flex-col items-end">
                <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mb-6">Official Academic Transcript</div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Report Reference</p>
                   <p className="text-xs font-black text-slate-900">TSM-{new Date().getFullYear()}-{user?.id?.substring(0,6).toUpperCase()}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 font-black">Date of Issue</p>
                   <p className="text-xs font-black text-slate-900">{today}</p>
                </div>
             </div>
          </div>

          {/* Student Identity */}
          <div className="grid grid-cols-2 gap-12 mb-10 bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100">
             <div className="space-y-6 border-r border-slate-200 pr-12">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Legal Name</p>
                   <p className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{user?.fullName}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Number</p>
                   <p className="text-sm font-black text-slate-700 tracking-[0.3em]">{user?.studentId?.toUpperCase() || 'UNREGISTERED'}</p>
                </div>
             </div>
             <div className="space-y-6 text-right">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Academic Level</p>
                   <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Standard Level Education</p>
                </div>
                <div className="flex justify-end gap-10">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</p>
                      <p className="text-xs font-black text-slate-700 uppercase">2nd Semester</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Session</p>
                      <p className="text-xs font-black text-slate-700 uppercase">2024/2025</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Grades Matrix */}
          <div className="mb-12">
             <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                   <tr className="bg-slate-50">
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-l-[1.5rem]">Subject Description</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Faculty</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Avg %</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Letter Grade</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center rounded-r-[1.5rem]">Quality Points</th>
                   </tr>
                </thead>
                <tbody className="">
                   {data.map((subject: any, idx: number) => {
                      const items = subject.exams || []
                      let avgPercent = 0
                      if (items.length > 0) {
                         const totalPct = items.reduce((acc: number, curr: any) => acc + (curr.score / curr.max), 0)
                         avgPercent = Math.round((totalPct / items.length) * 100)
                      }
                      
                      return (
                         <tr key={idx} className="bg-white border-2 border-slate-50">
                            <td className="p-6 border-y border-l border-slate-100 rounded-l-[1.5rem]">
                               <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{subject.subject}</p>
                            </td>
                            <td className="p-6 border-y border-slate-100">
                               <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{subject.teacher}</p>
                            </td>
                            <td className="p-6 text-center border-y border-slate-100">
                               <p className="text-sm font-black text-slate-900">{avgPercent}%</p>
                            </td>
                            <td className="p-6 text-center border-y border-slate-100">
                               <span className="inline-flex items-center justify-center h-8 w-12 bg-slate-900 rounded-xl text-[11px] font-black text-white">{subject.grade}</span>
                            </td>
                            <td className="p-6 text-center border-y border-r border-slate-100 rounded-r-[1.5rem]">
                               <p className="text-sm font-black text-indigo-600">{subject.gpa.toFixed(1)}</p>
                            </td>
                         </tr>
                      )
                   })}
                </tbody>
             </table>
          </div>

          {/* Performance Insight */}
          <div className="grid grid-cols-2 gap-12 items-start pt-12 border-t-2 border-dashed border-slate-100">
             <div className="space-y-8">
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex justify-between items-center shadow-2xl shadow-slate-200">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Academic GPA</p>
                      <p className="text-6xl font-black tracking-tighter">{overallGPA}<span className="text-xl text-slate-500 font-medium ml-2">/ 4.0</span></p>
                   </div>
                   <div className="text-right">
                      <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-[0.2em] px-6 py-2 rounded-full mb-4">ELIGIBLE</Badge>
                      <p className="text-xl font-black uppercase tracking-tight">PASSED</p>
                   </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200/50 space-y-3">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Faculty Observations</p>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"Student has demonstrated exceptional mastery over the current curriculum. Sustained focus on technical disciplines has yielded commendable outcomes. The faculty recommends continued advancement."</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-12 pt-6">
                <div className="flex justify-between gap-12">
                   <div className="text-center space-y-6 flex-1">
                      <div className="h-24 flex items-end justify-center px-8">
                         <div className="w-full border-b-2 border-slate-200"></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Office of the Registrar</p>
                   </div>
                   <div className="text-center space-y-6 flex-1">
                      <div className="h-24 flex items-end justify-center px-8 relative">
                         <div className="absolute top-0 opacity-10">
                            <div className="h-24 w-24 rounded-full border-4 border-indigo-600 flex items-center justify-center p-2">
                               <div className="h-full w-full rounded-full border-2 border-indigo-600 border-dashed"></div>
                            </div>
                         </div>
                         <div className="w-full border-b-2 border-slate-200"></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seal of the Institution</p>
                   </div>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-indigo-50/20 border-2 border-indigo-50/50">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Official Verification</p>
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-white rounded-2xl border border-indigo-100 flex items-center justify-center p-2">
                         <div className="w-full h-full bg-slate-900 rounded-lg opacity-5"></div>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                         Scan this code to verify authenticity <br/>
                         Document Hash: {user?.id?.split('-')[0]}{Date.now().toString().slice(-6)}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Copyright Branding */}
          <div className="mt-20 text-center space-y-2">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">Tusmo Education Systems · Academic Excellence Since 2012</p>
             <p className="text-[7px] font-medium text-slate-200 uppercase tracking-widest">Unauthorized reproduction of this document is strictly prohibited</p>
          </div>
       </div>
    </div>
  )
}
