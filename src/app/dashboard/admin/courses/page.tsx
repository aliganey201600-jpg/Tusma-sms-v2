"use client"

import * as React from "react"
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  Filter,
  ChevronDown,
  Check,
  X,
  Info,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Layout,
  Users
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { fetchCourses, deleteCourse, fetchTeachersForDropdown, fetchClassesForDropdown, createCourse, updateCourse } from "./actions"

export default function AdminCoursesPage() {
  const [courses, setCourses] = React.useState<any[]>([])
  const [teachersList, setTeachersList] = React.useState<any[]>([])
  const [classesList, setClassesList] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Dialog States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null)

  // Form State
  const [formData, setFormData] = React.useState({
    title: "",
    code: "",
    description: "",
    grade: "1",
    category: "Core",
    credits: "3.0",
    teacherId: "",
    classId: ""
  })
  
  // Filters State
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedGrades, setSelectedGrades] = React.useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [isInitialState, setIsInitialState] = React.useState(true)
  
  // Dropdown Open States
  const [isGradeOpen, setIsGradeOpen] = React.useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const [data, tData, cData] = await Promise.all([
      fetchCourses(),
      fetchTeachersForDropdown(),
      fetchClassesForDropdown()
    ])
    setCourses(data)
    setTeachersList(tData)
    setClassesList(cData)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(courses.map(c => c.category)))
    return cats.length > 0 ? cats : ["Core", "Science", "Technology", "Humanities", "Language"]
  }, [courses])

  const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString())

  const toggleSelection = (id: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setIsInitialState(false)
    if (current.includes(id)) {
      setter(current.filter(i => i !== id))
    } else {
      setter([...current, id])
    }
  }

  const handleToggleAll = (allIds: string[], current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setIsInitialState(false)
    if (current.length === allIds.length) {
      setter([])
    } else {
      setter(allIds)
    }
  }

  const clearFilters = () => {
    setSelectedGrades([])
    setSelectedCategories([])
    setSearchTerm("")
    setIsInitialState(true)
  }

  const filteredCourses = React.useMemo(() => {
    if (searchTerm === "" && selectedGrades.length === 0 && selectedCategories.length === 0) return courses

    return courses.filter(course => {
      const matchesSearch = (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.code || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(course.grade.toString());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      return matchesSearch && matchesGrade && matchesCategory;
    })
  }, [courses, searchTerm, selectedGrades, selectedCategories])
 Broadway

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course curriculum?")) {
      const res = await deleteCourse(id)
      if (res.success) {
        toast.success("Course deleted successfully")
        loadData()
      } else {
        toast.error(res.error)
      }
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    const res = await createCourse({
      ...formData,
      grade: Number(formData.grade)
    })
    setIsProcessing(false)
    if (res.success) {
      toast.success("Course created successfully")
      setIsAddOpen(false)
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    setIsProcessing(true)
    const res = await updateCourse(selectedCourse.id, {
      ...formData,
      grade: Number(formData.grade)
    })
    setIsProcessing(false)
    if (res.success) {
      toast.success("Course updated successfully")
      setIsEditOpen(false)
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const openEdit = (course: any) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      code: course.rawCode || "",
      description: course.description || "",
      grade: course.grade.toString(),
      category: course.category,
      credits: course.credits,
      teacherId: course.teacherId || "",
      classId: course.classId || ""
    })
    setIsEditOpen(true)
  }

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      code: "",
      description: "",
      grade: "1",
      category: "Core",
      credits: "3.0",
      teacherId: "",
      classId: ""
    })
    setIsAddOpen(true)
  }

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#F8FAFD]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Academy...</p>
        </div>
      </div>
    )
  }
  const totalEnrollments = (courses || []).reduce((acc, c) => acc + (c.enrollments || 0), 0)

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-40">
      {/* ── Premium Admin Hero ── */}
      <section className="relative pt-12 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e512,transparent_50%)]" />
           <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#6366f108,transparent_50%)]" />
           <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
              <div className="space-y-6">
                <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
                   <Layout className="h-3.5 w-3.5 mr-2" /> Academic Management
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase">
                    Curriculum <span className="text-indigo-400">Vault.</span>
                  </h1>
                  <p className="text-slate-400 font-medium text-lg max-w-xl">
                     Manage your institution&apos;s course repository. Design curricula, track performance, and empower instructors.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                 <Button onClick={handleOpenAdd} className="h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest gap-3 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                    <Plus className="h-5 w-5" /> Initialize New Course
                 </Button>
                 <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-black text-[11px] uppercase tracking-widest gap-3 transition-all">
                    <Info className="h-5 w-5" /> Academy Reports
                 </Button>
              </div>
           </div>

           {/* Global Stats Bar */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, color: "text-indigo-400" },
                { label: "Total Students", value: totalEnrollments.toString(), icon: Users, color: "text-emerald-400" },
                { label: "Avg. Credits", value: "3.5", icon: GraduationCap, color: "text-amber-400" },
                { label: "System Status", value: "Optimal", icon: CheckCircle2, color: "text-blue-400" },
              ].map((s, i) => (
                <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-[2rem] border relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex items-center gap-5 relative z-10">
                       <div className={cn("h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10", s.color)}>
                          <s.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                          <p className="text-2xl font-black text-white">{s.value}</p>
                       </div>
                    </div>
                </Card>
              ))}
           </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-12 relative z-20 space-y-12">
        {/* ── Filters & Search ── */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-6">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search by name or course code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 transition-all font-bold text-slate-800"
              />
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
              <DropdownMenu open={isGradeOpen} onOpenChange={setIsGradeOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-600 font-bold hover:bg-white hover:border-indigo-100 transition-all gap-3 shrink-0">
                    <Filter className="h-4 w-4 text-slate-400" />
                    {selectedGrades.length === 0 ? "All Grades" : `${selectedGrades.length} Selected`}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isGradeOpen ? "rotate-180" : "")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-2xl">
                   <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-2">Filter by Grade</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between text-xs font-bold rounded-lg h-9"
                        onClick={() => handleToggleAll(grades, selectedGrades, setSelectedGrades)}
                      >
                        Select All
                        {selectedGrades.length === grades.length ? <CheckCircle2 className="h-4 w-4 text-indigo-500" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200" />}
                      </Button>
                      {grades.map(grade => (
                        <Button 
                          key={grade} 
                          variant={selectedGrades.includes(grade) ? "secondary" : "ghost"}
                          size="sm" 
                          className={cn("w-full justify-between text-xs font-bold rounded-lg h-9", selectedGrades.includes(grade) ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "")}
                          onClick={() => toggleSelection(grade, selectedGrades, setSelectedGrades)}
                        >
                          Grade {grade}
                          {selectedGrades.includes(grade) && <Check className="h-3 w-3" />}
                        </Button>
                      ))}
                   </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-600 font-bold hover:bg-white hover:border-indigo-100 transition-all gap-3 shrink-0">
                    <Layout className="h-4 w-4 text-slate-400" />
                    {selectedCategories.length === 0 ? "Categories" : `${selectedCategories.length} Selected`}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isCategoryOpen ? "rotate-180" : "")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-2xl">
                   <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-2">Search Category</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                      {categories.map(cat => (
                        <Button 
                          key={cat} 
                          variant={selectedCategories.includes(cat) ? "secondary" : "ghost"}
                          size="sm" 
                          className={cn("w-full justify-between text-xs font-bold rounded-lg h-9", selectedCategories.includes(cat) ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "")}
                          onClick={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                        >
                          {cat}
                          {selectedCategories.includes(cat) && <Check className="h-3 w-3" />}
                        </Button>
                      ))}
                   </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchTerm || selectedGrades.length > 0 || selectedCategories.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} className="h-14 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all">
                   Clear
                </Button>
              )}
           </div>
        </div>

        {/* ── Courses Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white group hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 relative border border-slate-100"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              
              <CardContent className="p-10 space-y-8 relative z-10">
                 <div className="flex items-start justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg text-white group-hover:scale-110 transition-transform duration-500">
                       <BookOpen className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
                          {course.category}
                       </Badge>
                       <span className="text-[10px] font-black text-slate-400 tracking-widest">{course.code}</span>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-[1.15] tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{course.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-black uppercase tracking-widest">
                       <GraduationCap className="h-4 w-4" /> 
                       Grade {course.grade} 
                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                       <span className="text-indigo-500 font-black"> {course.credits} Credits</span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-[11px] pb-4 border-b border-slate-50">
                       <span className="text-slate-400 font-bold uppercase tracking-tight text-[10px]">Active Instructor</span>
                       <span className="font-black text-slate-900">{course.teacher || "Faculty"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pb-4">
                       <span className="text-slate-400 font-bold uppercase tracking-tight text-[10px]">Global Enrollment</span>
                       <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black h-6 px-3">{course.enrollments} Students</Badge>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-2">
                    <Link href={`/dashboard/admin/courses/${course.id}/builder`} className="flex-1">
                       <Button className="w-full h-14 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 gap-3 shadow-xl shadow-slate-200 border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all">
                          <Layout className="h-4 w-4" /> Builder
                       </Button>
                    </Link>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shrink-0">
                             <MoreVertical className="h-5 w-5 text-slate-400" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                          <DropdownMenuItem onClick={() => openEdit(course)} className="rounded-xl h-11 px-4 text-xs font-black uppercase tracking-widest gap-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                             <Edit className="h-4 w-4" /> Edit Profile
                          </DropdownMenuItem>
                          <Link href={`/dashboard/admin/courses/${course.id}/preview`}>
                            <DropdownMenuItem className="rounded-xl h-11 px-4 text-xs font-black uppercase tracking-widest gap-3 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                               <CheckCircle2 className="h-4 w-4" /> Preview Mode
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(course.id)} className="rounded-xl h-11 px-4 text-xs font-black uppercase tracking-widest gap-3 text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                             <Trash2 className="h-4 w-4" /> Terminate Curriculum
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href={`/dashboard/admin/courses/${course.id}`} className="flex-1">
                       <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:border-indigo-100 transition-all">Details</Button>
                    </Link>
                 </div>
              </CardContent>
            </Card>
          ))}
          {filteredCourses.length === 0 && (
             <div className="col-span-full border-2 border-dashed border-slate-200 rounded-[3rem] py-32 flex flex-col items-center justify-center text-slate-400 bg-white/50 space-y-4">
                <Search className="h-12 w-12 opacity-20" />
                <p className="font-black text-xl text-slate-900 tracking-tight uppercase">No Curricula Found</p>
                <p className="text-sm font-medium">Try adjusting your Global Filters.</p>
                <Button onClick={clearFilters} variant="outline" className="rounded-xl h-12 uppercase tracking-widest text-[10px] font-black border-2 border-slate-200 mt-4">Clear All Filters</Button>
             </div>
          )}
        </div>
      </div>

      {/* ── Modals & Dialogs ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl p-0 border-none bg-transparent overflow-hidden">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <div className="bg-slate-950 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-3xl font-black tracking-tight uppercase">Initialize Course</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium pt-1">Provide the foundational parameters for the new academic module.</DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleAddSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Course Full Title</Label>
                  <Input 
                    placeholder="e.g. Advanced Quantum Mechanics" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Course Identifier / Code</Label>
                  <Input 
                    placeholder="e.g. PHY-401" 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Grade Level</Label>
                  <Select value={formData.grade} onValueChange={v => setFormData({ ...formData, grade: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {grades.map(g => <SelectItem key={g} value={g} className="rounded-lg font-bold">Grade {g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Academic Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {["Core", "Science", "Technology", "Humanities", "Language", "Elective"].map(c => <SelectItem key={c} value={c} className="rounded-lg font-bold">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Credit Weight (Units)</Label>
                  <Input 
                    type="number" 
                    step="0.5" 
                    value={formData.credits} 
                    onChange={e => setFormData({ ...formData, credits: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Instructor</Label>
                  <Select value={formData.teacherId} onValueChange={v => setFormData({ ...formData, teacherId: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue placeholder="Assign Instructor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {teachersList.map(t => <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Assigned Class Group</Label>
                  <Select value={formData.classId} onValueChange={v => setFormData({ ...formData, classId: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {classesList.map(c => <SelectItem key={c.id} value={c.id} className="rounded-lg font-bold">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Curriculum Synopsis</Label>
                <Textarea 
                  placeholder="Detailed description of course objectives and outcomes..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="min-h-[120px] rounded-[1.5rem] bg-slate-50 border-slate-100 font-medium focus:bg-white resize-none p-4" 
                />
              </div>

              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</Button>
                <Button type="submit" disabled={isProcessing} className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl shadow-indigo-100 transition-all">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                   Generate Module
                </Button>
              </DialogFooter>
            </form>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl p-0 border-none bg-transparent overflow-hidden">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <div className="bg-indigo-600 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-3xl font-black tracking-tight uppercase">Update Curriculum</DialogTitle>
                <DialogDescription className="text-indigo-100 font-medium pt-1">Refine the parameters and metadata for the selected course profile.</DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleEditSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Course Full Title</Label>
                  <Input 
                    placeholder="e.g. Advanced Quantum Mechanics" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Course Identifier / Code</Label>
                  <Input 
                    placeholder="e.g. PHY-401" 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Grade Level</Label>
                  <Select value={formData.grade} onValueChange={v => setFormData({ ...formData, grade: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {grades.map(g => <SelectItem key={g} value={g} className="rounded-lg font-bold">Grade {g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Academic Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {["Core", "Science", "Technology", "Humanities", "Language", "Elective"].map(c => <SelectItem key={c} value={c} className="rounded-lg font-bold">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Credit Weight (Units)</Label>
                  <Input 
                    type="number" 
                    step="0.5" 
                    value={formData.credits} 
                    onChange={e => setFormData({ ...formData, credits: e.target.value })} 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Instructor</Label>
                  <Select value={formData.teacherId} onValueChange={v => setFormData({ ...formData, teacherId: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue placeholder="Assign Instructor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {teachersList.map(t => <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Assigned Class Group</Label>
                  <Select value={formData.classId} onValueChange={v => setFormData({ ...formData, classId: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {classesList.map(c => <SelectItem key={c.id} value={c.id} className="rounded-lg font-bold">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Curriculum Synopsis</Label>
                <Textarea 
                  placeholder="Detailed description of course objectives and outcomes..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="min-h-[120px] rounded-[1.5rem] bg-slate-50 border-slate-100 font-medium focus:bg-white resize-none p-4" 
                />
              </div>

              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</Button>
                <Button type="submit" disabled={isProcessing} className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl shadow-indigo-100 transition-all">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                   Commit Changes
                </Button>
              </DialogFooter>
            </form>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}

