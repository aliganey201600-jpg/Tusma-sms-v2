"use client"

import * as React from "react"
import { 
  ArrowLeft, 
  Download, 
  LayoutGrid, 
  UserPlus, 
  Printer,
  FileSpreadsheet,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { fetchTeacherWorkloadReport } from "../actions"

export default function WorkloadReportPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [reportData, setReportData] = React.useState<any[]>([])
  const academicYear = "2024-2025"

  React.useEffect(() => {
    async function loadReport() {
      setLoading(true)
      const data = await fetchTeacherWorkloadReport(academicYear)
      setReportData(data as any[])
      setLoading(false)
    }
    loadReport()
  }, [])

  const exportToCSV = () => {
    const headers = ["Educator", "Classes", "Subjects", "Total Hours", "Total Students"]
    const rows = reportData.map(r => [
      `${r.firstName} ${r.lastName}`,
      r.classCount,
      r.subjectSessions,
      Number(r.totalHours).toFixed(1),
      r.totalStudents
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Teacher_Workload_Report_${academicYear}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
     window.print()
  }

  return (
    <div className="p-4 md:p-10 space-y-10 max-w-[1400px] mx-auto animate-in fade-in duration-700 print:p-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="space-y-2">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="group p-0 hover:bg-transparent text-slate-500 hover:text-indigo-600 font-bold transition-all"
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Assignments
            </Button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl">
                    <LayoutGrid className="h-7 w-7 text-white" />
                </div>
                Workload Intelligence.
            </h1>
            <p className="text-slate-500 font-medium text-lg">
                Comprehensive distribution report for the {academicYear} session.
            </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <Button 
                onClick={handlePrint}
                variant="outline" 
                className="flex-1 md:flex-none h-14 px-6 rounded-2xl border-slate-200 font-black gap-2 hover:bg-slate-50 shadow-sm"
            >
                <Printer className="h-4 w-4" />
                Print PDF
            </Button>
            <Button 
                onClick={exportToCSV}
                className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-slate-900 border-none text-white font-black gap-2 hover:scale-[1.02] shadow-2xl transition-all"
            >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4">
        <Card className="rounded-[30px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-5">
           <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Educators</p>
              <h3 className="text-2xl font-black text-slate-900">{reportData.length}</h3>
           </div>
        </Card>
        <Card className="rounded-[30px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-5">
           <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Printer className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Load</p>
              <h3 className="text-2xl font-black text-slate-900">
                {(reportData.reduce((acc, r) => acc + Number(r.totalHours || 0), 0) / (reportData.length || 1)).toFixed(1)}h
              </h3>
           </div>
        </Card>
        <Card className="rounded-[30px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-5">
           <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <UserPlus className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Student Reach</p>
              <h3 className="text-2xl font-black text-slate-900">
                {reportData.reduce((acc, r) => acc + Number(r.totalStudents || 0), 0)}
              </h3>
           </div>
        </Card>
        <Card className="hidden md:flex rounded-[30px] border-none bg-indigo-600 p-6 items-center gap-5 text-white shadow-2xl shadow-indigo-200">
           <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Download className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Status</p>
              <h3 className="text-2xl font-black capitalize">Verified</h3>
           </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[40px] border-none shadow-2xl bg-white overflow-hidden print:shadow-none print:border print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Educational Personnel</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Class Volume</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Assignments</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Work Hours</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Student Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 h-20 bg-slate-50/30"></td>
                  </tr>
                ))
              ) : (
                reportData.map((r, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                             {r.firstName ? r.firstName[0] : ''}{r.lastName ? r.lastName[0] : ''}
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-900 leading-none">{r.firstName} {r.lastName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">Teacher</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8 font-black text-slate-600 text-lg">
                       {r.classCount} <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Classes</span>
                    </td>
                    <td className="px-8 py-8">
                       <Badge className="bg-indigo-50 text-indigo-700 border-none font-black px-4 py-1.5 rounded-full text-[10px] uppercase">
                         {r.subjectSessions} Sessions
                       </Badge>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-lg">{Number(r.totalHours).toFixed(1)}</span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter italic">Total Credits</span>
                       </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-lg">
                          <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-sm font-black">{r.totalStudents}</span>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Print Footer */}
      <div className="hidden print:block border-t border-slate-200 mt-20 pt-10 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tusmo High School - Administrative Workload Intelligence</p>
         <p className="text-[8px] font-bold text-slate-300 mt-2 italic">Report Generated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
