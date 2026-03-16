"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Upload,
  Search,
  BookOpen,
  Atom,
  History,
  PenTool,
  FlaskConical,
  Code2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentAssignments } from "./actions"
import { format, isPast, differenceInDays } from "date-fns"

const filters = [
  { label: "All Tasks", value: "All" },
  { label: "Active", value: "Pending" },
  { label: "Done", value: "Submitted" },
  { label: "Overdue", value: "Overdue" }
]

const getSubjectIcon = (subject: string) => {
  const s = subject.toLowerCase()
  if (s.includes('science') || s.includes('physics') || s.includes('chem')) return Atom
  if (s.includes('math') || s.includes('algebra')) return TrendingUp
  if (s.includes('history')) return History
  if (s.includes('english') || s.includes('literature')) return PenTool
  if (s.includes('bio')) return FlaskConical
  if (s.includes('computer') || s.includes('code') || s.includes('tech')) return Code2
  return BookOpen
}

export default function StudentAssignmentsPage() {
  const { user } = useCurrentUser()
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (user?.studentId) {
        const data = await getStudentAssignments(user.studentId)
        
        const formatted = data.map(a => {
          const isSubmitted = a.grades && a.grades.length > 0
          const overdue = isPast(new Date(a.dueDate)) && !isSubmitted
          
          let status = "pending"
          if (isSubmitted) status = "submitted"
          else if (overdue) status = "overdue"
          
          let urgency = "low"
          if (isSubmitted) urgency = "done"
          else if (overdue) urgency = "high"
          else {
            const daysLeft = differenceInDays(new Date(a.dueDate), new Date())
            if (daysLeft <= 2) urgency = "high"
            else if (daysLeft <= 5) urgency = "medium"
          }

          return {
            id: a.id,
            title: a.title,
            subject: a.course.name,
            category: a.course.category || "General",
            teacher: `${a.course.teacher.firstName} ${a.course.teacher.lastName}`,
            due: format(new Date(a.dueDate), "MMM dd, yyyy"),
            dueDate: new Date(a.dueDate),
            urgency,
            status,
            type: a.title.toLowerCase().includes('quiz') ? 'Quiz' 
                : a.title.toLowerCase().includes('project') ? 'Project'
                : a.title.toLowerCase().includes('essay') ? 'Essay'
                : 'Assignment',
            description: a.description || "No description provided.",
            grades: a.grades
          }
        })
        
        setAssignments(formatted)
      }
      setLoading(false)
    }
    loadData()
  }, [user?.studentId])

  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    if (activeFilter === "All") return true
    if (activeFilter === "Pending") return a.status === "pending"
    if (activeFilter === "Submitted") return a.status === "submitted"
    if (activeFilter === "Overdue") return a.status === "overdue"
    return true
  })

  const counts = {
    pending: assignments.filter((a) => a.status === "pending").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    overdue: assignments.filter((a) => a.status === "overdue").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/5 to-amber-500/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 shadow-xl shadow-slate-200 text-white">
              <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Assignment Command Center</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              Elevate Your <span className="text-indigo-600">Potential.</span>
            </h1>
            <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed">
              Track your academic milestones. You have <span className="text-indigo-600 underline decoration-indigo-200 decoration-4">{counts.pending} active</span> and <span className="text-red-500 underline decoration-red-100 decoration-4">{counts.overdue} overdue</span> submissions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <StatCard label="Pending" value={counts.pending} color="indigo" />
            <StatCard label="Critical" value={counts.overdue} color="red" />
            <StatCard label="Success" value={counts.submitted} color="emerald" className="hidden sm:flex" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-3 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex gap-1.5 p-1 bg-slate-50 rounded-[24px] w-full md:w-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              className={cn(
                "px-6 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                activeFilter === f.value
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200 scale-105"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search tasks or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-[24px] bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 outline-none text-sm font-bold transition-all text-slate-700 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
        {filtered.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[48px] border-2 border-dashed border-slate-100 space-y-8 group transition-colors hover:border-indigo-100">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
              <div className="h-28 w-28 bg-slate-50 rounded-[40px] flex items-center justify-center relative z-10">
                <ClipboardList className="h-12 w-12 text-slate-200 group-hover:text-indigo-600 transition-all duration-700" />
              </div>
              <Badge className="absolute -top-2 -right-2 bg-indigo-600 border-4 border-white h-10 w-10 p-0 flex items-center justify-center rounded-2xl shadow-xl">0</Badge>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-slate-900">Workspace is Clear</h3>
              <p className="text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                All caught up! No {activeFilter.toLowerCase()} assignments detected in your current pipeline.
              </p>
            </div>
            <Button 
               variant="outline" 
               className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 hover:bg-slate-50"
               onClick={() => {setActiveFilter("All"); setSearchQuery("")}}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, className }: { label: string, value: number, color: 'indigo' | 'red' | 'emerald', className?: string }) {
  const colors = {
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-100 text-indigo-100",
    red: "from-rose-500 to-red-600 shadow-red-100 text-red-100",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-100 text-emerald-100"
  }
  return (
    <div className={cn("relative group overflow-hidden rounded-[28px] p-6 bg-gradient-to-br transition-all duration-500 hover:scale-105 hover:shadow-2xl flex flex-col justify-between h-32 md:h-40", colors[color], className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
        <TrendingUp className="h-24 w-24" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">{label}</p>
      <h4 className="text-5xl md:text-6xl font-black tracking-tighter relative z-10">{value}</h4>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: any }) {
  const Icon = getSubjectIcon(assignment.subject)
  
  const statusConfig: any = {
    pending: { label: "Pending", bg: "bg-indigo-50 text-indigo-600", dot: "bg-indigo-500", shadow: "shadow-indigo-100" },
    overdue: { label: "Overdue", bg: "bg-rose-50 text-rose-600", dot: "bg-rose-500", shadow: "shadow-rose-100" },
    submitted: { label: "Completed", bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", shadow: "shadow-emerald-100" },
  }

  const urgencyConfig: any = {
    high: "bg-rose-500",
    medium: "bg-amber-400",
    low: "bg-slate-200",
    done: "bg-emerald-500",
  }

  const s = statusConfig[assignment.status]
  const grade = assignment.grades?.[0]

  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden bg-white group hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2 relative">
      <div className={cn("absolute top-0 left-0 w-2 h-full transition-all duration-700 group-hover:w-3", urgencyConfig[assignment.urgency])} />
      
      <CardContent className="p-8 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex gap-6 items-center flex-1">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-[30px] bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-inner">
               <Icon className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400 py-1 px-3">
                  {assignment.type}
                </Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{assignment.subject}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight mt-2 group-hover:text-indigo-600 transition-colors">
                {assignment.title}
              </h3>
            </div>
          </div>
          
          <Badge className={cn("rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] border-none shadow-xl transition-all duration-700 group-hover:scale-110", s.bg, s.shadow)}>
            <span className={cn("h-1.5 w-1.5 rounded-full mr-2 inline-block animate-pulse", s.dot)} />
            {s.label}
          </Badge>
        </div>

        <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
          {assignment.description}
        </p>

        {grade && (
          <div className="relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-100 flex items-center justify-between group/grade">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/grade:scale-150 transition-transform duration-1000">
                <TrendingUp className="h-20 w-20" />
             </div>
             <div className="space-y-1 relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">Performance Index</p>
                <div className="flex items-center gap-4">
                  <h4 className="text-5xl font-black tracking-tighter">{grade.score}%</h4>
                  {grade.score >= 90 && <Badge className="bg-white/20 text-white text-[10px] font-black border-none px-3">Legendary</Badge>}
                </div>
             </div>
             {grade.feedback && (
                <div className="hidden md:block text-right relative z-10">
                   <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 px-1 border-r-2 border-white/30">Instructor Feedback</p>
                   <p className="text-sm font-bold italic opacity-90">"{grade.feedback}"</p>
                </div>
             )}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-50 gap-6">
          <div className="flex items-center gap-10">
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Directed By</p>
              <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {assignment.teacher.charAt(0)}
                 </div>
                 <span className="text-xs font-bold text-slate-600">{assignment.teacher}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Final Deadline</p>
              <div className={cn("flex items-center gap-2 text-xs font-black transition-colors", assignment.status === "overdue" ? "text-red-500" : "text-slate-900")}>
                <Clock className="h-4 w-4" />
                {assignment.due}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {assignment.status !== "submitted" ? (
              <Button className="flex-1 md:flex-none h-14 px-10 rounded-[22px] bg-slate-900 text-white hover:bg-indigo-600 font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-2xl shadow-slate-200 group-hover:scale-105 gap-3">
                <Upload className="h-4 w-4" />
                Begin Mission
              </Button>
            ) : (
              <Button variant="ghost" className="flex-1 md:flex-none h-14 px-10 rounded-[22px] text-emerald-600 font-black text-[11px] uppercase tracking-widest gap-3 bg-emerald-50 cursor-default">
                <CheckCircle2 className="h-4 w-4" />
                Task Finalized
              </Button>
            )}
            <Button variant="outline" className="h-14 w-14 p-0 rounded-[22px] border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

