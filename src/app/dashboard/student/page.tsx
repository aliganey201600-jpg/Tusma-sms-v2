"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
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
  BookOpen,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Flame,
  ChevronRight,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { verifyStudentId } from "./actions"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ─── Mock Data ───────────────────────────────────────────────────────────────
const courses = [
  { name: "Mathematics", progress: 65, grade: "B+", color: "violet" },
  { name: "Physics", progress: 42, grade: "B", color: "blue" },
  { name: "Computer Science", progress: 88, grade: "A", color: "emerald" },
  { name: "History", progress: 55, grade: "B-", color: "amber" },
]

const deadlines = [
  { title: "Algebra Quiz", due: "Tomorrow", urgency: "high", subject: "Math" },
  { title: "Physics Lab Report", due: "Friday", urgency: "medium", subject: "Physics" },
  { title: "History Essay", due: "Next Mon", urgency: "low", subject: "History" },
  { title: "CS Project Phase 2", due: "Next Wed", urgency: "low", subject: "CS" },
]

const recentGrades = [
  { subject: "Computer Science", title: "Mid-term Exam", grade: "A", score: "94/100", date: "Mar 10" },
  { subject: "Mathematics", title: "Chapter 5 Test", grade: "B+", score: "87/100", date: "Mar 7" },
  { subject: "Physics", title: "Lab Practical", grade: "B", score: "80/100", date: "Mar 5" },
]

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = React.useState(0)
  const { user, loading: userLoading } = useCurrentUser()

  // Display name: real name from session, or skeleton while loading
  const firstName = user?.firstName || (userLoading ? null : "Student")
  const [verifying, setVerifying] = React.useState(false)
  const [studentIdInput, setStudentIdInput] = React.useState("")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentIdInput.trim()) return toast.error("Fadlan geli Student ID-gaaga.")
    
    setVerifying(true)
    try {
      const res = await verifyStudentId(user?.id || "", studentIdInput)
      if (res.success) {
        toast.success("Hambalyo! Account-kaaga waa la xaqiijiyay.")
        window.location.reload()
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error("Cillad ayaa dhacday.")
    } finally {
      setVerifying(false)
    }
  }

  // Determine if the student is unverified
  // NOTE: In a real app, this would check if user.student.classId is null or status is PENDING
  const isUnverified = !userLoading && user && (!user.studentId || user.studentId === "N/A")

  if (isUnverified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl shadow-violet-200/50 rounded-[40px] p-8 md:p-12 text-center space-y-8 bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />
          
          <div className="space-y-4">
            <div className="h-20 w-20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-violet-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
              Xaqiiji Account-kaaga
            </h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
              Fadlan geli Student ID-gaaga si aad u aragto fasalkaaga, maadooyinkaaga iyo buundooyinkaaga.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Identification ID</label>
              <Input 
                placeholder="TUSMO-2024-XXX" 
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-5 font-bold text-slate-700 focus-visible:ring-violet-500"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-base shadow-xl shadow-violet-200 transition-all hover:scale-[1.02] disabled:opacity-50"
              disabled={verifying}
            >
              {verifying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
              Xaqiiji Hadda
            </Button>
          </form>

          <p className="text-[11px] font-bold text-slate-400">
            Hadii aadan lahayn ID, fadlan la xiriir <br /> maamulka iskuulka.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Student Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
            Welcome back,{" "}
            {userLoading ? (
              <span className="inline-block h-10 w-40 bg-violet-100 animate-pulse rounded-xl align-middle" />
            ) : (
              <span className="text-violet-600">{firstName}.</span>
            )}
          </h1>
          <p className="text-slate-500 font-medium text-base max-w-xl">
            You have <strong className="text-violet-600">2 assignments</strong> due this week and your GPA is trending upward. Keep it up!
          </p>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-4 p-5 rounded-[28px] bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-2xl shadow-orange-200 shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Flame className="h-8 w-8 text-white fill-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Study Streak</p>
            <p className="text-4xl font-black leading-none">14</p>
            <p className="text-xs text-orange-100 font-semibold">days in a row</p>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Current Courses"
          value="6"
          icon={<BookOpen className="h-6 w-6" />}
          color="violet"
          desc="Semester 2"
          href="/dashboard/student/courses"
        />
        <StatCard
          title="Current GPA"
          value="3.7"
          icon={<GraduationCap className="h-6 w-6" />}
          color="emerald"
          desc="+0.2 this term"
          href="/dashboard/student/grades"
        />
        <StatCard
          title="Pending Tasks"
          value="4"
          icon={<ClipboardList className="h-6 w-6" />}
          color="amber"
          desc="2 due in 48h"
          href="/dashboard/student/assignments"
        />
        <StatCard
          title="Attendance"
          value="98%"
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="blue"
          desc="Excellent record"
          href="/dashboard/student/attendance"
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8">

        {/* ── Left: Course Progress + Action Cards ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Course Progress */}
          <Card className="border-none shadow-2xl shadow-violet-50/50 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Course Progress</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Estimated completion for current semester.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-violet-50" asChild>
                <Link href="/dashboard/student/courses">
                  <ArrowUpRight className="h-5 w-5 text-violet-600" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-6">
              {courses.map((course, i) => (
                <CourseProgressItem key={i} course={course} />
              ))}
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link href="/dashboard/student/grades">
              <Card className="rounded-[28px] border-none bg-violet-600 p-7 text-white shadow-2xl shadow-violet-200 group hover:scale-[1.02] transition-transform cursor-pointer">
                <Award className="h-10 w-10 text-white fill-white/20 mb-5" />
                <h4 className="text-2xl font-black leading-tight mb-2">My Grades <br />& Transcript.</h4>
                <p className="text-violet-100 text-sm font-medium mb-5">View all your exam results, GPA breakdown, and academic history.</p>
                <div className="flex items-center gap-2 text-sm font-black">
                  View Grades <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/student/attendance">
              <Card className="rounded-[28px] border-none bg-slate-900 p-7 text-white shadow-2xl shadow-slate-200 group hover:scale-[1.02] transition-transform cursor-pointer">
                <Target className="h-10 w-10 text-white fill-white/20 mb-5" />
                <h4 className="text-2xl font-black leading-tight mb-2">Attendance <br />Record.</h4>
                <p className="text-slate-400 text-sm font-medium mb-5">Track your daily attendance history and spot any patterns.</p>
                <div className="flex items-center gap-2 text-sm font-black">
                  View Attendance <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* ── Right: Deadlines + Grades ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Upcoming Deadlines */}
          <Card className="border-none shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Upcoming Deadlines</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Don't miss these submissions.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-50" asChild>
                <Link href="/dashboard/student/assignments">
                  <ArrowUpRight className="h-5 w-5 text-amber-500" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-3">
              {deadlines.map((task, i) => (
                <DeadlineItem key={i} task={task} />
              ))}
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card className="border-none shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Recent Grades</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Latest exam results.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-50" asChild>
                <Link href="/dashboard/student/grades">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 md:px-8 space-y-4 pb-6">
                {recentGrades.map((g, i) => (
                  <GradeItem key={i} grade={g} />
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full h-14 rounded-none border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                asChild
              >
                <Link href="/dashboard/student/grades">View All Grades</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ title, value, icon, color, desc, href }: any) {
  const colorMap: any = {
    violet: "bg-violet-50 text-violet-600 shadow-violet-100/50",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100/50",
    blue: "bg-blue-50 text-blue-600 shadow-blue-100/50",
  }
  return (
    <Link href={href}>
      <Card className="border-none shadow-xl shadow-slate-100 rounded-[28px] p-6 space-y-4 group hover:scale-[1.02] transition-transform bg-white cursor-pointer">
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", colorMap[color])}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
        {desc && (
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <ArrowUpRight className="h-3 w-3 text-violet-500" />
            {desc}
          </p>
        )}
      </Card>
    </Link>
  )
}

function CourseProgressItem({ course }: any) {
  const colorMap: any = {
    violet: "bg-violet-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full shrink-0", colorMap[course.color])} />
          <span className="text-sm font-bold text-slate-700">{course.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full text-[10px] font-black border-slate-100 text-slate-500 py-0.5"
          >
            {course.grade}
          </Badge>
          <span className="text-xs font-bold text-slate-400">{course.progress}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", colorMap[course.color])}
          style={{ width: `${course.progress}%` }}
        />
      </div>
    </div>
  )
}

function DeadlineItem({ task }: any) {
  const urgencyMap: any = {
    high: { badge: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" },
    medium: { badge: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-500" },
    low: { badge: "bg-slate-50 text-slate-500 border-slate-100", dot: "bg-slate-400" },
  }
  const u = urgencyMap[task.urgency]
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-dashed border-slate-100 hover:bg-slate-50 transition-colors group">
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
        <Clock className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-700 truncate">{task.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{task.subject}</p>
      </div>
      <Badge variant="outline" className={cn("rounded-full text-[9px] font-black py-0.5 shrink-0", u.badge)}>
        <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 inline-block", u.dot)} />
        {task.due}
      </Badge>
    </div>
  )
}

function GradeItem({ grade }: any) {
  const gradeColor: any = {
    "A": "bg-emerald-50 text-emerald-700",
    "B+": "bg-blue-50 text-blue-700",
    "B": "bg-violet-50 text-violet-700",
    "B-": "bg-amber-50 text-amber-700",
    "C": "bg-orange-50 text-orange-700",
  }
  return (
    <div className="flex items-center gap-4 group">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 transition-all", gradeColor[grade.grade] || "bg-slate-50 text-slate-600")}>
        {grade.grade}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{grade.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{grade.subject}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-slate-700">{grade.score}</p>
        <p className="text-[10px] font-bold text-slate-400">{grade.date}</p>
      </div>
    </div>
  )
}
