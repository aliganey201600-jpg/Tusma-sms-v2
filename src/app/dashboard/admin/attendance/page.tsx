"use client"

import * as React from "react"
import { 
  Users, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Filter,
  Save,
  Loader2,
  Info,
  CalendarDays,
  MessageSquare,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { fetchAttendanceClasses, fetchClassAttendance, saveAttendance } from "./actions"
import { format } from "date-fns"
import { generateWhatsAppLink } from "@/utils/whatsapp"

export default function AttendancePage() {
  const [classes, setClasses] = React.useState<any[]>([])
  const [selectedClass, setSelectedClass] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [students, setStudents] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Load classes on mount
  React.useEffect(() => {
    async function loadClasses() {
      const data = await fetchAttendanceClasses() as any[]
      setClasses(data)
      if (data.length > 0) {
        setSelectedClass(data[0].id)
      }
      setIsLoading(false)
    }
    loadClasses()
  }, [])

  // Load students when class or date changes
  const loadAttendance = React.useCallback(async () => {
    if (!selectedClass || !selectedDate) return
    setIsLoading(true)
    const data = await fetchClassAttendance(selectedClass, selectedDate) as any[]
    
    // Default everyone to PRESENT if no record exists
    const processedData = data.map((s: any) => ({
      ...s,
      status: s.status || "PRESENT"
    }))
    
    setStudents(processedData)
    setIsLoading(false)
  }, [selectedClass, selectedDate])

  React.useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, status } : s
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const records = students.map(s => ({
      studentId: s.student_id,
      status: s.status,
      remarks: s.remarks
    }))
    
    const res = await saveAttendance(records, selectedDate) as any
    setIsSaving(false)
    
    if (res.success) {
      if (res.notificationCount > 0) {
        toast.success(`Attendance saved & ${res.notificationCount} WhatsApp alerts triggered!`, {
          description: "Parents have been notified of their children's absence.",
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        })
      } else {
        toast.success("Attendance saved successfully")
      }
      loadAttendance()
    } else {
      toast.error(res.error || "Failed to save attendance")
    }
  }

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.manual_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = React.useMemo(() => {
    const total = students.length
    const present = students.filter(s => s.status === "PRESENT").length
    const absent = students.filter(s => s.status === "ABSENT").length
    const late = students.filter(s => s.status === "LATE").length
    return { total, present, absent, late }
  }, [students])

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6">
      <style jsx global>{`
        .attendance-btn-active-present { background-color: #10b981 !important; color: white !important; border-color: #10b981 !important; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3) !important; }
        .attendance-btn-active-absent { background-color: #ef4444 !important; color: white !important; border-color: #ef4444 !important; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3) !important; }
        .attendance-btn-active-late { background-color: #f59e0b !important; color: white !important; border-color: #f59e0b !important; box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3) !important; }
        .attendance-btn-active-excused { background-color: #6366f1 !important; color: white !important; border-color: #6366f1 !important; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3) !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4 text-slate-900">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transform rotate-3">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            Mark Attendance
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Daily record of student participation and compliance.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <Card className="px-4 py-2 border-slate-100 shadow-sm rounded-2xl flex items-center gap-4 bg-white/50 backdrop-blur-sm">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Date</p>
                <p className="font-black text-slate-900">{format(new Date(selectedDate), "MMMM dd, yyyy")}</p>
              </div>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer focus:ring-0"
              />
           </Card>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.total, icon: Users, color: "slate" },
          { label: "Present Today", value: stats.present, icon: CheckCircle2, color: "emerald" },
          { label: "Absent Items", value: stats.absent, icon: XCircle, color: "red" },
          { label: "Late / Partial", value: stats.late, icon: Clock, color: "amber" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[24px] overflow-hidden bg-white/50 backdrop-blur-sm border border-white/20 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                item.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                item.color === "red" ? "bg-red-50 text-red-500" :
                item.color === "amber" ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-500"
              )}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-8 border-b border-slate-50 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Classroom Selection</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-slate-900 group-hover:bg-white transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <SelectValue placeholder="Select Class" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="rounded-xl font-bold py-3">
                      {cls.name} <span className="text-[10px] text-slate-400 ml-2">({cls.level})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Quick Search</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search student name or ID..." 
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-6 w-full md:w-auto">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || students.length === 0}
                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 w-full"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Sync Records
              </Button>
            </div>
          </div>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="mt-4 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Classroom...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-24 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900">No Students Found</h3>
              <p className="text-slate-400 font-medium">Please check the class selection or filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredStudents.map((student, idx) => (
                <div key={student.student_id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors group">
                  <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                    <div className="hidden md:flex h-10 w-10 items-center justify-center text-[10px] font-black text-slate-300">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                          {student.firstName} {student.lastName}
                        </h4>
                        {(student.status === "ABSENT" || student.status === "LATE") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            onClick={() => {
                              const phone = student.guardianPhone || student.phone;
                              if (!phone) {
                                toast.error("Lambarka taleefanka laguma soo helin ardaygan ama waalidka.");
                                return;
                              }
                              const dateStr = format(new Date(selectedDate), "dd/MM/yyyy");
                              const msg = `Salaam, Nidaamka Tusmo School: Ardayga ${student.firstName} ${student.lastName} wuxuu ${student.status === "ABSENT" ? "ka maqnaa" : "soo daahay"} fasalka maanta oo ay taariikhdu tahay ${dateStr}.`;
                              window.open(generateWhatsAppLink(phone, msg), "_blank");
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
                         <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-slate-200">ID: {student.manual_id || "N/A"}</Badge>
                         • <span className="opacity-60 italic">In-Class Roll Call</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-[24px] border border-slate-100/50 self-end md:self-center">
                    {[
                      { id: "PRESENT", label: "Present", icon: CheckCircle2, activeClass: "attendance-btn-active-present" },
                      { id: "ABSENT", label: "Absent", icon: XCircle, activeClass: "attendance-btn-active-absent" },
                      { id: "LATE", label: "Late", icon: Clock, activeClass: "attendance-btn-active-late" },
                      { id: "EXCUSED", label: "Excused", icon: AlertCircle, activeClass: "attendance-btn-active-excused" }
                    ].map((status) => (
                      <Button
                        key={status.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(student.student_id, status.id)}
                        className={cn(
                          "h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all gap-2",
                          student.status === status.id ? status.activeClass : "text-slate-400 hover:bg-white"
                        )}
                      >
                        <status.icon className={cn("h-4 w-4", student.status === status.id ? "text-white" : "text-slate-300")} />
                        <span className="hidden sm:inline">{status.label}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="md:w-48 w-full">
                    <Input 
                      placeholder="Remarks..." 
                      className="h-12 rounded-xl border-transparent bg-slate-100/30 font-medium text-xs focus:bg-white focus:border-slate-100 transition-all"
                      value={student.remarks || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setStudents(prev => prev.map(s => 
                          s.student_id === student.student_id ? { ...s, remarks: val } : s
                        ))
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                 ))}
                 <div className="h-8 w-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-black text-white">+{students.length}</div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ardayda Fasalkan</span>
            </div>
            
            <p className="text-[11px] font-black text-slate-400 italic">
               Note: All records are timestamped for academic integrity.
            </p>
        </div>
      </Card>

      {/* Monthly Trends - Modern Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl rounded-[40px] p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-10 group-hover:rotate-0 transition-transform duration-500">
              <CalendarDays className="h-32 w-32" />
           </div>
           <div className="relative z-10">
             <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] mb-4 uppercase tracking-widest px-4 py-1">Quick Tip</Badge>
             <h3 className="text-2xl font-black tracking-tight mb-2">Automated Notifications</h3>
             <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed">
               When you save 'Absent' records, the system can automatically notify parents via SMS or Email to improve compliance.
             </p>
             <Button className="mt-8 rounded-2xl bg-white text-slate-900 font-black px-8 h-12 hover:bg-slate-100 transition-all border-none">CONFIGURE ALERTS</Button>
           </div>
        </Card>

        <Card className="border-none shadow-xl rounded-[40px] p-8 border border-slate-50 bg-white flex flex-col justify-between">
           <div>
             <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Attendance Summary</h3>
             <p className="text-slate-400 font-medium text-sm">Monthly performance tracking for this classroom.</p>
           </div>
           
           <div className="space-y-4 pt-6">
              {[
                { label: "Overall Rate", value: "94.2%", color: "bg-emerald-500" },
                { label: "Unexcused Absence", value: "2.1%", color: "bg-red-500" },
                { label: "Punctuality", value: "88.5%", color: "bg-amber-500" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                    <span className="text-sm font-black text-slate-900">{stat.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", stat.color)} style={{ width: stat.value }} />
                  </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  )
}
