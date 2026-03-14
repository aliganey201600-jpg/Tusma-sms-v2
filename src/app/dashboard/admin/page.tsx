"use client"

import * as React from "react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { 
  Users, 
  UserRound, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  MoreVertical,
  ArrowUpRight,
  Search,
  LayoutGrid,
  Zap,
  Star,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchDashboardStats } from "./actions"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      const stats = await fetchDashboardStats()
      setData(stats)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { students: 0, teachers: 0, classes: 0, courses: 0, attendance: 0 }

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
             <Star className="h-3 w-3 fill-current" />
             <span className="text-[10px] font-black uppercase tracking-widest">Admin Command Center</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
            School <span className="text-indigo-600">Analytics.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            Welcome back, Administrator. Your institution's data is synchronized and ready for analysis.
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
           <div className="relative group flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                placeholder="Search anything..." 
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-sm focus:shadow-indigo-100"
              />
           </div>
           <Button className="h-14 w-14 rounded-2xl bg-slate-900 border-none shadow-xl hover:scale-105 transition-all shrink-0">
             <LayoutGrid className="h-6 w-6 text-white" />
           </Button>
        </div>
      </div>

      {/* Grid Stats - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCardPremium 
           title="Active Students"
           value={stats.students}
           icon={<UserRound className="h-6 w-6" />}
           color="indigo"
           description="+12 this month"
        />
        <StatsCardPremium 
           title="Expert Faculty"
           value={stats.teachers}
           icon={<Users className="h-6 w-6" />}
           color="emerald"
           description="Full staff active"
        />
        <StatsCardPremium 
           title="Smart Classes"
           value={stats.classes}
           icon={<GraduationCap className="h-6 w-6" />}
           color="amber"
           description="Across 12 Grades"
        />
        <StatsCardPremium 
           title="LMS Attendance"
           value={`${stats.attendance}%`}
           icon={<TrendingUp className="h-6 w-6" />}
           color="rose"
           description="Above threshold"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        
        {/* Left Column: Visual Analytics */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-0">
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900">Performance Index</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Real-time attendance & growth metrics.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                     <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Attendance</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Enrollment</span>
                     </div>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <DashboardCharts />
            </CardContent>
          </Card>

          {/* Activity Feed */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[35px] border-none bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200 group hover:scale-[1.02] transition-transform">
                 <Zap className="h-10 w-10 text-white fill-white/20 mb-6" />
                 <h4 className="text-2xl font-black leading-tight mb-2">Advance <br/> Academic Year.</h4>
                 <p className="text-indigo-100 text-sm font-medium mb-6">Promote students and archive previous sessions records.</p>
                 <Button className="w-full h-12 rounded-xl bg-white text-indigo-600 font-black hover:bg-slate-50 border-none">Execute Promotion</Button>
              </Card>

              <Card className="rounded-[35px] border-none bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200 group hover:scale-[1.02] transition-transform">
                 <BookOpen className="h-10 w-10 text-white fill-white/20 mb-6" />
                 <h4 className="text-2xl font-black leading-tight mb-2">Subject <br/> Matrix.</h4>
                 <p className="text-slate-400 text-sm font-medium mb-6">Manage teacher assignments and session scheduling.</p>
                 <Button className="w-full h-12 rounded-xl bg-white/10 text-white border-white/20 font-black hover:bg-white/20" variant="outline">Open Matrix</Button>
              </Card>
           </div>
        </div>

        {/* Right Column: Live Data Streams */}
        <div className="lg:col-span-3 space-y-8">
           {/* Recent Students */}
           <Card className="border-none shadow-2xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
              <CardHeader className="p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Recent Admissions</CardTitle>
                  <CardDescription className="text-slate-400 font-medium">Latest entries to the system.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50">
                   <ArrowUpRight className="h-5 w-5 text-indigo-600" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-8 space-y-6 pb-8">
                   {data?.recentStudents.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                               {s.name[0]}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{s.name}</p>
                               <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase">
                                  <LayoutGrid className="h-2.5 w-2.5" />
                                  {s.class}
                               </div>
                            </div>
                         </div>
                         <Badge variant="outline" className="rounded-full border-slate-100 text-[9px] font-black uppercase text-slate-400 py-1">
                            {s.status}
                         </Badge>
                      </div>
                   ))}
                   {data?.recentStudents.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-10 italic">No recent admissions detected.</p>
                   )}
                </div>
                <Button variant="ghost" className="w-full h-16 rounded-none border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                   View Full Student Directory
                </Button>
              </CardContent>
           </Card>

           {/* Quick Stats / Timeline */}
           <Card className="border-none shadow-2xl shadow-indigo-50/50 rounded-[40px] overflow-hidden bg-white p-8 space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                 <Clock className="h-5 w-5 text-indigo-600" />
                 System Health
              </h4>
              <div className="space-y-4">
                 <HealthItem label="Database Connectivity" status="Stable" progress={100} color="emerald" />
                 <HealthItem label="Server Resources" status="Optimal" progress={42} color="indigo" />
                 <HealthItem label="Attendance Logs" status="Live" progress={85} color="amber" />
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

function StatsCardPremium({ title, value, icon, color, description }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-100/50",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100/50",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100/50",
  }

  return (
    <Card className="border-none shadow-xl shadow-slate-100 rounded-[35px] p-8 space-y-4 group hover:scale-[1.02] transition-transform bg-white">
       <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors mb-2", colors[color])}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
       </div>
       {description && (
         <div className="pt-2">
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 capitalize">
               <ArrowUpRight className="h-3 w-3 text-indigo-500 font-black" />
               {description}
            </p>
         </div>
       )}
    </Card>
  )
}

function HealthItem({ label, status, progress, color }: any) {
   const colors: any = {
      emerald: "bg-emerald-500 shadow-emerald-200",
      indigo: "bg-indigo-500 shadow-indigo-200",
      amber: "bg-amber-500 shadow-amber-200"
   }
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
            <span className="text-[10px] font-black uppercase text-indigo-600">{status}</span>
         </div>
         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full shadow-lg transition-all duration-1000", colors[color])} 
              style={{ width: `${progress}%` }}
            ></div>
         </div>
      </div>
   )
}
