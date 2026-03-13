"use client"

import * as React from "react"
import { 
  Users, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Mail, 
  Trash2, 
  Edit, 
  UserCheck,
  Filter,
  ChevronDown,
  Check,
  X,
  Info,
  CheckCircle2,
  GraduationCap,
  Building2,
  Calendar,
  Loader2,
  UserPlus,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Activity,
  Megaphone,
  AlertTriangle,
  Bell,
  ChevronRight,
  Sparkles,
  Link as LinkIcon,
  BookOpen
} from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { fetchTeachers, deleteTeacher, createTeacher, updateTeacher, fetchTeacherStats, getTeacherPerformance, getAnnouncements, createAnnouncement, deleteAnnouncement, getTeacherResources, createTeacherResource, deleteTeacherResource } from "./actions"
import { format } from "date-fns"

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = React.useState<any[]>([])
  const [stats, setStats] = React.useState({ totalTeachers: 0, activeDepts: 0, assignedClasses: 0 })
  const [announcements, setAnnouncements] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isAnnouncementOpen, setIsAnnouncementOpen] = React.useState(false)
  const [announcementForm, setAnnouncementForm] = React.useState({ title: "", content: "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH", expiresAt: "" })
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedTeacher, setSelectedTeacher] = React.useState<any>(null)
  const [performanceData, setPerformanceData] = React.useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isLoadingPerformance, setIsLoadingPerformance] = React.useState(false)
  
  // Resource States
  const [teacherResources, setTeacherResources] = React.useState<any[]>([])
  const [isAddingResource, setIsAddingResource] = React.useState(false)
  const [resourceForm, setResourceForm] = React.useState({ title: "", description: "", fileUrl: "", fileType: "LESSON_PLAN" })
  
  // Form States
  const [formData, setFormData] = React.useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    joinDate: format(new Date(), "yyyy-MM-dd"),
    phone: "",
    bio: "",
    specialization: "",
    qualification: "",
    gender: "MALE",
    address: "",
    status: "ACTIVE"
  })

  // Filters State
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedDepts, setSelectedDepts] = React.useState<string[]>([])
  const [isInitialState, setIsInitialState] = React.useState(true)
  
  // Dropdown Open States
  const [isDeptOpen, setIsDeptOpen] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const [teachersData, statsData, announcementsData] = await Promise.all([
      fetchTeachers(),
      fetchTeacherStats(),
      getAnnouncements()
    ])
    setTeachers(teachersData)
    setStats(statsData)
    if (announcementsData.success) setAnnouncements(announcementsData.announcements)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const departments = [
    "Mathematics", "Science", "Technology", "Humanities", "Language", 
    "Physical Education", "Arts", "Islamic Studies", "Arabic"
  ]

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
    setSelectedDepts([])
    setSearchTerm("")
    setIsInitialState(true)
  }

  const filteredTeachers = React.useMemo(() => {
    if (isInitialState && searchTerm === "" && selectedDepts.length === 0) return teachers

    return teachers.filter(teacher => {
      const name = teacher.name || "";
      const email = teacher.email || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(teacher.department);
      return matchesSearch && matchesDept;
    })
  }, [teachers, searchTerm, selectedDepts, isInitialState])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will permanently delete the teacher and their user account.")) {
      setIsProcessing(true)
      const res = await deleteTeacher(id)
      setIsProcessing(false)
      if (res.success) {
        toast.success("Record deleted")
        loadData()
      } else {
        toast.error(res.error)
      }
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await deleteAnnouncement(id)
    if (res.success) {
      toast.success("Announcement removed")
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } else {
      toast.error("Failed to remove announcement")
    }
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    const res = await createAnnouncement({ 
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      expiresAt: announcementForm.expiresAt || undefined
    })
    setIsProcessing(false)
    if (res.success) {
      toast.success("Announcement published!")
      setIsAnnouncementOpen(false)
      setAnnouncementForm({ title: "", content: "", priority: "MEDIUM", expiresAt: "" })
      loadData()
    } else {
      toast.error(res.error || "Failed to publish")
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    const res = await createTeacher(formData)
    setIsProcessing(false)
    if (res.success) {
      toast.success("Teacher registered")
      setIsAddOpen(false)
      loadData()
      setFormData({
        firstName: "", lastName: "", email: "", department: "", 
        joinDate: format(new Date(), "yyyy-MM-dd"),
        phone: "", bio: "", specialization: "", qualification: "", 
        gender: "MALE", address: "", status: "ACTIVE"
      })
    } else {
      toast.error(res.error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setIsProcessing(true)
    const res = await updateTeacher(selectedTeacher.id, formData)
    setIsProcessing(false)
    if (res.success) {
      toast.success("Profile updated")
      setIsEditOpen(false)
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  const openEdit = (teacher: any) => {
    setSelectedTeacher(teacher)
    const [firstName = "", ...rest] = teacher.name.split(" ")
    setFormData({
      ...teacher,
      firstName,
      lastName: rest.join(" "),
      joinDate: teacher.joinDate.split('T')[0]
    })
    setIsEditOpen(true)
  }

  const openProfile = async (teacher: any) => {
    setSelectedTeacher(teacher)
    setIsProfileOpen(true)
    setIsLoadingPerformance(true)
    
    // Reset states
    setTeacherResources([])
    setIsAddingResource(false)

    const [perfRes, resRes] = await Promise.all([
      getTeacherPerformance(teacher.id),
      getTeacherResources(teacher.id)
    ])
    
    if (perfRes.success) {
      setPerformanceData(perfRes.metrics)
    } else {
      toast.error("Failed to load analytics")
    }

    if (resRes.success) {
      setTeacherResources(resRes.resources)
    }

    setIsLoadingPerformance(false)
  }

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setIsProcessing(true)
    const res = await createTeacherResource({
      ...resourceForm,
      teacherId: selectedTeacher.id
    })
    setIsProcessing(false)
    if (res.success) {
      toast.success("Resource shared successfully")
      setTeacherResources(prev => [res.resource, ...prev])
      setIsAddingResource(false)
      setResourceForm({ title: "", description: "", fileUrl: "", fileType: "LESSON_PLAN" })
    } else {
      toast.error(res.error)
    }
  }

  const handleDeleteResource = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const res = await deleteTeacherResource(id)
    if (res.success) {
      toast.success("Resource removed")
      setTeacherResources(prev => prev.filter(r => r.id !== id))
    } else {
      toast.error("Failed to remove resource")
    }
  }

  if (isLoading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Users className="h-12 w-12 text-primary/20 animate-bounce" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Faculty Database...</p>
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
        .stats-card {
           background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%);
           border: 1px solid rgba(255,255,255,0.8);
           box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05);
        }
        .form-tabs-trigger[data-state='active'] { background: #000; color: #fff; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            Faculty Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1 italic flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Empowering 2025 LMS standards for teacher coordination.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="h-12 px-6 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all rounded-xl gap-2"
        >
          <Plus className="h-5 w-5" /> REGISTER FACULTY
        </Button>
      </div>

      {/* Announcement Board */}
      <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white p-0">
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white uppercase tracking-widest">Faculty Broadcast Board</h3>
              <p className="text-[10px] text-slate-500 font-bold">{announcements.length} active announcement{announcements.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAnnouncementOpen(true)} 
            className="h-9 rounded-xl bg-white/10 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest gap-2 border border-white/10 transition-all"
          >
            <Bell className="h-3.5 w-3.5" /> New Broadcast
          </Button>
        </div>

        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-600">
            <Sparkles className="h-8 w-8 opacity-30" />
            <p className="text-[11px] font-black uppercase tracking-widest">No active announcements</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex gap-4 p-6 scrollbar-hide">
            {announcements.map((ann: any) => (
              <div 
                key={ann.id}
                className={cn(
                  "flex-shrink-0 w-72 rounded-[24px] p-6 space-y-3 border transition-all hover:scale-[1.02] relative group",
                  ann.priority === "HIGH"
                    ? "bg-red-950/40 border-red-500/20 hover:border-red-500/40"
                    : ann.priority === "MEDIUM"
                    ? "bg-amber-950/40 border-amber-500/20 hover:border-amber-500/40"
                    : "bg-slate-800/60 border-white/5 hover:border-white/10"
                )}
              >
                <button 
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="absolute top-3 right-3 h-7 w-7 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border-0",
                    ann.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
                    ann.priority === "MEDIUM" ? "bg-amber-500/20 text-amber-400" :
                    "bg-slate-600/30 text-slate-400"
                  )}>
                    {ann.priority === "HIGH" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                    {ann.priority}
                  </Badge>
                  {ann.expiresAt && (
                    <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> Expires {format(new Date(ann.expiresAt), "MMM d")}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-white text-sm leading-snug">{ann.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">{ann.content}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                    <Megaphone className="h-2.5 w-2.5" /> Admin Broadcast
                  </span>
                  <span className="text-[9px] text-slate-600">{format(new Date(ann.createdAt), "MMM d, HH:mm")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card p-6 rounded-[24px] flex items-center gap-5 border-none">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Teachers</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.totalTeachers}</h3>
          </div>
        </Card>
        
        <Card className="stats-card p-6 rounded-[24px] flex items-center gap-5 border-none">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Organization Units</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.activeDepts}</h3>
          </div>
        </Card>

        <Card className="stats-card p-6 rounded-[24px] flex items-center gap-5 border-none">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Workload Load</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.assignedClasses} Assigned</h3>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[30px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search faculty identity..." 
              className="pl-10 h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-600 focus:bg-white transition-all focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value) setIsInitialState(false)
              }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Department Filter */}
            <DropdownMenu open={isDeptOpen} onOpenChange={setIsDeptOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[140px]">
                  {selectedDepts.length === 0 ? "Department" : `Dept (${selectedDepts.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="min-w-[200px] p-2 rounded-2xl shadow-2xl border-none" 
                align="end"
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Academic Depts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedDepts.length === departments.length}
                  onCheckedChange={() => handleToggleAll(departments, selectedDepts, setSelectedDepts)}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                >
                  <div className="custom-checkbox-container">
                    <div className={cn("custom-checkbox-box", selectedDepts.length === departments.length && "checked")}>
                      {selectedDepts.length === departments.length && <Check className="h-3 w-3 text-white" />}
                    </div>
                    SELECT ALL
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {departments.map(dept => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={selectedDepts.includes(dept)}
                    onCheckedChange={() => toggleSelection(dept, selectedDepts, setSelectedDepts)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedDepts.includes(dept) && "checked")}>
                        {selectedDepts.includes(dept) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {dept}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100/50 hover:bg-transparent">
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] pl-10">Faculty Member</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Specialization</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Status</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-center">Workload</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-right pr-10">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Info className="h-7 w-7 text-slate-300" />
                      </div>
                      <h3 className="font-black text-slate-900">Catalogue is Empty</h3>
                      <p className="text-sm text-slate-400 max-w-[200px] mx-auto">No faculty members found in the current selection.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="group border-b border-slate-50 hover:bg-slate-50/20 transition-all">
                    <TableCell className="py-6 pl-10">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary transition-colors border border-slate-100 overflow-hidden shrink-0">
                          {teacher.avatarUrl ? (
                            <img src={teacher.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-primary group-hover:text-white uppercase">
                              {teacher.name.split(" ").map((n: any) => n[0]).join("").slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm">{teacher.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{teacher.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="rounded-lg bg-indigo-50 text-indigo-700 border-indigo-100 font-black px-2 py-0.5 text-[9px] uppercase w-fit mb-1">
                          {teacher.department}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-500">{teacher.specialization || "Generalist"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-xl font-black px-4 py-1 text-[9px] uppercase border",
                        teacher.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        teacher.status === "ON_LEAVE" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                      )} variant="outline">
                        {teacher.status || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-black text-slate-900 text-xs bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          {teacher.classes} Classes
                        </span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{teacher.resources} Materials Shared</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-2 text-slate-300">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:text-primary hover:bg-primary/5">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white hover:shadow-xl rounded-xl transition-all">
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[24px] border-none shadow-2xl p-2 w-56">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-4 py-2">Account Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem 
                              onClick={() => openProfile(teacher)}
                              className="rounded-xl hover:bg-primary/5 cursor-pointer font-bold py-3 text-slate-700 flex gap-2"
                            >
                              <ExternalLink className="h-4 w-4 text-primary" /> View Detail Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openEdit(teacher)}
                              className="rounded-xl hover:bg-primary/5 cursor-pointer font-bold py-3 text-slate-700 flex gap-2"
                            >
                              <Edit className="h-4 w-4 text-primary" /> Update Professional Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(teacher.id)}
                              className="rounded-xl focus:bg-destructive/5 text-destructive cursor-pointer font-bold py-3 flex gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> Terminate Faculty
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Unified Add/Edit Dialog */}
      {[
        { isOpen: isAddOpen, setOpen: setIsAddOpen, submit: handleAddSubmit, title: "Register Faculty", icon: UserPlus, color: "bg-primary" },
        { isOpen: isEditOpen, setOpen: setIsEditOpen, submit: handleEditSubmit, title: "Edit Professional Bio", icon: Edit, color: "bg-slate-900" }
      ].map((dialog) => (
        <Dialog key={dialog.title} open={dialog.isOpen} onOpenChange={dialog.setOpen}>
          <DialogContent className="rounded-[40px] sm:max-w-[650px] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className={cn("p-10 pb-6 text-white", dialog.color)}>
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <dialog.icon className="h-7 w-7 text-white" />
              </div>
              <DialogTitle className="text-3xl font-black">{dialog.title}</DialogTitle>
              <DialogDescription className="text-white/70 font-medium">Standardized teacher data compliant with 2025 LMS profiles.</DialogDescription>
            </DialogHeader>
            <form onSubmit={dialog.submit}>
              <Tabs defaultValue="basic" className="w-full">
                <div className="px-10 mt-6">
                  <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl w-full grid grid-cols-2">
                    <TabsTrigger value="basic" className="rounded-xl font-black text-[10px] uppercase tracking-widest form-tabs-trigger">1. Basic Info</TabsTrigger>
                    <TabsTrigger value="pro" className="rounded-xl font-black text-[10px] uppercase tracking-widest form-tabs-trigger">2. Professional Details</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="basic" className="p-10 pt-6 space-y-4 outline-none">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">First Name</Label>
                      <Input required className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Last Name</Label>
                      <Input required className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Email / Username</Label>
                      <Input required type="email" className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Official Contract No.</Label>
                      <Input required placeholder="+252..." className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Gender Identity</Label>
                      <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                        <SelectTrigger className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl font-bold">
                          <SelectItem value="MALE" className="rounded-xl">Male</SelectItem>
                          <SelectItem value="FEMALE" className="rounded-xl">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Residential Address</Label>
                      <Input placeholder="City, District" className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pro" className="p-10 pt-6 space-y-4 outline-none">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Primary Department</Label>
                      <Select value={formData.department} onValueChange={v => setFormData({...formData, department: v})}>
                        <SelectTrigger className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50">
                          <SelectValue placeholder="Select Dept" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl font-bold">
                          {departments.map(d => <SelectItem key={d} value={d} className="rounded-xl">{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Faculty Status</Label>
                      <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl font-bold">
                          <SelectItem value="ACTIVE" className="rounded-xl text-emerald-600">Active Duty</SelectItem>
                          <SelectItem value="ON_LEAVE" className="rounded-xl text-amber-600">On Medical Leave</SelectItem>
                          <SelectItem value="INACTIVE" className="rounded-xl text-slate-400">Suspended / Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Highest Qualification</Label>
                      <Input placeholder="PhD, Masters, etc." className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Expertise / Specialization</Label>
                      <Input placeholder="e.g. Quantum Physics" className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Professional Bio</Label>
                    <Textarea placeholder="Describe the teaching philosophy and background..." className="rounded-2xl min-h-[100px] font-bold border-slate-100 bg-slate-50" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="p-10 pt-0 flex justify-between gap-4 border-none">
                <Button type="button" variant="ghost" onClick={() => dialog.setOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400">CANCEL</Button>
                <Button disabled={isProcessing} className="rounded-2xl h-14 px-12 font-black bg-slate-900 text-white shadow-2xl shadow-indigo-200 gap-3 grow sm:grow-0">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  FINALIZE PROFILE
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ))}
      {/* Profile / Analytics Detail Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="rounded-[40px] sm:max-w-[750px] border-none shadow-2xl p-0 overflow-hidden bg-slate-50/50 backdrop-blur-3xl">
          {selectedTeacher && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Profile Header */}
              <div className="p-8 pb-32 bg-slate-900 text-white relative">
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-[32px] bg-white border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {selectedTeacher.avatarUrl ? (
                         <img src={selectedTeacher.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-slate-900">
                          {selectedTeacher.name.split(" ").map((n: any) => n[0]).join("").slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedTeacher.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-primary/20 text-primary border-primary/20 font-black px-3 py-1 rounded-xl uppercase text-[10px]">
                          {selectedTeacher.department}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {selectedTeacher.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-white bg-white/5 hover:bg-white/10 rounded-2xl h-12 w-12" onClick={() => setIsProfileOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="px-8 -mt-24 pb-8 relative z-20 overflow-y-auto">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-slate-200/50 p-2 rounded-[28px] h-auto flex flex-wrap w-full max-w-lg mx-auto shadow-sm border border-white/50">
                    <TabsTrigger value="overview" className="rounded-[20px] font-black text-[11px] uppercase tracking-widest grow h-12">Academy Profile</TabsTrigger>
                    <TabsTrigger value="resources" className="rounded-[20px] font-black text-[11px] uppercase tracking-widest grow h-12 flex gap-2 items-center">
                      <BookOpen className="h-3 w-3" /> Digital Resources
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="rounded-[20px] font-black text-[11px] uppercase tracking-widest grow h-12 flex gap-2 items-center">
                      <Activity className="h-3 w-3" /> Growth Analytics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="col-span-2 p-8 rounded-[32px] border-none shadow-xl bg-white space-y-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3" /> Professional Dossier
                        </Label>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                          "{selectedTeacher.bio || "No professional biography recorded for this faculty member yet."}"
                        </p>
                      </div>
                      <DropdownMenuSeparator className="bg-slate-50" />
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Specialization</p>
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                            <span className="font-black text-slate-900">{selectedTeacher.specialization || "General Education"}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Qualification</p>
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="font-black text-slate-900">{selectedTeacher.qualification || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-8 rounded-[32px] border-none shadow-xl bg-white space-y-6">
                      <div className="text-center space-y-2">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Service Status</p>
                        <Badge className={cn(
                          "rounded-[20px] font-black px-6 py-2 text-[10px] uppercase",
                          selectedTeacher.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                        )}>
                          {selectedTeacher.status}
                        </Badge>
                      </div>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Class Load</span>
                          <span className="text-slate-900 font-black">{selectedTeacher.classes} Units</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Materials</span>
                          <span className="text-slate-900 font-black">{selectedTeacher.resources} Shared</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-primary italic pt-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Tenured since</span>
                          <span>{format(new Date(selectedTeacher.joinDate), "yyyy")}</span>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoadingPerformance ? (
                      <div className="h-[300px] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Computing Real-time Performance Metrics...</p>
                      </div>
                    ) : performanceData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        {/* Gauge 1: Student Success */}
                        <Card className="p-8 rounded-[32px] border-none shadow-xl bg-white group hover:shadow-2xl transition-all">
                          <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                              <GraduationCap className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                              <h4 className="text-3xl font-black text-slate-900">{performanceData.avgScore}</h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Grade Score</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Student Progression Index</p>
                          <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 ease-out"
                              style={{ width: `${(performanceData.avgScore / 100) * 100}%` }}
                            />
                          </div>
                          <p className="text-[9px] mt-3 font-bold text-slate-400 italic">Based on {performanceData.raw.totalCourses} courses taught this term.</p>
                        </Card>

                        {/* Gauge 2: Grading Efficiency */}
                        <Card className="p-8 rounded-[32px] border-none shadow-xl bg-white group hover:shadow-2xl transition-all border-l-4 border-l-emerald-500">
                          <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                              <Calendar className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                              <h4 className="text-3xl font-black text-slate-900">{performanceData.gradingEfficiency}%</h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grading Velocity</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Feedback Timeliness Score</p>
                          <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                              style={{ width: `${performanceData.gradingEfficiency}%` }}
                            />
                          </div>
                          <p className="text-[9px] mt-3 font-bold text-slate-400 italic">Avg feedback delay: {performanceData.raw.avgGradingDelay} days.</p>
                        </Card>

                        {/* Resource Sharing consistency */}
                        <Card className="md:col-span-2 p-8 rounded-[32px] border-none shadow-xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 group">
                          <div className="space-y-4 max-w-sm">
                            <h3 className="text-xl font-black flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                                <Activity className="h-5 w-5 text-white" />
                              </div>
                              Resource Contribution
                            </h3>
                            <p className="text-xs font-medium text-slate-400 leading-relaxed italic border-l-2 border-primary pl-4">
                              Demonstrates faculty commitment to collaborative teaching and knowledge sharing.
                            </p>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-center">
                              <h2 className="text-5xl font-black text-white group-hover:text-primary transition-colors">{performanceData.raw.totalResources}</h2>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Digital Materials</p>
                            </div>
                            <div className="h-16 w-[1.5px] bg-slate-800" />
                            <div className="text-center">
                              <h2 className="text-2xl font-black text-white">{performanceData.raw.totalResources > performanceData.raw.totalCourses ? 'HIGH' : 'STABLE'}</h2>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Consistency Level</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  {/* DIGITAL RESOURCES TAB */}
                  <TabsContent value="resources" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Sidebar: Shared Resources List */}
                      <Card className="md:col-span-2 p-8 rounded-[32px] border-none shadow-xl bg-white space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-indigo-500" />
                              Shared Digital materials
                            </h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">
                              {teacherResources.length} items shared by {selectedTeacher?.name}
                            </p>
                          </div>
                          {!isAddingResource && (
                            <Button 
                              onClick={() => setIsAddingResource(true)}
                              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 shadow-lg shadow-indigo-200"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Share Resource
                            </Button>
                          )}
                        </div>

                        {isAddingResource ? (
                          <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 animate-in fade-in">
                            <form onSubmit={handleResourceSubmit} className="space-y-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-black text-indigo-900 text-sm">Upload New Material</h4>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsAddingResource(false)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label className="uppercase text-[10px] font-black text-slate-500 tracking-widest">Resource Title</Label>
                                  <Input required value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className="rounded-xl h-12 font-bold bg-white" placeholder="e.g. Grade 10 Math Term 1 Plan" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label className="uppercase text-[10px] font-black text-slate-500 tracking-widest">Type</Label>
                                  <Select value={resourceForm.fileType} onValueChange={v => setResourceForm({...resourceForm, fileType: v})}>
                                    <SelectTrigger className="rounded-xl h-12 font-bold bg-white"><SelectValue/></SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                      <SelectItem value="LESSON_PLAN">📝 Lesson Plan</SelectItem>
                                      <SelectItem value="WORKSHEET">📎 Worksheet</SelectItem>
                                      <SelectItem value="EXAM_PAPER">📋 Exam Paper</SelectItem>
                                      <SelectItem value="OTHER">📁 Other Material</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="uppercase text-[10px] font-black text-slate-500 tracking-widest">External Link (Drive, Docs, etc.)</Label>
                                <Input required type="url" value={resourceForm.fileUrl} onChange={e => setResourceForm({...resourceForm, fileUrl: e.target.value})} className="rounded-xl h-12 font-bold bg-white" placeholder="https://" />
                              </div>
                              <div className="space-y-2">
                                <Label className="uppercase text-[10px] font-black text-slate-500 tracking-widest">Description (Optional)</Label>
                                <Textarea value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})} className="rounded-xl bg-white resize-none" placeholder="Brief context about this material..." />
                              </div>
                              <div className="pt-2 flex justify-end">
                                <Button disabled={isProcessing} type="submit" className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-200 w-full sm:w-auto">
                                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Resource"}
                                </Button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {teacherResources.length === 0 ? (
                              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[24px]">
                                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <h4 className="font-black text-slate-500">No resources shared yet.</h4>
                                <p className="text-xs text-slate-400 font-medium">Add lesson plans or worksheets to build the library.</p>
                              </div>
                            ) : (
                              teacherResources.map((res: any) => (
                                <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group bg-slate-50/50">
                                  <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                      {res.fileType === "LESSON_PLAN" ? <FileText className="h-5 w-5" /> :
                                       res.fileType === "WORKSHEET" ? <Briefcase className="h-5 w-5" /> :
                                       <LinkIcon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{res.title}</h4>
                                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{res.description || "No description provided."}</p>
                                      <div className="flex gap-3 mt-2 items-center">
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black rounded-lg border-slate-200 text-slate-500">
                                          {res.fileType.replace("_", " ")}
                                        </Badge>
                                        <span className="text-[9px] font-bold text-slate-400">{format(new Date(res.createdAt), "MMM d, yyyy")}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                                    <a href={res.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center h-10 w-10 sm:w-16 rounded-xl bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transition-all text-sm font-bold">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <Button 
                                      variant="destructive" 
                                      size="icon" 
                                      className="h-10 w-10 sm:w-16 rounded-xl opacity-0 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                                      onClick={(e) => handleDeleteResource(res.id, e)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </Card>

                      {/* Right Sidebar: Guidelines/Stats */}
                      <div className="space-y-6">
                        <Card className="p-6 rounded-[32px] border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          <h4 className="font-black flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5" /> Contribution Policy</h4>
                          <p className="text-xs font-medium text-white/80 leading-relaxed mb-4">
                            All materials uploaded must follow the 2025 Tusmo LMS guidelines for curriculum alignment and accessibility.
                          </p>
                          <ul className="text-[10px] space-y-2 font-bold mb-4">
                            <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 opacity-80" /> Use standard naming formats</li>
                            <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 opacity-80" /> Ensure links are "Anyone can view"</li>
                            <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 opacity-80" /> Avoid linking heavy files directly</li>
                          </ul>
                          <div className="pt-4 border-t border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Items Shared</p>
                            <p className="text-3xl font-black mt-1">{teacherResources.length}</p>
                          </div>
                        </Card>
                      </div>

                    </div>
                  </TabsContent>

                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent className="rounded-[40px] sm:max-w-[600px] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-10 pb-6 bg-slate-900 text-white">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
              <Megaphone className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black">New Broadcast</DialogTitle>
            <DialogDescription className="text-white/60 font-medium">Publish a broadcast announcement to all faculty members.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAnnouncementSubmit} className="p-10 pt-8 space-y-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Priority Level</Label>
              <Select value={announcementForm.priority} onValueChange={v => setAnnouncementForm({...announcementForm, priority: v as any})}>
                <SelectTrigger className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl font-bold">
                  <SelectItem value="LOW" className="rounded-xl text-slate-500">🔵 Low Priority — General Info</SelectItem>
                  <SelectItem value="MEDIUM" className="rounded-xl text-amber-600">🟡 Medium — Important Notice</SelectItem>
                  <SelectItem value="HIGH" className="rounded-xl text-red-600">🔴 High — Urgent / Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Broadcast Title</Label>
              <Input
                required
                placeholder="e.g. Staff Meeting — Mandatory Attendance"
                className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50"
                value={announcementForm.title}
                onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Message Content</Label>
              <Textarea
                required
                placeholder="Enter the full message content here..."
                className="rounded-2xl min-h-[120px] font-bold border-slate-100 bg-slate-50"
                value={announcementForm.content}
                onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-1">Expiry Date (Optional)</Label>
              <Input
                type="date"
                className="rounded-2xl h-12 font-bold border-slate-100 bg-slate-50"
                value={announcementForm.expiresAt}
                onChange={e => setAnnouncementForm({...announcementForm, expiresAt: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4 flex gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsAnnouncementOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400">CANCEL</Button>
              <Button disabled={isProcessing} className="rounded-2xl h-14 px-12 font-black bg-slate-900 text-white shadow-2xl gap-3 grow sm:grow-0">
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Megaphone className="h-5 w-5" />}
                PUBLISH BROADCAST
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
