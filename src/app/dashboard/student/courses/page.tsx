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
} from "lucide-react"

const courses = [
  {
    id: 1,
    name: "Advanced Mathematics",
    teacher: "Mr. Abdi Warsame",
    progress: 65,
    grade: "B+",
    color: "violet",
    lessons: 24,
    completedLessons: 16,
    nextLesson: "Integration by Parts",
    schedule: "Mon · Wed · Fri",
    time: "08:00 – 09:30",
  },
  {
    id: 2,
    name: "Physics",
    teacher: "Ms. Fadumo Ali",
    progress: 42,
    grade: "B",
    color: "blue",
    lessons: 20,
    completedLessons: 8,
    nextLesson: "Newton's 3rd Law",
    schedule: "Tue · Thu",
    time: "10:00 – 11:30",
  },
  {
    id: 3,
    name: "Computer Science",
    teacher: "Mr. Khalid Hassan",
    progress: 88,
    grade: "A",
    color: "emerald",
    lessons: 30,
    completedLessons: 26,
    nextLesson: "Sorting Algorithms",
    schedule: "Mon · Wed",
    time: "13:00 – 14:30",
  },
  {
    id: 4,
    name: "History & Civilization",
    teacher: "Ms. Hodan Jama",
    progress: 55,
    grade: "B-",
    color: "amber",
    lessons: 18,
    completedLessons: 10,
    nextLesson: "The Ottoman Empire",
    schedule: "Tue · Fri",
    time: "09:00 – 10:00",
  },
  {
    id: 5,
    name: "English Literature",
    teacher: "Mr. Mahad Yusuf",
    progress: 72,
    grade: "A-",
    color: "rose",
    lessons: 22,
    completedLessons: 16,
    nextLesson: "Shakespeare: Hamlet",
    schedule: "Wed · Thu",
    time: "11:00 – 12:30",
  },
  {
    id: 6,
    name: "Biology",
    teacher: "Ms. Sagal Omar",
    progress: 38,
    grade: "C+",
    color: "lime",
    lessons: 26,
    completedLessons: 10,
    nextLesson: "Cell Division & Mitosis",
    schedule: "Mon · Thu",
    time: "14:30 – 16:00",
  },
]

export default function StudentCoursesPage() {
  const [search, setSearch] = React.useState("")

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600">
            <BookOpen className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Enrolled Courses</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            My <span className="text-violet-600">Courses.</span>
          </h1>
          <p className="text-slate-500 font-medium">You are enrolled in {courses.length} courses this semester.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 rounded-2xl gap-2 shrink-0">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: "6", color: "violet" },
          { label: "Completed Lessons", value: "86", color: "emerald" },
          { label: "Avg. Progress", value: "60%", color: "blue" },
          { label: "Current GPA", value: "3.7", color: "amber" },
        ].map((s, i) => {
          const colors: any = {
            violet: "from-violet-500 to-purple-600",
            emerald: "from-emerald-500 to-teal-600",
            blue: "from-blue-500 to-indigo-600",
            amber: "from-amber-500 to-orange-600",
          }
          return (
            <div key={i} className={cn("rounded-[24px] p-5 text-white bg-gradient-to-br shadow-xl", colors[s.color])}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">{s.label}</p>
              <p className="text-4xl font-black tracking-tighter">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <BookOpen className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-bold text-lg">No courses found</p>
            <p className="text-sm">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: typeof courses[0] }) {
  const colorMap: any = {
    violet: { bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700", icon: "bg-violet-100 text-violet-600", ring: "ring-violet-200" },
    blue: { bar: "bg-blue-500", badge: "bg-blue-50 text-blue-700", icon: "bg-blue-100 text-blue-600", ring: "ring-blue-200" },
    emerald: { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", icon: "bg-emerald-100 text-emerald-600", ring: "ring-emerald-200" },
    amber: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700", icon: "bg-amber-100 text-amber-600", ring: "ring-amber-200" },
    rose: { bar: "bg-rose-500", badge: "bg-rose-50 text-rose-700", icon: "bg-rose-100 text-rose-600", ring: "ring-rose-200" },
    lime: { bar: "bg-lime-500", badge: "bg-lime-50 text-lime-700", icon: "bg-lime-100 text-lime-600", ring: "ring-lime-200" },
  }
  const c = colorMap[course.color] || colorMap.violet

  return (
    <Card className="border-none shadow-xl shadow-slate-100 rounded-[28px] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Top accent */}
      <div className={cn("h-1.5 w-full", c.bar)} />

      <CardContent className="p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", c.icon)}>
            <BookOpen className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={cn("rounded-full text-[10px] font-black border-0 py-1", c.badge)}>
            {course.grade}
          </Badge>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{course.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Users className="h-3 w-3" />
            {course.teacher}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase">
            <span>Progress</span>
            <span>{course.completedLessons}/{course.lessons} lessons · {course.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", c.bar)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Next lesson */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
            <Play className="h-3 w-3 text-slate-500 fill-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase text-slate-400">Up next</p>
            <p className="text-xs font-bold text-slate-700 truncate">{course.nextLesson}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock className="h-3 w-3" />
            {course.schedule} · {course.time}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 rounded-xl text-xs font-black text-violet-600 hover:bg-violet-50 gap-1"
          >
            Open <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
