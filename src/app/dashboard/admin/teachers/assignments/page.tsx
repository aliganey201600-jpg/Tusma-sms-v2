"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { 
  fetchTeacherAssignments, 
  fetchAssignmentOptions, 
  createBulkAssignments, 
  deleteAssignment,
  rolloverAssignments,
  fetchUnassignedSubjects,
  fetchTeacherWorkloadReport
} from "./actions"

function MultiSelectCustom({ 
  items, 
  selected, 
  onToggle, 
  label, 
  placeholder,
  className = ""
}: { 
  items: any[], 
  selected: string[], 
  onToggle: (id: string) => void, 
  label: string, 
  placeholder: string,
  className?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div 
          className={cn(
            "h-14 rounded-2xl bg-white border border-slate-200 px-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all w-full",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {selected.length === 0 ? (
              <span className="text-slate-400 text-sm">{placeholder}</span>
            ) : (
              selected.map(id => (
                <Badge key={id} variant="secondary" className="h-6 px-2 text-[10px] bg-slate-100 font-black border-none text-slate-700">
                  {items.find(i => i.id === id)?.name || id}
                </Badge>
              ))
            )}
          </div>
          <Plus className="h-4 w-4 text-slate-400" />
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-[300px] rounded-3xl p-4 shadow-3xl bg-white border-slate-100 z-[1000]"
      >
        <div className="mb-4 flex justify-between items-center px-2">
           <DropdownMenuLabel className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] p-0">
             {label}
           </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator className="mb-2 bg-slate-50" />
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {items.map(item => {
            const isSelected = selected.includes(item.id);
            return (
              <DropdownMenuItem 
                key={item.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onToggle(item.id);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all focus:bg-indigo-50 focus:text-indigo-700 ${
                  isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>
                <span className="text-sm font-bold">{item.name}</span>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [options, setOptions] = React.useState<{teachers: any[], courses: any[], classes: any[], existing: any[]}>({ 
    teachers: [], courses: [], classes: [], existing: [] 
  })
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isRolloverOpen, setIsRolloverOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [unassignedCount, setUnassignedCount] = React.useState(0)
  const [workloadReport, setWorkloadReport] = React.useState<any[]>([])
  const [isWorkloadOpen, setIsWorkloadOpen] = React.useState(false)

  // Rollover state
  const [rolloverFrom, setRolloverFrom] = React.useState("2023-2024")
  const [rolloverTo, setRolloverTo] = React.useState("2024-2025")

  // New Row-based state
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("")
  const [assignmentRows, setAssignmentRows] = React.useState<{id: string, courseIds: string[], classIds: string[]}[]>([
    { id: Math.random().toString(), courseIds: [], classIds: [] }
  ])
  const [academicYear, setAcademicYear] = React.useState("2024-2025")
  const [semester, setSemester] = React.useState("Semester 1")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const [data, opts, unassigned, report] = await Promise.all([
      fetchTeacherAssignments(),
      fetchAssignmentOptions(),
      fetchUnassignedSubjects(academicYear),
      fetchTeacherWorkloadReport(academicYear)
    ])
    setAssignments(data as any[])
    setOptions(opts as any)
    setUnassignedCount((unassigned as any[]).length)
    setWorkloadReport(report as any[])
    setLoading(false)
  }, [academicYear])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleRollover = async () => {
    if (confirm(`Ma hubtaa inaad ka soo guuriso dhammaan qoondaynta sanadka ${rolloverFrom} una wareejiso ${rolloverTo}?`)) {
      setLoading(true)
      const res = await rolloverAssignments(rolloverFrom, rolloverTo)
      if (res.success) {
        toast.success(`Guul! ${res.count} xiriir ayaa si toos ah loogu abuuray sanadka ${rolloverTo}.`)
        setIsRolloverOpen(false)
        loadData()
      } else {
        toast.error(res.error)
      }
      setLoading(false)
    }
  }

  const addRow = () => {
    setAssignmentRows([...assignmentRows, { id: Math.random().toString(), courseIds: [], classIds: [] }])
  }

  const removeRow = (id: string) => {
    if (assignmentRows.length === 1) {
      setAssignmentRows([{ id: Math.random().toString(), courseIds: [], classIds: [] }])
      return
    }
    setAssignmentRows(assignmentRows.filter(r => r.id !== id))
  }

  const resetForm = () => {
    if (confirm("Ma hubtaa inaad nadiifiso dhammaan safafka?")) {
      setAssignmentRows([{ id: Math.random().toString(), courseIds: [], classIds: [] }])
      setSelectedTeacherId("")
    }
  }

  const exportCSV = () => {
    const headers = ["Teacher", "Course", "Class", "Year", "Semester"]
    const rows = filteredAssignments.map(a => [
      `${a.teacherFirst} ${a.teacherLast}`,
      a.courseName,
      a.className,
      a.academicYear || "2024-2025",
      a.semester || "Semester 1"
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Teacher_Assignments_${academicYear}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const updateRow = (id: string, field: 'courseIds' | 'classIds', value: string) => {
    setAssignmentRows(assignmentRows.map(r => {
      if (r.id === id) {
        const current = r[field] as string[]
        const next = current.includes(value) ? current.filter(i => i !== value) : [...current, value]
        return { ...r, [field]: next }
      }
      return r
    }))
  }

  const handleBulkDeploy = async () => {
    if (!selectedTeacherId) {
      toast.error("Fadlan dooro Macallinka")
      return
    }

    const flatAssignments: { courseId: string, classId: string }[] = []
    assignmentRows.forEach(row => {
      row.courseIds.forEach(courseId => {
        row.classIds.forEach(classId => {
          flatAssignments.push({ courseId, classId })
        })
      })
    })

    if (flatAssignments.length === 0) {
      toast.error("Fadlan ku dar ugu yaraan hal Maaddo iyo hal Fasal")
      return
    }

    // Check for internal duplicates across rows
    const uniquePairs = new Set()
    for (const pair of flatAssignments) {
       const key = `${pair.courseId}-${pair.classId}`
       if (uniquePairs.has(key)) {
          toast.error("Waxaad dooratay maaddo iyo fasal isku mid ah dhowr jeer. Fadlan sax.")
          return
       }
       uniquePairs.add(key)
    }

    const res = await createBulkAssignments({
      teacherId: selectedTeacherId,
      assignments: flatAssignments,
      academicYear,
      semester
    })

    if (res.success) {
      toast.success("Si guul leh ayaa loo qoondeeyey!")
      setIsCreateOpen(false)
      loadData()
      setAssignmentRows([{ id: Math.random().toString(), courseIds: [], classIds: [] }])
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

  const getExistingTeacher = (courseIds: string[], classIds: string[]) => {
    if (courseIds.length === 0 || classIds.length === 0) return null
    for (const courseId of courseIds) {
      for (const classId of classIds) {
        const match = options.existing?.find(e => e.courseId === courseId && e.classId === classId && e.teacherId !== selectedTeacherId)
        if (match) return match
      }
    }
    return null
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

        <div className="flex gap-4">
          <Dialog open={isWorkloadOpen} onOpenChange={setIsWorkloadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 px-8 rounded-[22px] border-slate-200 bg-white text-slate-700 font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all gap-3">
                <LayoutGrid className="h-6 w-6 text-indigo-600" />
                Workload Insights
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[40px] sm:max-w-[1000px] p-10 border-none shadow-3xl bg-white overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">Workload Intelligence Report</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-lg">
                  Real-time analysis of educator distribution and instructional volume.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 overflow-x-auto rounded-[30px] border border-slate-100 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Educator</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classes</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Subjects</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Credit Hours</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Reach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {workloadReport.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                              {r.firstName ? r.firstName[0] : ''}{r.lastName ? r.lastName[0] : ''}
                            </div>
                            <span className="font-bold text-slate-900">{r.firstName} {r.lastName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-600">{r.classCount}</td>
                        <td className="px-8 py-6 font-bold text-slate-600">{r.subjectSessions}</td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none font-black px-3 py-1">
                            {Number(r.totalHours).toFixed(1)} hrs
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-indigo-600 font-black">
                            <UserPlus className="h-3.5 w-3.5" />
                            {r.totalStudents}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => setIsWorkloadOpen(false)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest">
                  Close Intelligence View
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-16 px-10 rounded-[22px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-none">
                <Plus className="h-6 w-6" />
                Smart Matrix Creator
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[30px] md:rounded-[40px] sm:max-w-[1100px] p-0 border-none shadow-3xl bg-white overflow-y-auto max-h-[95vh] scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-fit">
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
                             {options.teachers.map(t => {
                               const load = assignments.filter(a => a.teacherId === t.id).length
                               return (
                                 <SelectItem key={t.id} value={t.id}>
                                   <div className="flex justify-between items-center w-full gap-2 min-w-[200px]">
                                     <span>{t.firstName} {t.lastName}</span>
                                     <Badge variant="secondary" className="bg-slate-100 text-[10px] font-black h-5">{load} Loads</Badge>
                                   </div>
                                 </SelectItem>
                               )
                             })}
                          </SelectContent>
                       </Select>
                       {selectedTeacherId && (
                         <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capacity Load</p>
                           <div className="flex items-center gap-3">
                             <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-1000 ${
                                   (assignments.filter(a => a.teacherId === selectedTeacherId).length >= 18) ? 'bg-rose-500' : 'bg-indigo-500'
                                 }`}
                                 style={{ width: `${Math.min((assignments.filter(a => a.teacherId === selectedTeacherId).length / 20) * 100, 100)}%` }}
                               />
                             </div>
                             <span className="text-xs font-black">{assignments.filter(a => a.teacherId === selectedTeacherId).length}/20</span>
                           </div>
                         </div>
                       )}
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

                  <div className="pt-6 md:pt-10 space-y-3 mt-auto">
                     <Button 
                      onClick={handleBulkDeploy}
                      className="w-full h-14 md:h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl text-xs md:text-sm"
                     >
                       Deploy All
                     </Button>
                     <Button 
                      onClick={resetForm}
                      variant="ghost"
                      className="w-full h-10 md:h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest"
                     >
                       Reset Form
                     </Button>
                  </div>
               </div>

               {/* Right Panel: Row-wise Mapping */}
                <div className="md:col-span-3 p-6 md:p-10 space-y-6 bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-4">Assignment Rows</h3>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          const firstClassIds = assignmentRows[0]?.classIds
                          if (firstClassIds && firstClassIds.length > 0) {
                            setAssignmentRows(assignmentRows.map(r => ({ ...r, classIds: r.classIds.length === 0 ? [...firstClassIds] : r.classIds })))
                            toast.success("Fasallada bannaan waa lagu shubay")
                          }
                        }}
                        variant="outline"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all px-4"
                      >
                        Apply Class to All
                      </Button>
                      <Button 
                        onClick={addRow}
                        variant="outline"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50 text-indigo-600 font-black gap-2 hover:bg-indigo-600 hover:text-white transition-all px-4"
                      >
                        <PlusCircle className="h-5 w-5" />
                        Add New Row
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {assignmentRows.map((row, index) => {
                      const conflict = getExistingTeacher(row.courseIds, row.classIds)
                      return (
                        <div key={row.id} className={`grid grid-cols-12 gap-4 items-start p-6 rounded-3xl border transition-all duration-300 animate-in slide-in-from-right-2 ${
                          conflict ? "bg-red-50/50 border-red-100 shadow-inner" : "bg-slate-50/50 border-dotted border-slate-200"
                        }`}>
                           <div className="col-span-1 flex flex-col justify-center items-center h-14">
                              <span className="text-[10px] font-black text-slate-300 bg-white h-8 w-8 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">{index + 1}</span>
                           </div>
                           
                           <div className="col-span-10 grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Subject(s)</Label>
                                <MultiSelectCustom 
                                  items={options.courses}
                                  selected={row.courseIds}
                                  onToggle={(id) => updateRow(row.id, 'courseIds', id)}
                                  label="Select Subject(s)"
                                  placeholder="Choose Subjects"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Cohort(s)</Label>
                                <MultiSelectCustom 
                                  items={options.classes}
                                  selected={row.classIds}
                                  onToggle={(id) => updateRow(row.id, 'classIds', id)}
                                  label="Select Class(es)"
                                  placeholder="Choose Classes"
                                />
                              </div>
                           </div>
  
                           <div className="col-span-1 flex justify-center pt-8">
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
                    const flatPairs: any[] = [];
                    assignmentRows.forEach(row => {
                      row.courseIds.forEach(c => {
                        row.classIds.forEach(cl => {
                          flatPairs.push({ courseId: c, classId: cl })
                        })
                      })
                    })
                    
                    const uniquePairs = new Set();
                    const uniques = flatPairs.filter(p => {
                       const key = `${p.courseId}-${p.classId}`;
                       if (uniquePairs.has(key)) return false;
                       uniquePairs.add(key);
                       return true;
                    });
                    
                    const conflicts = uniques.filter(p => {
                      return options.existing?.find(e => e.courseId === p.courseId && e.classId === p.classId && e.teacherId !== selectedTeacherId)
                    });

                    return uniques.length > 0 && (
                      <div className="pt-6 border-t border-slate-100 space-y-3">
                         <div className="flex flex-wrap gap-4">
                            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                {uniques.length} Total Assignment(s) Prepared
                            </p>
                            {conflicts.length > 0 && (
                              <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-rose-500">
                                 <Layers className="h-3 w-3" />
                                 {conflicts.length} Overwrite(s) Detected
                              </p>
                            )}
                         </div>
                      </div>
                    );
                  })()}
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Unassigned Coverage</p>
              <h3 className="text-4xl font-black text-rose-600 leading-tight">{unassignedCount} <span className="text-sm text-slate-400 font-bold">Subjects</span></h3>
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
            <Button 
              onClick={exportCSV}
              variant="outline" 
              className="h-14 px-6 rounded-[20px] border-slate-100 bg-white shadow-sm flex items-center gap-2 font-black text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
            >
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
