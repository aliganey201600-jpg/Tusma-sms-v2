"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Search, Loader2, Save } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { fetchTeacherCourses, saveSubjectAttendance } from "./actions"
import { fetchClassAttendance } from "../../admin/attendance/actions"
import { format } from "date-fns"

import { useCurrentUser } from "@/hooks/use-current-user"

export default function TeacherAttendancePage() {
  const { user } = useCurrentUser()
  const [courses, setCourses] = React.useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [selectedClassId, setSelectedClassId] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [attendance, setAttendance] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Load teacher courses on mount
  React.useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      const data = await fetchTeacherCourses(user.id) as any[]
      setCourses(data)
      if (data.length > 0) {
        setSelectedCourseId(data[0].courseId)
        setSelectedClassId(data[0].classId)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Load students when class or date changes
  const loadAttendance = React.useCallback(async () => {
    if (!selectedClassId || !selectedDate) return
    setIsLoading(true)
    const data = await fetchClassAttendance(selectedClassId, selectedDate) as any[]
    
    const processedData = data.map((s: any) => ({
      ...s,
      status: s.status || "PRESENT"
    }))
    
    setAttendance(processedData)
    setIsLoading(false)
  }, [selectedClassId, selectedDate])

  React.useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => prev.map(s => {
      if (s.student_id === studentId) {
        return { ...s, status: s.status === "PRESENT" ? "ABSENT" : "PRESENT" }
      }
      return s
    }))
  }

  const handleSave = async () => {
    if (!selectedCourseId || !selectedClassId) return
    setIsSaving(true)
    
    const selectedCourse = courses.find(c => c.courseId === selectedCourseId)
    const records = attendance.map(s => ({
      studentId: s.student_id,
      status: s.status,
      remarks: s.remarks
    }))

    const res = await saveSubjectAttendance({
      classId: selectedClassId,
      courseId: selectedCourseId,
      courseName: selectedCourse?.course?.name || "Unknown",
      date: selectedDate,
      records
    }) as any

    setIsSaving(false)
    if (res.success) {
      toast.success("Attendance saved!", {
        description: res.count > 0 ? `${res.count} WhatsApp alerts triggered.` : "Notifications sent where applicable."
      })
      loadAttendance()
    } else {
      toast.error(res.error || "Failed to save attendance")
    }
  }

  const filteredStudents = attendance.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCourseAndClass = courses.find(c => c.courseId === selectedCourseId && c.classId === selectedClassId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
             Record status for: <span className="font-bold text-primary">{selectedCourseAndClass?.course.name || "Subject"}</span>
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button 
             onClick={handleSave} 
             disabled={isSaving || attendance.length === 0}
             className="gap-2 h-11 rounded-xl px-6 bg-slate-900 shadow-lg shadow-slate-200 w-full sm:w-auto text-white"
           >
             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Submit Attendance
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         <Card className="border-none shadow-sm h-fit bg-white">
            <CardHeader className="pb-3 px-4">
               <CardTitle className="text-lg font-bold">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject/Maado</label>
                  <Select 
                    value={`${selectedCourseId}:${selectedClassId}`} 
                    onValueChange={(val) => {
                      const [co, cl] = val.split(":")
                      setSelectedCourseId(co)
                      setSelectedClassId(cl)
                    }}
                  >
                     <SelectTrigger className="rounded-xl h-11 border-slate-100 bg-slate-50/50">
                        <SelectValue placeholder="Select Course" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl p-2">
                        {courses.map(c => (
                          <SelectItem key={`${c.courseId}:${c.classId}`} value={`${c.courseId}:${c.classId}`} className="rounded-lg">
                            {c.course.name} ({c.class.name})
                          </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Date</label>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-11 rounded-xl border-slate-100 bg-slate-50/50"
                  />
               </div>

               <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Present</span>
                     <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-black border-none">
                       {attendance.filter(s => s.status === "PRESENT").length}
                     </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Absent</span>
                     <Badge variant="secondary" className="bg-red-50 text-red-600 font-black border-none">
                        {attendance.filter(s => s.status === "ABSENT").length}
                     </Badge>
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="md:col-span-3 space-y-4">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search student name..." 
                 className="pl-12 h-12 rounded-xl bg-white border-none shadow-sm font-medium" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
               {isLoading ? (
                 <div className="py-24 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Student List...</p>
                 </div>
               ) : filteredStudents.length === 0 ? (
                 <div className="py-24 text-center">
                   <p className="text-muted-foreground">No students found for this class.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {filteredStudents.map((student) => (
                       <div key={student.student_id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-lg border-2 border-white shadow-sm">
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                   {student.firstName} {student.lastName}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-0.5">ID: {student.manual_id || "N/A"}</p>
                             </div>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button 
                               onClick={() => toggleStatus(student.student_id)}
                               variant="ghost"
                               className={cn(
                                 "rounded-xl px-5 h-10 gap-2 font-bold transition-all",
                                 student.status === "PRESENT" 
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100" 
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                               )}
                             >
                               <Check className="h-4 w-4" />
                               <span className="hidden sm:inline">Present</span>
                             </Button>
                             <Button 
                               onClick={() => toggleStatus(student.student_id)}
                               variant="ghost"
                               className={cn(
                                 "rounded-xl px-5 h-10 gap-2 font-bold transition-all",
                                 student.status === "ABSENT" 
                                  ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100" 
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                               )}
                             >
                               <X className="h-4 w-4" />
                               <span className="hidden sm:inline">Absent</span>
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </Card>

            <div className="flex justify-center items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 py-4 opacity-50 italic">
               - End of class list -
            </div>
         </div>
      </div>
    </div>
  )
}
