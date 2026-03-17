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
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  Clock,
  Play,
  Star,
  ChevronRight,
  Users,
  ArrowUpRight,
  Filter,
  Sparkles,
  Zap,
  CheckCircle2,
  GraduationCap
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { fetchStudentCourses } from "./actions"
import { toast } from "sonner"

export default function StudentCoursesPage() {
  const [search, setSearch] = React.useState("")
  const { user, loading: userLoading } = useCurrentUser()
  const [courses, setCourses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (user?.id) {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const res = await fetchStudentCourses(user?.id || "")
      if (res.success) {
        setCourses(res.courses || [])
      } else {
        toast.error(res.error || "Failed to load courses")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filtered = (courses || []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  )

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] p-10 space-y-8 max-w-[1400px] mx-auto">
        <div className="h-40 w-full bg-slate-200/50 rounded-[3rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white rounded-[3rem] animate-pulse border border-slate-100" />)}
        </div>
      </div>
    )
  }

  const avgProgress = courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length) : 0

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-40">
      {/* ── Premium Hero ── */}
      <section className="relative pt-12 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e510,transparent_50%)]" />
           <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#6366f108,transparent_50%)]" />
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-6">
            <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
               <Sparkles className="h-3 w-3 mr-2" /> Semester Spring 2026
            </Badge>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                My <span className="text-indigo-400">Learning</span> Journey.
              </h1>
              <p className="text-slate-400 font-medium text-lg max-w-xl">
                 You have <span className="text-white font-bold">{courses.length} active courses</span> this term. 
                 Keep pushing to reach your goal of 100% completion!
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  placeholder="Find a course..."
                  className="pl-11 h-16 w-full md:w-80 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 transition-all font-bold border-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest gap-3 transition-all">
                <Filter className="h-4 w-4" /> Filter
             </Button>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-12 relative z-20 space-y-12">
        {/* ── Stats Matrix ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Enrolled Courses", value: courses.length.toString(), icon: BookOpen, color: "text-indigo-500" },
            { label: "Completed Items", value: courses.reduce((acc, c) => acc + (c.completedLessons || 0), 0).toString(), icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Overall Progress", value: `${avgProgress}%`, icon: Zap, color: "text-amber-500" },
            { label: "Current GPA", value: "3.85", icon: GraduationCap, color: "text-rose-500" },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-6 group hover:scale-[1.02] transition-all">
               <div className="flex items-center gap-5">
                  <div className={cn("h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center transition-all group-hover:scale-110", s.color)}>
                     <s.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                  </div>
               </div>
            </Card>
          ))}
        </div>

        {/* ── Course Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-white rounded-[3rem] border-2 border-dashed border-slate-100 py-32 flex flex-col items-center justify-center text-slate-400 space-y-6">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center">
                 <BookOpen className="h-10 w-10 opacity-30" />
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-slate-900 tracking-tight">No courses match your search</p>
                <p className="text-slate-400 font-medium">Try refining your search terms or filters.</p>
              </div>
              <Button onClick={() => setSearch("")} variant="outline" className="rounded-xl h-12 uppercase tracking-widest text-[10px] font-black border-2">Clear Search</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  const colorMap: any = {
    violet: { bar: "bg-indigo-500", shadow: "shadow-indigo-500/10", accent: "bg-indigo-50 text-indigo-600", mesh: "from-indigo-500/5 to-transparent" },
    blue: { bar: "bg-blue-500", shadow: "shadow-blue-500/10", accent: "bg-blue-50 text-blue-600", mesh: "from-blue-500/5 to-transparent" },
    emerald: { bar: "bg-emerald-500", shadow: "shadow-emerald-500/10", accent: "bg-emerald-50 text-emerald-600", mesh: "from-emerald-500/5 to-transparent" },
    amber: { bar: "bg-amber-500", shadow: "shadow-amber-500/10", accent: "bg-amber-50 text-amber-600", mesh: "from-amber-500/5 to-transparent" },
    rose: { bar: "bg-rose-500", shadow: "shadow-rose-500/10", accent: "bg-rose-50 text-rose-600", mesh: "from-rose-500/5 to-transparent" },
  }
  const c = colorMap[course.color] || colorMap.violet

  return (
    <Card className="border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white group hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 relative cursor-default">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 z-0", c.mesh)} />
      
      <div className="p-10 space-y-8 relative z-10">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110", c.bar, "text-white")}>
            <BookOpen className="h-7 w-7" />
          </div>
          <Badge className={cn("rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 border-none shadow-sm", c.accent)}>
            Grade {course.grade}
          </Badge>
        </div>

        <div className="space-y-2">
           <h3 className="text-2xl font-black text-slate-900 leading-[1.15] tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{course.name}</h3>
           <div className="flex items-center gap-2 text-xs text-slate-400 font-black uppercase tracking-widest">
             <Users className="h-3.5 w-3.5" /> {course.teacher}
           </div>
        </div>

        {/* Progress Matrix */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progress</p>
                <p className="text-lg font-black text-slate-900">{course.progress}%</p>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.completedLessons} / {course.lessons} Units</p>
          </div>
          <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", c.bar)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Next Lesson Pulse */}
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group/item transition-all hover:bg-white hover:border-indigo-100">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            <Play className="h-4 w-4 text-slate-500 fill-slate-500 group-hover/item:text-indigo-600 group-hover/item:fill-indigo-600 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Action</p>
            <p className="text-xs font-black text-slate-700 truncate">{course.nextLesson}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Clock className="h-4 w-4" />
            {course.time}
          </div>
          <Link href={`/dashboard/student/courses/${course.id}`}>
            <Button
              className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
            >
              Continue <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
