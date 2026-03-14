"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  BookOpen, 
  Component, 
  GraduationCap,
  Calendar,
  Layers,
  LayoutGrid,
  Filter,
  MoreVertical,
  Briefcase,
  Download,
  CheckCircle2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  fetchTeacherAssignments, 
  fetchAssignmentOptions, 
  createBulkAssignments, 
  deleteAssignment 
} from "./actions"

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [options, setOptions] = React.useState<{teachers: any[], courses: any[], classes: any[]}>({ teachers: [], courses: [], classes: [] })
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Bulk selection states
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("")
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>([])
  const [selectedClassIds, setSelectedClassIds] = React.useState<string[]>([])
  const [academicYear, setAcademicYear] = React.useState("2024-2025")
  const [semester, setSemester] = React.useState("Semester 1")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const [data, opts] = await Promise.all([
      fetchTeacherAssignments(),
      fetchAssignmentOptions()
    ])
    setAssignments(data as any[])
    setOptions(opts)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleBulkAssign = async () => {
    if (!selectedTeacherId || selectedCourseIds.length === 0 || selectedClassIds.length === 0) {
      toast.error("Fadlan dooro Macallinka, ugu yaraan hal Maaddo, iyo hal Fasal")
      return
    }

    const res = await createBulkAssignments({
      teacherId: selectedTeacherId,
      courseIds: selectedCourseIds,
      classIds: selectedClassIds,
      academicYear,
      semester
    })

    if (res.success) {
      toast.success("Si guul leh ayaa loo qoondeeyey!")
      setIsCreateOpen(false)
      loadData()
      setSelectedCourseIds([])
      setSelectedClassIds([])
    } else {
      toast.error(res.error || "Khalad ayaa dhacay")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto qoondayntan?")) {
      const res = await deleteAssignment(id)
      if (res.success) {
        toast.success("Waa la tirtiray")
        loadData()
      }
    }
  }

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleClass = (id: string) => {
    setSelectedClassIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filteredAssignments = assignments.filter(a => 
    `${a.teacherFirst} ${a.teacherLast}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.className.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            <div className="h-16 w-16 rounded-[24px] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            Teaching Matrix.
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg max-w-xl">
            Modern LMS-style bulk assignments. Link educators to multiple subjects and cohorts in one click.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 rounded-[22px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
              <Plus className="h-6 w-6" />
              Smart Bulk Assign
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] sm:max-w-[850px] p-0 border-none shadow-3xl bg-white overflow-hidden overflow-y-auto max-h-[90vh]">
            <div className="grid grid-cols-1 md:grid-cols-5 h-full">
               {/* Left Panel: Teacher & Config */}
               <div className="md:col-span-2 bg-slate-50 p-10 border-r border-slate-100 space-y-8">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black tracking-tight">Assignment Engine</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuration Panel</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Step 1: Select Professional</Label>
                       <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-100">
                             <SelectValue placeholder="Target Teacher" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-none">
                             {options.teachers.map(t => (
                               <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Step 4: Session Context</Label>
                       <Input 
                        placeholder="Academic Year" 
                        value={academicYear} 
                        onChange={e => setAcademicYear(e.target.value)}
                        className="h-12 rounded-xl bg-white" 
                       />
                       <Input 
                        placeholder="Semester" 
                        value={semester} 
                        onChange={e => setSemester(e.target.value)}
                        className="h-12 rounded-xl bg-white" 
                       />
                    </div>
                  </div>

                  <div className="pt-10">
                     <Button 
                      onClick={handleBulkAssign}
                      className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
                     >
                       Compute & Deploy
                     </Button>
                  </div>
               </div>

               {/* Right Panel: Multiple Subjects & Classes */}
               <div className="md:col-span-3 p-10 space-y-10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Instructional Subjects</Label>
                        <Badge variant="outline" className="rounded-full bg-indigo-50 text-indigo-600 border-none px-3 font-black">{selectedCourseIds.length} Selected</Badge>
                     </div>
                     <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1 bg-slate-50 rounded-2xl">
                        {options.courses.map(c => (
                           <div 
                            key={c.id} 
                            onClick={() => toggleCourse(c.id)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              selectedCourseIds.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                            }`}
                           >
                              {selectedCourseIds.includes(c.id) ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4 opacity-30" />}
                              <span className="text-xs font-bold truncate">{c.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Academic Cohorts (Classes)</Label>
                        <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-none px-3 font-black">{selectedClassIds.length} Selected</Badge>
                     </div>
                     <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1 bg-slate-50 rounded-2xl">
                        {options.classes.map(cl => (
                           <div 
                            key={cl.id} 
                            onClick={() => toggleClass(cl.id)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              selectedClassIds.includes(cl.id) ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200"
                            }`}
                           >
                              {selectedClassIds.includes(cl.id) ? <CheckCircle2 className="h-4 w-4" /> : <GraduationCap className="h-4 w-4 opacity-30" />}
                              <span className="text-xs font-bold truncate">{cl.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <Layers className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Matrix Links</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{assignments.length}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <UserPlus className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Active Personnel</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.teacherId)).size}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-amber-50 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <GraduationCap className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Campus Coverage</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.classId)).size}</h3>
           </div>
        </Card>
      </div>

      {/* Main Assignment Grid */}
      <Card className="rounded-[45px] border-none shadow-2xl bg-white overflow-hidden border border-slate-50">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-none">Teaching Load Matrix</h3>
            <p className="text-slate-400 font-medium text-sm mt-2 font-mono">Dynamic course distribution engine.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input 
                placeholder="Search staff, cohort or module..." 
                className="pl-12 h-14 rounded-[20px] border-slate-100 bg-white ring-offset-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-6 rounded-[20px] border-slate-100 bg-white shadow-sm flex items-center gap-2 font-bold text-slate-500">
               <Download className="h-4 w-4" />
               Report
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Educator</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject / Module</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Cohort</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-[18px] bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 uppercase">
                           {a.teacherFirst[0]}{a.teacherLast[0]}
                        </div>
                        <div>
                           <p className="text-lg font-black text-slate-900 leading-none">{a.teacherFirst} {a.teacherLast}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">Certified Staff</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-indigo-50 border-none text-indigo-700 font-black text-[10px] uppercase">
                        {a.courseName}
                     </Badge>
                  </td>
                  <td className="px-10 py-8">
                     <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 bg-white shadow-sm">
                        <Component className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{a.className}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900">{a.academicYear || "2024-2025"}</p>
                        <p className="font-bold text-indigo-500 uppercase tracking-tighter text-[10px]">{a.semester || "Semester 1"}</p>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[15px] hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[15px] hover:bg-slate-100">
                          <MoreVertical className="h-5 w-5 text-slate-400" />
                        </Button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
