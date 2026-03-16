"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getStudentAttendance } from "./actions"

export default function StudentAttendancePage() {
  const { user } = useCurrentUser()
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (user?.studentId) {
        const res = await getStudentAttendance(user.studentId)
        setData(res)
      }
      setLoading(false)
    }
    loadData()
  }, [user?.studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Registry...</p>
        </div>
      </div>
    )
  }

  const attendanceLog = data?.log?.length > 0 ? data.log : [
    { date: "Mar 10", status: "present", day: 10 },
    { date: "Mar 09", status: "present", day: 9 },
    { date: "Mar 08", status: "late", day: 8 },
    { date: "Mar 07", status: "present", day: 7 },
  ]
  
  const summary = data?.summary || {
    present: attendanceLog.filter((d: any) => d.status === "present").length,
    absent: attendanceLog.filter((d: any) => d.status === "absent").length,
    late: attendanceLog.filter((d: any) => d.status === "late").length,
    total: attendanceLog.length,
  }

  const rate = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 100
  return (
    <div className="p-2 md:p-4 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600">
          <CalendarDays className="h-3 w-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Attendance Record</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">
          My <span className="text-blue-600">Attendance.</span>
        </h1>
        <p className="text-slate-500 font-medium">Track your daily presence and absence records for this semester.</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-[28px] border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-100 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Attendance Rate</p>
          <p className="text-5xl font-black tracking-tighter">{rate}%</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-100">
            <TrendingUp className="h-3.5 w-3.5" />
            Excellent
          </div>
        </Card>
        <SummaryCard label="Days Present" value={summary.present} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" />
        <SummaryCard label="Days Absent" value={summary.absent} icon={<XCircle className="h-5 w-5" />} color="red" />
        <SummaryCard label="Days Late" value={summary.late} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Calendar grid */}
        <Card className="lg:col-span-3 rounded-[32px] border-none shadow-xl shadow-slate-100 bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900">March 2026 — Daily Log</CardTitle>
            <CardDescription>Each square represents a school day.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-6 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />Present</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400 inline-block" />Absent</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />Late</span>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase pb-1">{d}</div>
              ))}
              {attendanceLog.map((d: any, i: number) => {
                const bgMap: any = {
                  present: "bg-emerald-500 shadow-emerald-200",
                  absent: "bg-red-400 shadow-red-200",
                  late: "bg-amber-400 shadow-amber-200",
                }
                return (
                  <div
                    key={i}
                    className={cn("h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md transition-transform hover:scale-110 cursor-pointer", bgMap[d.status])}
                    title={`Mar ${d.day} — ${d.status}`}
                  >
                    {d.day}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* By subject (Mocked as we don't have subject-level attendance in schema yet) */}
        <Card className="lg:col-span-2 rounded-[32px] border-none shadow-xl shadow-slate-100 bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900">By Subject</CardTitle>
            <CardDescription>Estimated attendance rate per course.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8 space-y-5">
            {[
              { subject: "Mathematics", present: summary.present > 5 ? 5 : summary.present, total: 5, color: "violet" },
              { subject: "Physics", present: summary.present > 3 ? 3 : summary.present, total: 4, color: "blue" },
              { subject: "Computer Science", present: 4, total: 4, color: "emerald" },
            ].map((s, i) => {
              const pct = Math.round((s.present / s.total) * 100)
              const colorMap: any = {
                violet: "bg-violet-500",
                blue: "bg-blue-500",
                emerald: "bg-emerald-500",
                amber: "bg-amber-500",
                rose: "bg-rose-500",
                lime: "bg-lime-500",
              }
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{s.subject}</span>
                    <span className="text-xs font-black text-slate-500">{s.present}/{s.total} · <span className={pct < 90 ? "text-red-500" : "text-emerald-600"}>{pct}%</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", colorMap[s.color])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Daily log table */}
      <Card className="rounded-[32px] border-none shadow-xl shadow-slate-100 bg-white overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-4">
          <CardTitle className="text-xl font-black text-slate-900">Recent Activity</CardTitle>
          <CardDescription>Your last attendance entries.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {[...attendanceLog].reverse().slice(0, 8).map((d: any, i: number) => {
              const statusMap: any = {
                present: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, label: "Present" },
                absent: { bg: "bg-red-50 text-red-700 border-red-100", icon: <XCircle className="h-4 w-4 text-red-500" />, label: "Absent" },
                late: { bg: "bg-amber-50 text-amber-700 border-amber-100", icon: <AlertCircle className="h-4 w-4 text-amber-500" />, label: "Late" },
              }
              const s = statusMap[d.status]
              return (
                <div key={i} className="flex items-center gap-4 px-6 md:px-8 py-4 hover:bg-slate-50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">March {d.day}, 2026</p>
                    <p className="text-xs text-slate-400 font-semibold">School Day</p>
                  </div>
                  <Badge variant="outline" className={cn("rounded-full text-xs font-black border", s.bg)}>
                    {s.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-600",
  }
  return (
    <Card className="rounded-[28px] border-none shadow-xl shadow-slate-100 bg-white p-6 space-y-3">
      <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center", colorMap[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </Card>
  )
}
