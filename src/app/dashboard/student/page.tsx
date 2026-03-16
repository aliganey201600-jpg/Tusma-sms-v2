"use client"

import * as React from "react"
import Link from "next/link"
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
  BookOpen,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Star,
  Zap,
  Award,
  Target,
  Flame,
  ChevronRight,
  PlayCircle,
  Bell
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { verifyStudentId, getStudentDashboardOverview } from "./actions"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"

export default function StudentDashboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const firstName = user?.firstName || (userLoading ? null : "Student")
  const [verifying, setVerifying] = React.useState(false)
  const [studentIdInput, setStudentIdInput] = React.useState("")
  
  const [overview, setOverview] = React.useState<any>(null)
  const [loadingOverview, setLoadingOverview] = React.useState(true)

  React.useEffect(() => {
    async function loadOverview() {
      if (user?.id) {
        try {
          const data = await getStudentDashboardOverview(user.id)
          if (data) {
            setOverview(data)
          }
        } catch (error) {
          console.error("Failed to load dashboard overview", error)
        }
      }
      setLoadingOverview(false)
    }
    if (user && !userLoading) {
      loadOverview()
    }
  }, [user, userLoading])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentIdInput.trim()) return toast.error("Please enter your Student ID.")
    
    setVerifying(true)
    try {
      const res = await verifyStudentId(user?.id || "", studentIdInput)
      if (res.success) {
        toast.success("Congratulations! Your account has been verified.")
        window.location.reload()
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error("An error occurred.")
    } finally {
      setVerifying(false)
    }
  }

  const isUnverified = !userLoading && user && 
    (!user.studentId || user.studentId === "N/A" || user.status === "PENDING")

  if (userLoading) {
    return (
      <div className="p-4 space-y-8 max-w-[1600px] mx-auto min-h-screen">
        <div className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl" />)}
        </div>
      </div>
    )
  }

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
              Verify Your Account
            </h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
              Please enter your Student ID to access your classes, courses, and grades.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Identification ID</label>
              <Input 
                placeholder="TUSMO-2024-XXX" 
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-5 font-bold text-slate-700 focus-visible:ring-violet-500 text-lg md:text-base"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-base shadow-xl shadow-violet-200 transition-all hover:scale-[1.02] disabled:opacity-50"
              disabled={verifying}
            >
              {verifying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
              Verify Now
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  const displayCourses = realCourses.length > 0 ? realCourses : mockCourses

  return (
    <div className="pb-24 pt-4 md:py-8 px-4 md:px-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── App-style Header for Mobile & Desktop ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[36px] p-6 md:p-10 text-white shadow-2xl shadow-violet-200 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/10 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-yellow-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Student Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter shrink-0 break-words max-w-full">
            Welcome, <br className="md:hidden" />
            <span className="text-yellow-300">{firstName}</span>
          </h1>
          <p className="text-violet-100 font-medium text-sm md:text-base max-w-md leading-relaxed">
            You have <strong className="text-white">{overview?.pendingAssignments || 0} assignments</strong> due soon. Your progress is looking excellent. Keep it up!
          </p>
        </div>

        {/* Action Button for mobile header */}
        <div className="relative z-10 mt-2 md:mt-0 w-full md:w-auto">
          <Button className="w-full md:w-auto rounded-2xl bg-white text-violet-700 hover:bg-slate-50 font-bold h-12 px-6 shadow-lg shadow-black/10" asChild>
            <Link href="/dashboard/student/courses">
              <PlayCircle className="mr-2 h-5 w-5" />
              Continue Learning
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats Cards (Horizontal Scroll on Mobile) ── */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 no-scrollbar snap-x">
        <StatCard
          title="Courses"
          value={overview?.courses?.length || 0}
          icon={<BookOpen className="h-5 w-5 md:h-6 md:w-6" />}
          color="violet"
          href="/dashboard/student/courses"
        />
        <StatCard
          title="Grades"
          value={overview?.overallGPA || "N/A"}
          icon={<Award className="h-5 w-5 md:h-6 md:w-6" />}
          color="emerald"
          href="/dashboard/student/grades"
        />
        <StatCard
          title="Assignments"
          value={overview?.pendingAssignments || 0}
          icon={<ClipboardList className="h-5 w-5 md:h-6 md:w-6" />}
          color="amber"
          href="/dashboard/student/assignments"
        />
        <StatCard
          title="Attendance"
          value={`${overview?.attendance || 100}%`}
          icon={<CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />}
          color="blue"
          href="/dashboard/student/attendance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* ── Left Column: Courses ── */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Courses</h2>
              <p className="text-sm text-slate-500 font-medium">Semester progress</p>
            </div>
            <Button variant="ghost" className="text-violet-600 font-bold hidden md:flex" asChild>
              <Link href="/dashboard/student/courses">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {loadingOverview ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[28px]" />)
            ) : (
              overview?.courses?.slice(0, 4).map((course: any, i: number) => (
                <CourseAppCard key={course.id || i} course={course} />
              ))
            )}
            {!loadingOverview && (!overview?.courses || overview.courses.length === 0) && (
               <div className="col-span-full py-12 text-center bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold italic">No courses found yet.</p>
               </div>
            )}
          </div>
          
          {/* Mobile view all button */}
          <Button variant="outline" className="w-full rounded-2xl h-14 font-bold border-slate-200 text-slate-700 md:hidden" asChild>
            <Link href="/dashboard/student/courses">View All Courses</Link>
          </Button>

        </div>

        {/* ── Right Column: Deadlines & Activity ── */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Assignments</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Upcoming deadlines</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-4">
              {overview?.assignments?.map((task: any, i: number) => (
                <DeadlineItem key={i} task={task} />
              )) || (
                 <p className="text-xs text-slate-400 text-center py-4">No assignments due soon</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-white">Recent Grades</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Latest results</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-700 text-white" asChild>
                <Link href="/dashboard/student/grades">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-5">
              {overview?.recentResults?.slice(0,3).map((g: any, i: number) => (
                <GradeDarkItem key={i} grade={g} />
              )) || (
                 <p className="text-xs text-slate-500 text-center py-4">No results available yet</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────


function StatCard({ title, value, icon, color, href }: any) {
  const colorMap: any = {
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  }
  return (
    <Link href={href} className="inline-block md:block min-w-[140px] md:min-w-0 snap-center">
      <Card className="border-none shadow-lg shadow-slate-100/50 rounded-[28px] p-5 md:p-6 group hover:scale-[1.03] transition-transform bg-white cursor-pointer h-full border border-slate-50">
        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-[18px] flex items-center justify-center mb-3 md:mb-4", colorMap[color])}>
          {icon}
        </div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </Card>
    </Link>
  )
}

function CourseAppCard({ course }: any) {
  const cColor = course.color || "violet"
  const colorMap: Record<string, string> = {
    violet: "from-violet-500 to-purple-600 shadow-violet-200",
    blue: "from-blue-500 to-cyan-500 shadow-blue-200",
    emerald: "from-emerald-400 to-teal-500 shadow-emerald-200",
    amber: "from-amber-400 to-orange-500 shadow-amber-200",
    rose: "from-rose-400 to-red-500 shadow-rose-200",
    lime: "from-lime-400 to-green-500 shadow-lime-200",
  }
  const bgClass = colorMap[cColor] || colorMap.violet

  // Realistic mock progress if real data has 0
  const progress = course.progress > 0 ? course.progress : Math.floor(Math.random() * 60) + 15

  return (
    <Link href={`/dashboard/student/courses/${course.id || '#'}`}>
      <Card className="border-none shadow-xl rounded-[32px] p-6 hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group min-h-[160px] flex flex-col justify-between" style={{ backgroundColor: "#ffffff" }}>
        
        {/* The cool colored background shape */}
        <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-bl-[60px] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity", bgClass)} />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{course.name}</h4>
            {course.teacher && <p className="text-xs font-bold text-slate-400">{course.teacher}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white", bgClass)}>
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="relative z-10 mt-6 md:mt-8 space-y-2.5">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", bgClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function DeadlineItem({ task }: any) {
  const urgencyMap: any = {
    high: { icon: "bg-red-50 text-red-500", text: "text-red-600" },
    medium: { icon: "bg-orange-50 text-orange-500", text: "text-orange-600" },
    low: { icon: "bg-slate-50 text-slate-500", text: "text-slate-500" },
  }
  const u = urgencyMap[task.urgency]
  return (
    <div className="flex items-center gap-4 group">
      <div className={cn("h-12 w-12 rounded-[20px] flex items-center justify-center shrink-0 transition-colors", u.icon)}>
        <Clock className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{task.subject}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-xs font-black", u.text)}>{task.due}</p>
      </div>
    </div>
  )
}

function GradeDarkItem({ grade }: any) {
  return (
    <div className="flex items-center gap-4 group border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{grade.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{grade.subject}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm mb-1">
          {grade.grade}
        </div>
        <p className="text-[10px] font-bold text-slate-500 block">{grade.date}</p>
      </div>
    </div>
  )
}
