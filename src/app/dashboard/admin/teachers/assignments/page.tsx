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
  Briefcase
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
import { toast } from "sonner"
import { 
  fetchTeacherAssignments, 
  fetchAssignmentOptions, 
  createAssignment, 
  deleteAssignment 
} from "./actions"

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [options, setOptions] = React.useState<{teachers: any[], courses: any[], classes: any[]}>({ teachers: [], courses: [], classes: [] })
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      teacherId: formData.get("teacherId") as string,
      courseId: formData.get("courseId") as string,
      classId: formData.get("classId") as string,
      academicYear: formData.get("academicYear") as string,
      semester: formData.get("semester") as string,
    }

    if (!payload.teacherId || !payload.courseId || !payload.classId) {
      toast.error("Fadlan buuxi meelaha loo baahan yahay")
      return
    }

    const res = await createAssignment(payload)
    if (res.success) {
      toast.success("Macallinka si guul leh ayaa loogu qoondeeyey maaddada!")
      setIsCreateOpen(false)
      loadData()
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
            LMS Assignments.
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg max-w-xl">
            Link teachers to specific subjects and classes to build a modern academic workload hierarchy.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 rounded-[22px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-none">
              <Plus className="h-6 w-6" />
              Assign Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] sm:max-w-[550px] p-10 border-none shadow-3xl bg-white">
            <form onSubmit={handleCreate}>
              <DialogHeader className="mb-8">
                <DialogTitle className="text-3xl font-black tracking-tight">Teaching Assignment</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">Create a link between a teacher, a subject, and a class.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Professional (Teacher)</Label>
                  <Select name="teacherId" required>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-indigo-500">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {options.teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Course / Subject</Label>
                    <Select name="courseId" required>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-indigo-500">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {options.courses.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Class</Label>
                    <Select name="classId" required>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-indigo-500">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {options.classes.map(cl => (
                          <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Year</Label>
                    <Input name="academicYear" placeholder="2024/2025" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Semester / Term</Label>
                    <Input name="semester" placeholder="Semester 1" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-12">
                <Button type="submit" className="w-full h-16 rounded-[22px] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100">
                  Deploy Assignment
                </Button>
              </DialogFooter>
            </form>
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
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Assignments</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{assignments.length}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <UserPlus className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Active Teachers</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.teacherId)).size}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-amber-50 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <GraduationCap className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Classes Covered</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.classId)).size}</h3>
           </div>
        </Card>
      </div>

      {/* Main Assignment Grid */}
      <Card className="rounded-[45px] border-none shadow-2xl bg-white overflow-hidden border border-slate-50">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-none">Global Teaching Load</h3>
            <p className="text-slate-400 font-medium text-sm mt-2 font-mono">Real-time assignment synchronization active.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input 
                placeholder="Search teacher, class or subject..." 
                className="pl-12 h-14 rounded-[20px] border-slate-100 bg-white ring-offset-transparent focus-visible:ring-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 w-14 rounded-[20px] border-slate-100 bg-white shadow-sm p-0">
               <Filter className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Educator</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Instructional Goal</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Cohort</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Year / Term</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                      <LayoutGrid className="h-20 w-20 text-slate-300" />
                      <p className="text-xl font-black text-slate-900">No assignments found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-[18px] bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                             {a.teacherFirst[0]}{a.teacherLast[0]}
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-900 leading-none">{a.teacherFirst} {a.teacherLast}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">Certified Educator</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-black text-slate-700">{a.courseName}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-200">
                          <Component className="h-3 w-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{a.className}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                             <Calendar className="h-3 w-3" />
                             {a.academicYear || "N/A"}
                          </div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{a.semester || "ANNUAL"}</p>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
