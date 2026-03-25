import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  ClipboardList, 
  Clock, 
  ArrowUpRight, 
  Star, 
  Zap, 
  ChevronRight, 
  PlayCircle, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Flame
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { getStudentDashboardOverview } from "./actions"
import { fetchStudentCourses } from "./courses/actions"
import { StudentDashboardClient, StreakShieldShop } from "./StudentDashboardClient"
import prisma from "@/lib/prisma"

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return <div>Fadlan soo gal mar kale.</div>
  }

  // Get user details from Prisma for consistency
  const student = await prisma.student.findUnique({
    where: { userId: authUser.id },
    include: { user: true }
  })

  const [coursesRes, overview] = await Promise.all([
    fetchStudentCourses(authUser.id),
    getStudentDashboardOverview(authUser.id)
  ])

  const courses = coursesRes.success ? coursesRes.courses : []
  const firstName = student?.firstName || authUser.user_metadata?.full_name?.split(" ")[0] || "Student"

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 pt-4 md:py-8 px-4 md:px-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* ── Professional Clean Header ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Student Portal</span>
              </div>
              {overview?.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                  <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-orange-600">{overview.currentStreak} Day Streak!</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Welcome back, <br className="md:hidden" />
              <span className="text-indigo-600">{firstName}</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-md leading-relaxed">
              You have <strong className="text-indigo-600">{overview?.pendingAssignments || 0} assignments</strong> due soon. Your progress is looking excellent.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <StudentDashboardClient 
                user={{ ...student, studentId: student?.id }} 
                overview={overview} 
              />
              <Button className="w-full md:w-auto rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-11 px-6 shadow-sm transition-all" asChild>
                <Link href="/dashboard/student/courses" scroll={false}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Learning
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards (Clean Modern SaaS style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="User Level"
          value={overview?.level || 1}
          icon={<Zap className="h-5 w-5 md:h-6 md:w-6" />}
          color="amber"
          href="#"
        />
        <StatCard
          title="Total XP"
          value={(overview?.totalXp || 0).toLocaleString()}
          icon={<Star className="h-5 w-5 md:h-6 md:w-6" />}
          color="emerald"
          href="/dashboard/student/leaderboard"
        />
        <StatCard
          title="Courses"
          value={overview?.coursesCount || courses.length || 0}
          icon={<BookOpen className="h-5 w-5 md:h-6 md:w-6" />}
          color="indigo"
          href="/dashboard/student/courses"
        />
        <StatCard
          title="Assignments"
          value={overview?.pendingAssignments || 0}
          icon={<ClipboardList className="h-5 w-5 md:h-6 md:w-6" />}
          color="rose"
          href="/dashboard/student/assignments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* ── Left Column: Courses ── */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Courses</h2>
              <p className="text-sm text-slate-500 font-medium">Semester progress overview</p>
            </div>
            <Button variant="ghost" className="text-indigo-600 font-bold hidden md:flex" asChild>
              <Link href="/dashboard/student/courses">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {courses.length > 0 ? (
              courses.slice(0, 4).map((course: any, i: number) => (
                <CourseAppCard key={course.id || i} course={course} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl">
                <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No courses assigned yet.</p>
              </div>
            )}
          </div>
          
          <Button variant="outline" className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 md:hidden" asChild>
            <Link href="/dashboard/student/courses">View All Courses</Link>
          </Button>
        </div>

        {/* ── Right Column: Deadlines & Shop ── */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Assignments</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Upcoming deadlines</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-4">
              {overview?.recentAssignments?.length > 0 ? (
                overview.recentAssignments.map((task: any, i: number) => (
                  <DeadlineItem key={i} task={task} />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">No assignments due soon</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold text-white">Recent Results</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Latest graded activities</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-800 text-white" asChild>
                <Link href="/dashboard/student/grades">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-5">
              {overview?.recentResults?.length > 0 ? (
                overview.recentResults.map((g: any, i: number) => (
                  <GradeItem key={i} grade={g} isDark />
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4 italic">No recent results recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* XP Economy: Streak Shield Shop (Client Component for interaction) */}
          <StreakShieldShop overview={overview} user={{ ...student, studentId: student?.id }} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, href }: any) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  }
  return (
    <Link href={href}>
      <Card className="border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 group hover:translate-y-[-2px] transition-all bg-white cursor-pointer h-full border">
        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 border", colorMap[color])}>
          {icon}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </Card>
    </Link>
  )
}

function CourseAppCard({ course }: any) {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-600",
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-orange-600",
    rose: "bg-rose-600",
    lime: "bg-lime-600",
  }
  const accentClass = colorMap[course.color] || colorMap.violet

  return (
    <Link href={`/dashboard/student/courses/${course.id || '#'}`}>
      <Card className="border border-slate-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer bg-white min-h-[160px] flex flex-col justify-between group">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{course.name}</h4>
            <p className="text-xs font-semibold text-slate-400">{course.teacher || "Faculty"}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm", accentClass)}>
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 md:mt-8 space-y-2.5">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500 text-xs">Progress</span>
            <span className="text-slate-900 text-xs">{course.progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", accentClass)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function DeadlineItem({ task }: any) {
  const urgencyMap: any = {
    high: { icon: "bg-red-50 text-red-500 border-red-100", text: "text-red-600" },
    medium: { icon: "bg-orange-50 text-orange-500 border-orange-100", text: "text-orange-600" },
    low: { icon: "bg-slate-50 text-slate-500 border-slate-100", text: "text-slate-500" },
  }
  const u = urgencyMap[task.urgency || 'low']
  return (
    <div className="flex items-center gap-4 group border-b border-slate-50 last:border-0 pb-4 last:pb-0">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border", u.icon)}>
        <Clock className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{task.subject}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-[10px] font-bold", u.text)}>{task.due}</p>
      </div>
    </div>
  )
}

function GradeItem({ grade, isDark }: { grade: any, isDark?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-4 group pb-4 last:border-0 last:pb-0",
      isDark ? "border-b border-slate-800" : "border-b border-slate-50"
    )}>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold truncate", isDark ? "text-white" : "text-slate-900")}>{grade.title}</p>
        <p className="text-[11px] font-semibold text-slate-500">{grade.subject}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-sm mb-1 border border-emerald-500/20">
          {grade.grade}
        </div>
        <p className="text-[10px] font-semibold text-slate-500 block">{grade.date}</p>
      </div>
    </div>
  )
}
