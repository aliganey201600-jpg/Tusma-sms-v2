"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar, 
  GraduationCap,
  Save,
  ChevronRight,
  ClipboardList,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  AlertCircle
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  fetchExams,
  fetchCoursesForExams,
  createExam,
  fetchExamStudents, 
  saveExamResults,
  fetchExamStats,
  updateExam,
  deleteExam,
  toggleExamStatus,
  duplicateExam
} from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts"

export default function ExamsPage() {
  const [exams, setExams] = React.useState<any[]>([])
  const [courses, setCourses] = React.useState<any[]>([])
  const [stats, setStats] = React.useState({ totalExams: 0, totalGraded: 0, averageScore: "0" })
  const [loading, setLoading] = React.useState(true)
  const [selectedExam, setSelectedExam] = React.useState<any>(null)
  const [examStudents, setExamStudents] = React.useState<any[]>([])
  const [saving, setSaving] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingExam, setEditingExam] = React.useState<any>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // Load data
  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [examsData, coursesData, statsData] = await Promise.all([
        fetchExams(),
        fetchCoursesForExams(),
        fetchExamStats()
      ])
      setExams(examsData as any[])
      setCourses(coursesData as any[])
      setStats(statsData as any)
    } catch (error) {
      toast.error("Waa laygu guuldareystay inaan soo xigto xogta imtixaannada")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const assignmentValue = formData.get("assignment") as string
    const [cId, clsId] = assignmentValue.split("|")

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      courseId: cId,
      classId: clsId,
      maxMarks: parseFloat(formData.get("maxMarks") as string),
      examDate: formData.get("examDate") as string,
    }

    const res = await createExam(data)
    if (res.success) {
      toast.success("Imtixaanka waa la abuuray!")
      setIsCreateOpen(false)
      loadData()
    } else {
      toast.error(res.error || "Waa laygu guuldareystay inaan abuuro imtixaanka")
    }
  }

  const handleUpdateExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingExam) return
    const formData = new FormData(e.currentTarget)
    const assignmentValue = formData.get("assignment") as string
    const [cId, clsId] = assignmentValue.split("|")

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      courseId: cId,
      classId: clsId,
      maxMarks: parseFloat(formData.get("maxMarks") as string),
      examDate: formData.get("examDate") as string,
    }

    const res = await updateExam(editingExam.id, data)
    if (res.success) {
      toast.success("Imtixaanka waa la cusboonaysiiyey!")
      setIsEditOpen(false)
      setEditingExam(null)
      loadData()
    } else {
      toast.error(res.error || "Waa laygu guuldareystay inaan cusboonaysiiyo imtixaanka")
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Ma hubtaa inaad rabto inaad tirtirto imtixaankan?")) return
    const res = await deleteExam(id)
    if (res.success) {
      toast.success("Imtixaanka waa la tirtiray")
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const res = await toggleExamStatus(id, currentStatus)
    if (res.success) {
      toast.success(`Hadda waa ${res.newStatus}`)
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const handleDuplicateExam = async (id: string) => {
    const res = await duplicateExam(id)
    if (res.success) {
      toast.success("Imtixaanka waa la koobiyeeyay")
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const openEditModal = (exam: any) => {
    setEditingExam(exam)
    setIsEditOpen(true)
  }

  const handleSelectExam = async (exam: any) => {
    setSelectedExam(exam)
    const students = await fetchExamStudents(exam.id)
    setExamStudents(students as any[])
  }

  const handleSaveMarks = async () => {
    if (!selectedExam) return
    setSaving(true)
    const res = await saveExamResults(selectedExam.id, examStudents)
    if (res.success) {
      toast.success("Dhibcaha si guul leh ayaa loo keydiyey!")
      setSelectedExam(null)
      loadData()
    } else {
      toast.error("Waa laygu guuldareystay inaan keydiyo dhibcaha")
    }
    setSaving(false)
  }

  const updateMark = (studentId: string, marks: string) => {
    setExamStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, marksObtained: marks } : s
    ))
  }

  const updateRemark = (studentId: string, remark: string) => {
    setExamStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, remarks: remark } : s
    ))
  }

  // Mock chart data
  const chartData = [
    { name: 'Mid', avg: 72 },
    { name: 'Final', avg: 68 },
    { name: 'Quiz 1', avg: 85 },
    { name: 'Quiz 2', avg: 78 },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Exams & Grading
          </h1>
          <p className="text-muted-foreground">Manage formal assessments and track student academic performance.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg rounded-xl h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              Schedule New Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
            <form onSubmit={handleCreateExam}>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold">New Assessment</DialogTitle>
                <DialogDescription>Fill in the details to schedule a new exam or quiz.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Midterm Physics II" required className="rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assessment Type</Label>
                    <Select name="type" defaultValue="MIDTERM" required>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIDTERM">Midterm Exam</SelectItem>
                        <SelectItem value="FINAL">Final Exam</SelectItem>
                        <SelectItem value="QUIZ">Pop Quiz</SelectItem>
                        <SelectItem value="ASSIGNMENT">Formal Assignment</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMarks">Max Marks</Label>
                    <Input id="maxMarks" name="maxMarks" type="number" defaultValue="100" required className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignment">Subject & Class</Label>
                  <Select name="assignment" required>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Choose a course & class" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course, idx) => (
                        <SelectItem key={`${course.id}-${idx}`} value={`${course.courseId}|${course.classId}`}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input id="examDate" name="examDate" type="date" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Brief Description (Optional)</Label>
                  <Textarea id="description" name="description" placeholder="Topics covered, etc." className="rounded-xl min-h-[80px]" />
                </div>
              </div>
              <DialogFooter className="mt-8">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 px-8">Schedule Assessment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!selectedExam ? (
        <React.Fragment>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-3xl border-none shadow-md bg-white overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <BookOpen className="w-16 h-16 text-blue-600" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Assessments</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalExams}</h3>
                <div className="flex items-center text-xs text-green-600 mt-2 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>4 New this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-md bg-white overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-16 h-16 text-indigo-600" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Students Graded</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalGraded}</h3>
                <div className="flex items-center text-xs text-indigo-600 mt-2 font-medium">
                  <ClipboardList className="w-3 h-3 mr-1" />
                  <span>85% Completion rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-md bg-white overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-16 h-16 text-emerald-600" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Performance</p>
                <h3 className="text-3xl font-bold mt-1">{stats.averageScore}%</h3>
                <div className="flex items-center text-xs text-emerald-600 mt-2 font-medium">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  <span>Above target by 2.4%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-6">
              <TabsTrigger value="overview" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">System Overview</TabsTrigger>
              <TabsTrigger value="list" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Assessment List</TabsTrigger>
              <TabsTrigger value="grades" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Global Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Average Test Scores</CardTitle>
                    <CardDescription>Performance trend across different assessment types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Top Performers</CardTitle>
                    <CardDescription>Highest scores recorded in the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                            <div>
                              <p className="font-semibold text-sm">Student Name {i}</p>
                              <p className="text-xs text-muted-foreground italic">Physics II • Final Exam</p>
                            </div>
                          </div>
                          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-200">
                            9{9-i}.5%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Raadi imtixaanka..." className="pl-10 rounded-xl h-11 bg-white" />
                </div>
                <Button variant="outline" className="rounded-xl h-11">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>

              <div className="bg-white rounded-3xl shadow-md overflow-hidden border">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title & Subject</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Max Marks</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                          Ma jiraan imtixaanno la helay. Fadlan schedule gareey kuwa cusub.
                        </td>
                      </tr>
                    ) : (
                      exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-slate-900">{exam.title}</p>
                              <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">{exam.courseName} • {exam.className}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold">
                              {exam.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{exam.maxMarks}</td>
                          <td className="px-6 py-4 text-center text-sm">
                            <div className="flex flex-col items-center">
                              <Calendar className="w-3 h-3 text-muted-foreground mb-1" />
                              {new Date(exam.examDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              exam.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 
                              exam.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                              exam.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' :
                              'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            }`}>
                              {exam.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl"
                                onClick={() => handleSelectExam(exam)}
                              >
                                Grade Marks <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-xl border-slate-200">
                                  <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openEditModal(exam)} className="rounded-xl cursor-pointer py-2.5">
                                    <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>Edit Schedule</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateExam(exam.id)} className="rounded-xl cursor-pointer py-2.5">
                                    <Copy className="mr-2 h-4 w-4 text-indigo-600" />
                                    <span>Duplicate Exam</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(exam.id, exam.status)} className="rounded-xl cursor-pointer py-2.5">
                                    {exam.status === "DRAFT" ? (
                                      <>
                                        <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                                        <span>Publish Now</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="mr-2 h-4 w-4 text-amber-600" />
                                        <span>Back to Draft</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-1 border-slate-100" />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteExam(exam.id)}
                                    className="rounded-xl cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Assessment</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Exam Dialog */}
          <Dialog open={isEditOpen} onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingExam(null)
          }}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
              {editingExam && (
                <form onSubmit={handleUpdateExam}>
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold">Edit Assessment</DialogTitle>
                    <DialogDescription>Modify the details of this scheduled exam.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Exam Title</Label>
                      <Input id="edit-title" name="title" defaultValue={editingExam.title} required className="rounded-xl h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-type">Assessment Type</Label>
                        <Select name="type" defaultValue={editingExam.type} required>
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MIDTERM">Midterm Exam</SelectItem>
                            <SelectItem value="FINAL">Final Exam</SelectItem>
                            <SelectItem value="QUIZ">Pop Quiz</SelectItem>
                            <SelectItem value="ASSIGNMENT">Formal Assignment</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-maxMarks">Max Marks</Label>
                        <Input id="edit-maxMarks" name="maxMarks" type="number" defaultValue={editingExam.maxMarks} required className="rounded-xl h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-assignment">Subject & Class</Label>
                      <Select name="assignment" defaultValue={`${editingExam.courseId}|${editingExam.classId}`} required>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Choose a course & class" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course, idx) => (
                            <SelectItem key={`${course.id}-${idx}`} value={`${course.courseId}|${course.classId}`}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-examDate">Exam Date</Label>
                      <Input 
                        id="edit-examDate" 
                        name="examDate" 
                        type="date" 
                        defaultValue={new Date(editingExam.examDate).toISOString().split('T')[0]} 
                        required 
                        className="rounded-xl h-11" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Brief Description (Optional)</Label>
                      <Textarea id="edit-description" name="description" defaultValue={editingExam.description || ""} className="rounded-xl min-h-[80px]" />
                    </div>
                  </div>
                  <DialogFooter className="mt-8">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl h-11">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 px-8">Update Changes</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </React.Fragment>
      ) : (
        /* Results Entry View */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-3xl border-none shadow-xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setSelectedExam(null)} className="rounded-xl h-10 w-10 p-0 hover:bg-slate-100">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
                <div>
                  <CardTitle className="text-2xl font-bold">{selectedExam.title} Results</CardTitle>
                  <CardDescription>Enter marks for students enrolled in {selectedExam.courseName}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedExam(null)} className="rounded-xl h-11">Discard</Button>
                <Button 
                  onClick={handleSaveMarks} 
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 px-6 shadow-md"
                >
                   {saving ? "Saving..." : <React.Fragment><Save className="w-4 h-4 mr-2" /> Save All Grades</React.Fragment>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Info</th>
                      <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID Number</th>
                      <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Marks Obtained (Max {selectedExam.maxMarks})</th>
                      <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks / Comments</th>
                      <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-32">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {examStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                          Lama helin arday u diwaangashan maaddadan.
                        </td>
                      </tr>
                    ) : (
                      examStudents.map((student) => {
                        const marks = parseFloat(student.marksObtained || "0");
                        const percentage = (marks / selectedExam.maxMarks) * 100;
                        let grade = 'F';
                        let gradeColor = 'text-red-600 bg-red-50';
                        
                        if (percentage >= 90) { grade = 'A+'; gradeColor = 'text-emerald-700 bg-emerald-50 ring-emerald-200'; }
                        else if (percentage >= 80) { grade = 'A'; gradeColor = 'text-emerald-600 bg-emerald-50'; }
                        else if (percentage >= 70) { grade = 'B'; gradeColor = 'text-blue-600 bg-blue-50'; }
                        else if (percentage >= 60) { grade = 'C'; gradeColor = 'text-indigo-600 bg-indigo-50'; }
                        else if (percentage >= 50) { grade = 'D'; gradeColor = 'text-amber-600 bg-amber-50'; }

                        return (
                          <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <p className="font-semibold text-slate-900">{student.firstName} {student.lastName}</p>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{student.manualId}</code>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <Input 
                                type="number" 
                                min="0" 
                                max={selectedExam.maxMarks}
                                className="w-24 mx-auto text-center h-10 rounded-xl focus:ring-indigo-500 font-bold border-slate-300" 
                                value={student.marksObtained || ""}
                                onChange={(e) => updateMark(student.studentId, e.target.value)}
                              />
                            </td>
                            <td className="px-8 py-5">
                              <Input 
                                className="w-full text-sm h-10 rounded-xl border-slate-200" 
                                placeholder="Good progress / Needs improvement" 
                                value={student.remarks || ""}
                                onChange={(e) => updateRemark(student.studentId, e.target.value)}
                              />
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-lg font-black ring-1 ${gradeColor}`}>
                                {grade}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
