"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock students for class 10A
const classStudents = [
  { id: "1", name: "Ahmed Farah", status: "Present" },
  { id: "2", name: "Fatima B.", status: "Present" },
  { id: "3", name: "Mustafa J.", status: "Absent" },
  { id: "4", name: "Ibrahim H.", status: "Present" },
  { id: "5", name: "Zahra S.", status: "Present" },
  { id: "6", name: "Leyla Ali", status: "Absent" },
  { id: "7", name: "Omar K.", status: "Present" },
]

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = React.useState("10a")
  const [attendance, setAttendance] = React.useState(classStudents)

  const toggleStatus = (id: string) => {
    setAttendance(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "Present" ? "Absent" : "Present" }
      }
      return s
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Record student presence for your scheduled classes.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 h-10 rounded-xl px-4 bg-background">
             Save as Draft
           </Button>
           <Button className="gap-2 h-10 rounded-xl px-4">
             Submit Attendance
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         {/* Sidebar Controls */}
         <Card className="border-none shadow-sm h-fit">
            <CardHeader className="pb-3">
               <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                     <SelectTrigger className="rounded-xl h-11 border-slate-200">
                        <SelectValue placeholder="Select Class" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="10a">Grade 10A</SelectItem>
                        <SelectItem value="12b">Grade 12B</SelectItem>
                        <SelectItem value="9c">Grade 9C</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Date</label>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-11 rounded-xl border-slate-200 bg-background">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {new Date().toLocaleDateString()}
                  </Button>
               </div>
               <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-muted-foreground">Present</span>
                     <span className="font-bold text-emerald-600">{attendance.filter(s => s.status === "Present").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Absent</span>
                     <span className="font-bold text-destructive">{attendance.filter(s => s.status === "Absent").length}</span>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Main Attendance List */}
         <div className="md:col-span-3 space-y-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Search student name..." className="pl-10 h-11 rounded-xl bg-background border-none shadow-sm" />
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-background">
               <div className="divide-y">
                  {attendance.map((student) => (
                     <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                              {student.name.charAt(0)}
                           </div>
                           <span className="font-bold">{student.name}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button 
                             onClick={() => toggleStatus(student.id)}
                             variant={student.status === "Present" ? "default" : "outline"}
                             size="sm"
                             className={cn(
                               "rounded-lg px-4 gap-2 border-slate-200",
                               student.status === "Present" && "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                             )}
                           >
                             <Check className="h-4 w-4" />
                             <span className="hidden sm:inline">Present</span>
                           </Button>
                           <Button 
                             onClick={() => toggleStatus(student.id)}
                             variant={student.status === "Absent" ? "destructive" : "outline"}
                             size="sm"
                             className={cn(
                               "rounded-lg px-4 gap-2 border-slate-200",
                               student.status === "Absent" && "bg-destructive hover:bg-destructive/90 text-white border-none"
                             )}
                           >
                             <X className="h-4 w-4" />
                             <span className="hidden sm:inline">Absent</span>
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground py-4">
               <Button variant="ghost" size="sm" className="h-8 rounded-lg">
                  <ChevronLeft className="h-4 w-4" />
               </Button>
               <span>Page 1 of 1</span>
               <Button variant="ghost" size="sm" className="h-8 rounded-lg">
                  <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
