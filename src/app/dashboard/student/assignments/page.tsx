"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Star,
  ChevronRight,
} from "lucide-react"

const assignments = [
  {
    id: 1,
    title: "Algebra Quiz",
    subject: "Mathematics",
    teacher: "Mr. Abdi Warsame",
    due: "Tomorrow, Mar 16",
    urgency: "high",
    status: "pending",
    type: "Quiz",
    description: "Chapters 7-9: Integration, derivatives, and limits.",
    progress: 30,
  },
  {
    id: 2,
    title: "Physics Lab Report",
    subject: "Physics",
    teacher: "Ms. Fadumo Ali",
    due: "Friday, Mar 18",
    urgency: "medium",
    status: "in_progress",
    type: "Report",
    description: "Write a detailed report on the pendulum experiment.",
    progress: 65,
  },
  {
    id: 3,
    title: "CS Project — Phase 2",
    subject: "Computer Science",
    teacher: "Mr. Khalid Hassan",
    due: "Next Wed, Mar 20",
    urgency: "medium",
    status: "in_progress",
    type: "Project",
    description: "Implement sorting algorithms and measure runtime complexity.",
    progress: 80,
  },
  {
    id: 4,
    title: "History Essay",
    subject: "History",
    teacher: "Ms. Hodan Jama",
    due: "Next Mon, Mar 22",
    urgency: "low",
    status: "pending",
    type: "Essay",
    description: "1500-word essay on the causes of World War I.",
    progress: 0,
  },
  {
    id: 5,
    title: "English Book Review",
    subject: "English Literature",
    teacher: "Mr. Mahad Yusuf",
    due: "Mar 24",
    urgency: "low",
    status: "pending",
    type: "Essay",
    description: "Review of 'Animal Farm' — focus on symbolism.",
    progress: 10,
  },
  {
    id: 6,
    title: "Biology Cell Diagram",
    subject: "Biology",
    teacher: "Ms. Sagal Omar",
    due: "Mar 12",
    urgency: "done",
    status: "submitted",
    type: "Diagram",
    description: "Detailed labeled diagram of animal and plant cells.",
    progress: 100,
  },
]

const filters = ["All", "Pending", "In Progress", "Submitted"]

export default function StudentAssignmentsPage() {
  const [activeFilter, setActiveFilter] = React.useState("All")

  const filtered = assignments.filter((a) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Pending") return a.status === "pending"
    if (activeFilter === "In Progress") return a.status === "in_progress"
    if (activeFilter === "Submitted") return a.status === "submitted"
    return true
  })

  const counts = {
    pending: assignments.filter((a) => a.status === "pending").length,
    in_progress: assignments.filter((a) => a.status === "in_progress").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
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
            <strong className="text-blue-600">{counts.in_progress} in progress</strong>.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-xl shadow-red-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-100 mb-1">Pending</p>
          <p className="text-5xl font-black">{counts.pending}</p>
        </div>
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">In Progress</p>
          <p className="text-5xl font-black">{counts.in_progress}</p>
        </div>
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Submitted</p>
          <p className="text-5xl font-black">{counts.submitted}</p>
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
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-bold text-lg">No assignments here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: typeof assignments[0] }) {
  const statusMap: any = {
    pending: { label: "Pending", bg: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" },
    in_progress: { label: "In Progress", bg: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" },
    submitted: { label: "Submitted", bg: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
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
  }

  const s = statusMap[assignment.status]

  return (
    <Card className={cn("border-none shadow-xl shadow-slate-100 rounded-[24px] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5", urgencyBorder[assignment.urgency])}>
      <CardContent className="p-6 space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("rounded-full text-[10px] font-black border-0 py-0.5", typeColor[assignment.type])}>
              {assignment.type}
            </Badge>
            <span className="text-[11px] font-semibold text-slate-400">{assignment.subject}</span>
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

        <p className="text-xs text-slate-500 font-medium leading-relaxed">{assignment.description}</p>

        {/* Progress bar */}
        {assignment.status !== "submitted" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
              <span>Your progress</span>
              <span>{assignment.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Due: {assignment.due}
          </div>
          {assignment.status !== "submitted" ? (
            <Button size="sm" className="h-8 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-200 gap-1">
              <Upload className="h-3 w-3" />
              Submit
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs font-black text-emerald-600 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Submitted
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
