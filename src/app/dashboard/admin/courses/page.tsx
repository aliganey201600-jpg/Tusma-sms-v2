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
  Layout
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
    if (isInitialState && searchTerm === "" && selectedGrades.length === 0 && selectedCategories.length === 0) return []

    return courses.filter(course => {
      const matchesSearch = (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.code || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(course.grade.toString());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      return matchesSearch && matchesGrade && matchesCategory;
    })
  }, [courses, searchTerm, selectedGrades, selectedCategories, isInitialState])

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
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary animate-bounce" />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Curriculum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-4">
      <style jsx global>{`
        .custom-checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .custom-checkbox-box {
          height: 16px;
          width: 16px;
          border: 1.5px solid #000;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .custom-checkbox-box.checked {
          background-color: #000;
        }
        .filter-dropdown-content {
          min-width: 220px;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg transform rotate-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            Academic Curriculum
          </h1>
          <p className="text-muted-foreground font-medium mt-1 italic flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Define courses, credits, and grade-level requirements.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="h-12 px-6 font-black shadow-lg shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 transition-all rounded-xl gap-2 border-none text-white">
          <Plus className="h-5 w-5" /> NEW COURSE
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[30px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by code or title..." 
              className="pl-10 h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-600 focus:bg-white transition-all focus:ring-orange-500/20"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value) setIsInitialState(false)
              }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Grade Filter */}
            <DropdownMenu open={isGradeOpen} onOpenChange={setIsGradeOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[140px]">
                  {selectedGrades.length === 0 ? "Target Grade" : `Grades (${selectedGrades.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => { if (e.key === "Enter") setIsGradeOpen(false); }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Grade Level</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {grades.map(grade => (
                  <DropdownMenuCheckboxItem
                    key={grade}
                    checked={selectedGrades.includes(grade)}
                    onCheckedChange={() => toggleSelection(grade, selectedGrades, setSelectedGrades)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedGrades.includes(grade) && "checked")}>
                        {selectedGrades.includes(grade) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      Grade {grade}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsGradeOpen(false)} className="justify-center font-black text-[10px] tracking-widest text-orange-500 hover:bg-orange-50 cursor-pointer rounded-lg py-2">
                   CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[140px]">
                  {selectedCategories.length === 0 ? "Category" : `Cats (${selectedCategories.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => { if (e.key === "Enter") setIsCategoryOpen(false); }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Course Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat}
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedCategories.includes(cat) && "checked")}>
                        {selectedCategories.includes(cat) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {cat}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCategoryOpen(false)} className="justify-center font-black text-[10px] tracking-widest text-orange-500 hover:bg-orange-50 cursor-pointer rounded-lg py-2">
                   CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isInitialState && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="h-12 w-12 text-destructive hover:bg-destructive/5 rounded-xl transition-all shadow-sm bg-white" title="Clear Filters">
                <X className="h-4 w-4" />
              </Button>
            )}

            <Button variant="secondary" size="icon" className="h-12 w-12 shrink-0 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Courses Grid / Initial State */}
        <div className="p-6 pt-0">
          {isInitialState ? (
            <div className="py-24 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-20 w-20 bg-orange-50 rounded-full flex items-center justify-center animate-pulse">
                  <Info className="h-8 w-8 text-orange-200" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="text-lg font-black text-slate-900">Browse Curriculum</h3>
                  <p className="text-sm text-slate-500 font-medium">Please use the filters above to explore available courses and grade requirements.</p>
                </div>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold italic">
              No courses found matching your selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-white/50 border border-white/20">
                  <div className="h-1.5 bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
                  <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex justify-between items-start">
                       <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <BookOpen className="h-6 w-6" />
                       </div>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg transition-all">
                                <MoreVertical className="h-5 w-5 text-slate-400" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[24px] border-slate-100 shadow-2xl p-3 w-56">
                             <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-4 py-2 tracking-widest">Course Management</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-slate-50" />
                             <DropdownMenuItem onClick={() => openEdit(course)} className="rounded-2xl hover:bg-orange-50 cursor-pointer flex gap-3 font-bold py-3 text-slate-700">
                                <Edit className="h-5 w-5 text-orange-500" /> Edit Details
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-2xl hover:bg-orange-50 cursor-pointer flex gap-3 font-bold py-3 text-slate-700">
                                <GraduationCap className="h-5 w-5 text-orange-500" /> Assigned Teachers
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-slate-50" />
                             <DropdownMenuItem 
                                onClick={() => handleDelete(course.id)}
                                className="rounded-2xl focus:bg-destructive/5 text-destructive cursor-pointer flex gap-3 font-bold py-3"
                             >
                                <Trash2 className="h-5 w-5" /> Deactivate Course
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-[9px] font-black uppercase mb-1.5 border-orange-200 text-orange-600 bg-orange-50/50">{course.code}</Badge>
                      <CardTitle className="text-xl leading-tight font-black text-slate-900 group-hover:text-orange-600 transition-colors">{course.title}</CardTitle>
                      <CardDescription className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-2 border-l-2 border-orange-500 pl-2">
                        Grade {course.grade} • {course.category}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                     <div className="flex items-center justify-between text-[11px] py-4 border-t border-slate-50">
                        <span className="text-slate-400 font-bold uppercase tracking-tight text-[10px]">Curriculum Credits</span>
                        <span className="font-black text-slate-900">{course.credits} Units</span>
                     </div>
                     <div className="flex items-center justify-between text-[11px] pb-4">
                        <span className="text-slate-400 font-bold uppercase tracking-tight text-[10px]">Active Enrollments</span>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black h-5">{course.enrollments} Students</Badge>
                     </div>
                     <div className="flex gap-2 pt-2">
                        <Link href={`/dashboard/admin/courses/${course.id}/builder`} className="flex-1">
                           <Button className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all gap-2">
                              <Layout className="h-4 w-4" />
                              Builder
                           </Button>
                        </Link>
                        <Button variant="outline" className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all">Details</Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-[40px] sm:max-w-[700px] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-orange-500 text-white">
            <DialogTitle className="text-3xl font-black">Create New Course</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">Add a new curriculum offering to the academic program.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Course Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl h-12 font-bold" placeholder="e.g. Adv. Mathematics" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Course Code (Optional)</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="rounded-xl h-12 font-bold uppercase" placeholder="e.g. MATH-401" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Target Grade Level</Label>
                <Select value={formData.grade} onValueChange={v => setFormData({...formData, grade: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {grades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Category / Dept</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="Core">Core Subject</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Credits / Units</Label>
                <Input value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} className="rounded-xl h-12 font-bold" placeholder="e.g. 3.0" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Assigned Lead Teacher</Label>
                <Select required value={formData.teacherId} onValueChange={v => setFormData({...formData, teacherId: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue placeholder="Select faculty..."/></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {teachersList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Description / Syllabus Overview</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl font-medium resize-none" placeholder="Brief context about this course..." rows={3} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isProcessing} className="rounded-xl font-bold px-8 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Course Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[40px] sm:max-w-[700px] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-slate-900 text-white">
            <DialogTitle className="text-3xl font-black text-white">Edit Academic Course</DialogTitle>
            <DialogDescription className="text-white/60 font-medium">Modify existing curriculum details and assignments.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Course Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl h-12 font-bold" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Course Code</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="rounded-xl h-12 font-bold uppercase" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Target Grade Level</Label>
                <Select value={formData.grade} onValueChange={v => setFormData({...formData, grade: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {grades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Category / Dept</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="Core">Core Subject</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Credits / Units</Label>
                <Input value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} className="rounded-xl h-12 font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Assigned Lead Teacher</Label>
                <Select required value={formData.teacherId} onValueChange={v => setFormData({...formData, teacherId: v})}>
                  <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue placeholder="Select faculty..."/></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {teachersList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Description / Syllabus Overview</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl font-medium resize-none" rows={3} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isProcessing} className="rounded-xl font-bold px-8 bg-slate-900 hover:bg-slate-800 text-white">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

