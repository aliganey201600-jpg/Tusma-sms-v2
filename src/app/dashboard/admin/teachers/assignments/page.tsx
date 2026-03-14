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
  AlertCircle,
  X,
  PlusCircle
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
  const [options, setOptions] = React.useState<{teachers: any[], courses: any[], classes: any[], existing: any[]}>({ 
    teachers: [], courses: [], classes: [], existing: [] 
  })
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // New Row-based state
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("")
  const [assignmentRows, setAssignmentRows] = React.useState<{id: string, courseId: string, classId: string}[]>([
    { id: Math.random().toString(), courseId: "", classId: "" }
  ])
  const [academicYear, setAcademicYear] = React.useState("2024-2025")
  const [semester, setSemester] = React.useState("Semester 1")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const [data, opts] = await Promise.all([
      fetchTeacherAssignments(),
      fetchAssignmentOptions()
    ])
    setAssignments(data as any[])
    setOptions(opts as any)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const addRow = () => {
    setAssignmentRows([...assignmentRows, { id: Math.random().toString(), courseId: "", classId: "" }])
  }

  const removeRow = (id: string) => {
    if (assignmentRows.length === 1) return;
    setAssignmentRows(assignmentRows.filter(r => r.id !== id))
  }

  const updateRow = (id: string, field: 'courseId' | 'classId', value: string) => {
    setAssignmentRows(assignmentRows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const handleBulkDeploy = async () => {
    if (!selectedTeacherId) {
      toast.error("Fadlan dooro Macallinka")
      return
    }

    const validRows = assignmentRows.filter(r => r.courseId && r.classId)
    if (validRows.length === 0) {
      toast.error("Fadlan ku dar ugu yaraan hal Maaddo iyo hal Fasal")
      return
    }

    // Check for internal duplicates in the UI
    const duplicates = validRows.filter((row, index) => 
      validRows.findIndex(r => r.courseId === row.courseId && r.classId === row.classId) !== index
    )

    if (duplicates.length > 0) {
      toast.error("Waxaad dooratay maaddo iyo fasal isku mid ah dhowr jeer. Fadlan sax.")
      return
    }

    const res = await createBulkAssignments({
      teacherId: selectedTeacherId,
      assignments: validRows.map(r => ({ courseId: r.courseId, classId: r.classId })),
      academicYear,
      semester
    })

    if (res.success) {
      toast.success("Si guul leh ayaa loo qoondeeyey!")
      setIsCreateOpen(false)
      loadData()
      setAssignmentRows([{ id: Math.random().toString(), courseId: "", classId: "" }])
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

  const getExistingTeacher = (courseId: string, classId: string) => {
    if (!courseId || !classId) return null
    return options.existing?.find(e => e.courseId === courseId && e.classId === classId && e.teacherId !== selectedTeacherId)
  }

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
            Modern row-based mapping. Assign subjects to classes with precision.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 rounded-[22px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-none">
              <Plus className="h-6 w-6" />
              Smart Matrix Creator
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] sm:max-w-[1000px] p-0 border-none shadow-3xl bg-white overflow-hidden overflow-y-auto max-h-[90vh]">
            <div className="grid grid-cols-1 md:grid-cols-4 h-full">
               {/* Left Panel: Global Config */}
               <div className="md:col-span-1 bg-slate-900 p-10 space-y-8 text-white">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black tracking-tight text-white">Config.</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Hierarchy</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Professional</Label>
                       <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white">
                             <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-none">
                             {options.teachers.map(t => (
                               <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Timeframe</Label>
                       <Input 
                        placeholder="Academic Year" 
                        value={academicYear} 
                        onChange={e => setAcademicYear(e.target.value)}
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600" 
                       />
                       <Input 
                        placeholder="Semester" 
                        value={semester} 
                        onChange={e => setSemester(e.target.value)}
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600" 
                       />
                    </div>
                  </div>

                  <div className="pt-10">
                     <Button 
                      onClick={handleBulkDeploy}
                      className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl"
                     >
                       Deploy All
                     </Button>
                  </div>
               </div>

               {/* Right Panel: Row-wise Mapping */}
               <div className="md:col-span-3 p-10 space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-4">Assignment Rows</h3>
                    <Button 
                      onClick={addRow}
                      variant="outline"
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 text-indigo-600 font-black gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <PlusCircle className="h-5 w-5" />
                      Add New Row
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {assignmentRows.map((row, index) => {
                      const conflict = getExistingTeacher(row.courseId, row.classId)
                      return (
                        <div key={row.id} className={`grid grid-cols-12 gap-4 items-end p-6 rounded-3xl border transition-all duration-300 animate-in slide-in-from-right-2 ${
                          conflict ? "bg-red-50/50 border-red-100 shadow-inner" : "bg-slate-50/50 border-dotted border-slate-200"
                        }`}>
                           <div className="col-span-1 flex flex-col justify-center items-center h-14">
                              <span className="text-[10px] font-black text-slate-300 bg-white h-8 w-8 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">{index + 1}</span>
                           </div>
                           
                           <div className="col-span-5 space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Subject</Label>
                              <Select 
                                value={row.courseId} 
                                onValueChange={(val) => updateRow(row.id, 'courseId', val)}
                              >
                                 <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200">
                                    <SelectValue placeholder="Select Subject" />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-2xl shadow-2xl border-none">
                                    {options.courses.map(c => (
                                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
  
                           <div className="col-span-5 space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Cohort (Class)</Label>
                              <Select 
                                value={row.classId} 
                                onValueChange={(val) => updateRow(row.id, 'classId', val)}
                              >
                                 <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200">
                                    <SelectValue placeholder="Select Class" />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-2xl shadow-2xl border-none">
                                    {options.classes.map(cl => (
                                      <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
  
                           <div className="col-span-1 flex justify-center pb-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeRow(row.id)}
                                disabled={assignmentRows.length === 1}
                                className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                 <Trash2 className="h-5 w-5" />
                              </Button>
                           </div>

                           {conflict && (
                             <div className="col-start-2 col-span-10 mt-2">
                               <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter flex items-center gap-2 bg-red-100/50 w-fit px-3 py-1.5 rounded-lg border border-red-200">
                                 <AlertCircle className="h-3.5 w-3.5" />
                                 Fiiro gaar ah: Maaddadan waxaa horay u haystay Macallin {conflict.firstName} {conflict.lastName}. Haddii aad dirto, qofkaas ayaa laga saari doonaa.
                               </p>
                             </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
  
                  {(() => {
                    const validRows = assignmentRows.filter(r => r.courseId && r.classId);
                    const uniqueRows = validRows.filter((row, index) => 
                      validRows.findIndex(r => r.courseId === row.courseId && r.classId === row.classId) === index
                    );
                    const conflicts = uniqueRows.filter(r => getExistingTeacher(r.courseId, r.classId));
                    const hasDuplicates = validRows.length !== uniqueRows.length;

                    return validRows.length > 0 && (
                      <div className="pt-6 border-t border-slate-100 space-y-3">
                         <div className="flex flex-wrap gap-4">
                            <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${hasDuplicates ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {hasDuplicates ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                {uniqueRows.length} Unique Mapping(s) Ready
                            </p>
                            {conflicts.length > 0 && (
                              <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-rose-500">
                                 <Layers className="h-3 w-3" />
                                 {conflicts.length} Overwrite(s) Detected
                              </p>
                            )}
                         </div>
                         {hasDuplicates && (
                           <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter animate-pulse">
                             ⚠️ Labo saf ama wax ka badan ayaa isku mid ah. Fadlan xogta sax.
                           </p>
                         )}
                      </div>
                    );
                  })()}
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
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Active Mappings</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{assignments.length}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <UserPlus className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Personnel Engaged</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.teacherId)).size}</h3>
           </div>
        </Card>
        <Card className="rounded-[35px] border-none bg-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
           <div className="h-20 w-20 rounded-[28px] bg-amber-50 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <GraduationCap className="h-10 w-10" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Departmental Coverage</p>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">{new Set(assignments.map(a => a.classId)).size}</h3>
           </div>
        </Card>
      </div>

      {/* Main Assignment Grid */}
      <Card className="rounded-[45px] border-none shadow-2xl bg-white overflow-hidden border border-slate-50">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-none">Assignment Matrix Explorer</h3>
            <p className="text-slate-400 font-medium text-sm mt-2 font-mono">Real-time instructional hierarchy synchronization.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input 
                placeholder="Search matrix by staff or subject..." 
                className="pl-12 h-14 rounded-[20px] border-slate-100 bg-white ring-offset-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-6 rounded-[20px] border-slate-100 bg-white shadow-sm flex items-center gap-2 font-black text-slate-500">
               <Download className="h-4 w-4" />
               Excel Report
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Professional Educator</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Module</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cohorts Assigned</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session</th>
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
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">LMS Verified Account</p>
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
                        <Component className="h-3 w-3 text-emerald-500" />
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
