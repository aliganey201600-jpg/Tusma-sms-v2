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
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentAssignments } from "./actions"
import { format, isPast, differenceInDays } from "date-fns"

const filters = ["All", "Pending", "Submitted", "Overdue"]

export default function StudentAssignmentsPage() {
  const { user } = useCurrentUser()
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (user?.studentId) {
        const data = await getStudentAssignments(user.studentId)
        
        // Transform the DB structure to fit the UI format
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
            teacher: `${a.course.teacher.firstName} ${a.course.teacher.lastName}`,
            due: format(new Date(a.dueDate), "MMM dd, yyyy"),
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
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600">
            <ClipboardList className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Task Board</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            My <span className="text-amber-500">Assignments.</span>
          </h1>
          <p className="text-slate-500 font-medium">
            You have <strong className="text-amber-600">{counts.pending} pending</strong> and{" "}
            <strong className="text-red-600">{counts.overdue} overdue</strong> tasks.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-100 mb-1">Pending</p>
          <p className="text-5xl font-black">{counts.pending}</p>
        </div>
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Submitted</p>
          <p className="text-5xl font-black">{counts.submitted}</p>
        </div>
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-100 mb-1">Overdue</p>
          <p className="text-5xl font-black">{counts.overdue}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f}
            variant="ghost"
            className={cn(
              "rounded-2xl h-10 px-5 font-bold text-sm transition-all",
              activeFilter === f
                ? "bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-500"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[24px] border border-dashed border-slate-200">
            <ClipboardList className="h-12 w-12 mb-4 opacity-30 text-amber-500" />
            <p className="font-bold text-lg text-slate-600">No {activeFilter.toLowerCase()} assignments</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or view other statuses.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: any }) {
  const statusMap: any = {
    pending: { label: "Pending", bg: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
    overdue: { label: "Overdue", bg: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" },
    submitted: { label: "Submitted / Graded", bg: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  }

  const urgencyBorder: any = {
    high: "border-l-4 border-l-red-500",
    medium: "border-l-4 border-l-amber-400",
    low: "border-l-4 border-l-slate-200",
    done: "border-l-4 border-l-emerald-500",
  }

  const typeColor: any = {
    Quiz: "bg-violet-50 text-violet-700",
    Report: "bg-blue-50 text-blue-700",
    Project: "bg-indigo-50 text-indigo-700",
    Essay: "bg-amber-50 text-amber-700",
    Diagram: "bg-emerald-50 text-emerald-700",
    Assignment: "bg-slate-50 text-slate-700",
  }

  const s = statusMap[assignment.status]
  
  // See if there's a score
  const grade = assignment.grades && assignment.grades[0]

  return (
    <Card className={cn("border-none shadow-xl shadow-slate-100 rounded-[24px] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5", urgencyBorder[assignment.urgency])}>
      <CardContent className="p-6 space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("rounded-full text-[10px] font-black border-0 py-0.5", typeColor[assignment.type] || typeColor["Assignment"])}>
              {assignment.type}
            </Badge>
            <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px]">{assignment.subject}</span>
          </div>
          <Badge variant="outline" className={cn("rounded-full text-[9px] font-black border shrink-0", s.bg)}>
            <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 inline-block", s.dot)} />
            {s.label}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">{assignment.title}</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">{assignment.teacher}</p>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{assignment.description}</p>

        {grade && (
           <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Grade Received</p>
                <p className="text-sm font-bold text-emerald-800">{grade.score}%</p>
             </div>
             {grade.feedback && (
               <p className="text-xs text-emerald-700 italic max-w-[60%] truncate text-right">"{grade.feedback}"</p>
             )}
           </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className={cn("flex items-center gap-1.5 text-xs font-bold", assignment.status === "overdue" ? "text-red-500" : "text-slate-500")}>
            <Clock className="h-3.5 w-3.5" />
            Due: {assignment.due}
          </div>
          {assignment.status !== "submitted" ? (
            <Button size="sm" className="h-8 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-200 gap-1">
              <Upload className="h-3 w-3" />
              Upload Task
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs font-black text-emerald-600 gap-1 bg-emerald-50">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
