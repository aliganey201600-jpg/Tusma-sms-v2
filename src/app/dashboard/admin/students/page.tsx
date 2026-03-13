"use client"

import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  BookOpen,
  FileDown,
  Upload,
  ChevronDown,
  Check,
  X,
  LayoutGrid,
  ShieldCheck,
  Info
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsCSV,
  validateImportData,
  approveStudent,
  fetchClassesForStudents,
  checkEmailExists,
  checkStudentIdExists
} from "./actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentsManagementPage() {
  const [students, setStudents] = React.useState<any[]>([])
  const [availableClasses, setAvailableClasses] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isInitialState, setIsInitialState] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("all")

  const loadData = async () => {
    setIsLoading(true)
    const [studentData, classData] = await Promise.all([
      fetchStudents(),
      fetchClassesForStudents()
    ])
    setStudents(studentData)
    setAvailableClasses(classData)
    setIsLoading(false)
  }

  React.useEffect(() => {
    loadData()
  }, [])

  // Filters state (Multiple Selection)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = React.useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([])

  const levels = ["Lower Primary", "Upper Primary", "Secondary"]
  const statuses = ["ACTIVE", "INACTIVE", "PENDING", "GRADUATED"]

  // Modal States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isImportOpen, setIsImportOpen] = React.useState(false)
  const [isImportPreviewOpen, setIsImportPreviewOpen] = React.useState(false)
  const [isViewGradesOpen, setIsViewGradesOpen] = React.useState(false)
  const [importData, setImportData] = React.useState<any[]>([])
  const [isProcessingImport, setIsProcessingImport] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null)

  // Duplicate check states for Add/Edit form
  const [emailExists, setEmailExists] = React.useState(false)
  const [studentIdExists, setStudentIdExists] = React.useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false)
  const [isCheckingId, setIsCheckingId] = React.useState(false)

  // Dropdown Open States
  const [isLevelOpen, setIsLevelOpen] = React.useState(false)
  const [isClassOpen, setIsClassOpen] = React.useState(false)
  const [isGenderOpen, setIsGenderOpen] = React.useState(false)
  const [isStatusOpen, setIsStatusOpen] = React.useState(false)

  // Form states
  const [formData, setFormData] = React.useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    class: "",
    level: "",
    gender: "",
    age: "",
    guardianName: "",
    guardianPhone: "",
    status: "Active"
  })

  // Toggle helpers for multi-select
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

  const clearAllFilters = () => {
    setSelectedClasses([])
    setSelectedGenders([])
    setSelectedLevels([])
    setSelectedStatuses([])
    setSearchTerm("")
    setIsInitialState(true)
  }

  // Derived classes based on selected levels
  const displayClasses = React.useMemo(() => {
    if (selectedLevels.length === 0) return availableClasses;
    return availableClasses.filter(c => selectedLevels.includes(c.level));
  }, [availableClasses, selectedLevels]);

  // Derived filtered students
  const filteredStudents = React.useMemo(() => {
    if (isInitialState && searchTerm === "" && selectedClasses.length === 0 && selectedGenders.length === 0 && selectedLevels.length === 0) {
      return []
    }

    return students.filter(s => {
      const matchesSearch = (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.studentId || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(s.class);
      const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(s.gender);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(s.level);
      const matchesStatusFilter = selectedStatuses.length === 0 || selectedStatuses.includes(s.status.toUpperCase());
      const matchesTab = activeTab === "all" || s.status.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesClass && matchesGender && matchesLevel && matchesStatusFilter && matchesTab;
    })
  }, [students, searchTerm, selectedClasses, selectedGenders, selectedLevels, selectedStatuses, activeTab, isInitialState])

  // Handlers
  const handleExport = () => {
    const headers = "Student ID,Name,Phone,Email,Class,Level,Gender,Age,Guardian Name,Guardian Phone,Status\n"
    const csvData = students.map(s => `${s.studentId},${s.name},${s.phone},${s.email},${s.class},${s.level},${s.gender},${s.age},${s.guardianName},${s.guardianPhone},${s.status}`).join("\n")
    const blob = new Blob([headers + csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
  }

  const handleDownloadSample = () => {
    const headers = "Student ID,Name,Phone,Email,Class,Gender,Age,Guardian Name,Guardian Phone,Status\n"
    const sampleData = "2024-001,John Doe,12345678,john@example.com,Grade 10-A,Male,16,Jane Doe,87654321,Active\n"
    const blob = new Blob([headers + sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_sample.csv'
    a.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const fileContent = event.target?.result as string
      if (!fileContent) return

      const rows = fileContent.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0)
      if (rows.length < 2) return

      const parsedRecords = []
      const firstLine = rows[0]
      const separator = firstLine.includes(';') ? ';' : ','

      for (let i = 1; i < rows.length; i++) {
        const line = rows[i]
        const cols = line.split(separator).map(c => c.replace(/^["']|["']$/g, '').trim())

        if (cols.length >= 2) {
          parsedRecords.push({
            studentId: cols[0] || '',
            name: cols[1] || '',
            phone: cols[2] || '',
            email: cols[3] || '',
            class: cols[4] || '',
            gender: cols[5] || 'Male',
            age: cols[6] || '',
            guardianName: cols[7] || '',
            guardianPhone: cols[8] || '',
            status: cols[9] || 'Active'
          })
        }
      }

      if (parsedRecords.length > 0) {
        setIsProcessingImport(true)
        const res = await validateImportData(parsedRecords)
        setIsProcessingImport(false)

        if (res.success && res.data) {
          setImportData(res.data)
          setIsImportOpen(false)
          setIsImportPreviewOpen(true)
        } else {
          toast.error("Hubinta xogta waa lagu guul darreystay")
        }
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    setIsProcessingImport(true)
    const res = await importStudentsCSV(importData)
    setIsProcessingImport(false)

    if (res.success) {
      toast.success(`${res.count} New student(s) imported successfully!`)
      loadData()
      setIsImportPreviewOpen(false)
    } else {
      toast.error(res.error || "Import failed")
    }
  }

  const handleApprove = async (id: string) => {
    const res = await approveStudent(id);
    if (res.success) {
      toast.success("Student approved successfully!");
      loadData();
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      studentId: "",
      name: "",
      email: "",
      phone: "",
      class: "",
      level: "",
      gender: "Male",
      age: "",
      guardianName: "",
      guardianPhone: "",
      status: "Active"
    })
    setEmailExists(false)
    setStudentIdExists(false)
    setIsAddOpen(true)
  }

  // Debounced email check
  const emailCheckTimer = React.useRef<NodeJS.Timeout | null>(null)
  const idCheckTimer = React.useRef<NodeJS.Timeout | null>(null)

  const handleEmailChange = (val: string) => {
    setFormData(prev => ({ ...prev, email: val }))
    setEmailExists(false)
    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current)
    if (!val.trim()) return
    emailCheckTimer.current = setTimeout(async () => {
      setIsCheckingEmail(true)
      const excludeId = isEditOpen ? selectedStudent?.id : undefined
      const exists = await checkEmailExists(val.trim(), excludeId)
      setEmailExists(exists)
      setIsCheckingEmail(false)
    }, 500)
  }

  const handleStudentIdChange = (val: string) => {
    setFormData(prev => ({ ...prev, studentId: val }))
    setStudentIdExists(false)
    if (idCheckTimer.current) clearTimeout(idCheckTimer.current)
    if (!val.trim()) return
    idCheckTimer.current = setTimeout(async () => {
      setIsCheckingId(true)
      const excludeId = isEditOpen ? selectedStudent?.id : undefined
      const exists = await checkStudentIdExists(val.trim(), excludeId)
      setStudentIdExists(exists)
      setIsCheckingId(false)
    }, 500)
  }

  const handleAddSubmit = async () => {
    // If email or studentId already exist, save as PENDING (Approval Required)
    const dataToSubmit = (emailExists || studentIdExists)
      ? { ...formData, status: "Pending" }
      : formData
    const res = await createStudent(dataToSubmit)
    if (res.success) {
      if (emailExists || studentIdExists) {
        toast.warning("Duplicate detected — student sent to Approval Required.")
      } else {
        toast.success("Student record saved to Valid Entries!")
      }
      loadData()
      setIsAddOpen(false)
    } else {
      toast.error(res.error || "Failed to add student")
    }
  }

  // Convert DB status (ACTIVE) → display status (Active) for form
  const denormalizeStatus = (status: string) => {
    const map: Record<string, string> = {
      "ACTIVE": "Active",
      "INACTIVE": "Inactive",
      "PENDING": "Active", // treat pending as active in edit form
    }
    return map[status?.toUpperCase()] || "Active"
  }

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      studentId: student.studentId || "",
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      class: student.class,
      level: student.level || "",
      gender: student.gender,
      age: student.age || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      status: denormalizeStatus(student.status)
    })
    setEmailExists(false)
    setStudentIdExists(false)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async () => {
    // If email changed to an existing one, route to Approval Required
    const dataToSubmit = (emailExists || studentIdExists)
      ? { ...formData, status: "Pending" }
      : formData
    const res = await updateStudent(selectedStudent.id, dataToSubmit)
    if (res.success) {
      if (emailExists || studentIdExists) {
        toast.warning("Duplicate detected — student moved to Approval Required.")
      } else {
        toast.success("Student record updated!")
      }
      loadData()
      setIsEditOpen(false)
    } else {
      toast.error(res.error || "Failed to update student")
    }
  }

  const handleOpenDelete = (student: any) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const res = await deleteStudent(selectedStudent.id)
    if (res.success) {
      toast.success("Student record deleted!")
      loadData()
      setIsDeleteOpen(false)
    } else {
      toast.error(res.error || "Failed to remove student")
    }
  }

  const handleOpenViewGrades = (student: any) => {
    setSelectedStudent(student)
    setIsViewGradesOpen(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (e.target.value !== "") setIsInitialState(false)
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || "ACTIVE"
    switch (s) {
      case "ACTIVE":
        return <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase px-3 py-1">Active</Badge>
      case "GRADUATED":
        return <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[10px] uppercase px-3 py-1">Graduated</Badge>
      case "PENDING":
        return <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[10px] uppercase px-3 py-1">Pending</Badge>
      case "INACTIVE":
        return <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px] uppercase px-3 py-1">Inactive</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px] uppercase px-3 py-1">{status}</Badge>
    }
  }

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black">SMS</div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Student Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .filter-dropdown-content {
          min-width: 200px;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
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
        [data-state="checked"] .custom-checkbox-box {
          background-color: #000;
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Directory</h1>
          <p className="text-muted-foreground font-medium">Comprehensive student information and management center.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 h-10 rounded-xl font-bold border-slate-200">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)} className="gap-2 h-10 rounded-xl font-bold border-slate-200">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-2 h-10 rounded-xl px-6 font-black bg-primary shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== "all") setIsInitialState(false); }} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 h-12 w-full md:w-auto mb-6">
          <TabsTrigger value="all" className="rounded-lg px-8 h-10 font-black flex gap-2 transition-all">
            All Records <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{students.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg px-8 h-10 font-black flex gap-2 text-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            ✓ Valid Entries <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500 text-white">{students.filter(s => s.status?.toUpperCase() === 'ACTIVE').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg px-8 h-10 font-black flex gap-2 text-orange-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Approval Required <Badge className="h-5 px-1.5 text-[10px] bg-orange-500 text-white">{students.filter(s => s.status?.toUpperCase() === 'PENDING').length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Advanced Filters Bar */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md p-4 flex flex-col md:flex-row gap-4 border border-white">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Quick search: name, ID or email..."
              className="pl-10 h-10 rounded-xl border-slate-100 bg-slate-50/50 font-medium text-sm focus:ring-primary/20"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Level Multi-Select */}
            <DropdownMenu open={isLevelOpen} onOpenChange={setIsLevelOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[120px]">
                  {selectedLevels.length === 0 ? "Level" : `Level (${selectedLevels.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsLevelOpen(false);
                  }
                }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Select Educational Level</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedLevels.length === levels.length}
                  onCheckedChange={() => handleToggleAll(levels, selectedLevels, setSelectedLevels)}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                >
                  <div className="custom-checkbox-container">
                    <div className={cn("custom-checkbox-box", selectedLevels.length === levels.length && "checked")}>
                      {selectedLevels.length === levels.length && <Check className="h-3 w-3 text-white" />}
                    </div>
                    SELECT ALL
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {levels.map(level => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleSelection(level, selectedLevels, setSelectedLevels)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedLevels.includes(level) && "checked")}>
                        {selectedLevels.includes(level) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {level}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsLevelOpen(false)}
                  className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2"
                >
                  CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Class Multi-Select */}
            <DropdownMenu open={isClassOpen} onOpenChange={setIsClassOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[120px]">
                  {selectedClasses.length === 0 ? "Class" : `Class (${selectedClasses.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content max-h-[300px] overflow-y-auto" 
                align="end"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsClassOpen(false);
                  }
                }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Select Classes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {displayClasses.length > 0 && (
                  <>
                    <DropdownMenuCheckboxItem
                      checked={selectedClasses.length === displayClasses.length}
                      onCheckedChange={() => handleToggleAll(displayClasses.map(c => c.name), selectedClasses, setSelectedClasses)}
                      onSelect={(e) => e.preventDefault()}
                      className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                    >
                      <div className="custom-checkbox-container">
                        <div className={cn("custom-checkbox-box", selectedClasses.length === displayClasses.length && "checked")}>
                          {selectedClasses.length === displayClasses.length && <Check className="h-3 w-3 text-white" />}
                        </div>
                        SELECT ALL CLASSES
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {displayClasses.length === 0 ? (
                  <div className="p-4 text-xs italic text-center text-slate-400 font-bold">No classes available for selected levels</div>
                ) : (
                  displayClasses.map(cls => (
                    <DropdownMenuCheckboxItem
                      key={cls.id}
                      checked={selectedClasses.includes(cls.name)}
                      onCheckedChange={() => toggleSelection(cls.name, selectedClasses, setSelectedClasses)}
                      onSelect={(e) => e.preventDefault()}
                      className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                    >
                      <div className="custom-checkbox-container">
                        <div className={cn("custom-checkbox-box", selectedClasses.includes(cls.name) && "checked")}>
                          {selectedClasses.includes(cls.name) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {cls.name} <span className="text-[10px] font-medium opacity-50 ml-1">({cls.level})</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsClassOpen(false)}
                  className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2"
                >
                  CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gender Multi-Select */}
            <DropdownMenu open={isGenderOpen} onOpenChange={setIsGenderOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[120px]">
                  {selectedGenders.length === 0 ? "Gender" : `Gender (${selectedGenders.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsGenderOpen(false);
                  }
                }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Select Gender</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedGenders.length === 2}
                  onCheckedChange={() => handleToggleAll(["Male", "Female"], selectedGenders, setSelectedGenders)}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                >
                  <div className="custom-checkbox-container">
                    <div className={cn("custom-checkbox-box", selectedGenders.length === 2 && "checked")}>
                      {selectedGenders.length === 2 && <Check className="h-3 w-3 text-white" />}
                    </div>
                    SELECT ALL
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {["Male", "Female"].map(gender => (
                  <DropdownMenuCheckboxItem
                    key={gender}
                    checked={selectedGenders.includes(gender)}
                    onCheckedChange={() => toggleSelection(gender, selectedGenders, setSelectedGenders)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedGenders.includes(gender) && "checked")}>
                        {selectedGenders.includes(gender) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {gender}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsGenderOpen(false)}
                  className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2"
                >
                  CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Multi-Select */}
            <DropdownMenu open={isStatusOpen} onOpenChange={setIsStatusOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[120px]">
                  {selectedStatuses.length === 0 ? "Status" : `Status (${selectedStatuses.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => { if (e.key === "Enter") setIsStatusOpen(false); }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Registration Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.length === statuses.length}
                  onCheckedChange={() => handleToggleAll(statuses, selectedStatuses, setSelectedStatuses)}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                >
                  <div className="custom-checkbox-container">
                    <div className={cn("custom-checkbox-box", selectedStatuses.length === statuses.length && "checked")}>
                      {selectedStatuses.length === statuses.length && <Check className="h-3 w-3 text-white" />}
                    </div>
                    SELECT ALL
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {statuses.map(s => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={selectedStatuses.includes(s)}
                    onCheckedChange={() => toggleSelection(s, selectedStatuses, setSelectedStatuses)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedStatuses.includes(s) && "checked")}>
                        {selectedStatuses.includes(s) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {s}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsStatusOpen(false)}
                  className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2"
                >
                  CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isInitialState && (
              <Button variant="ghost" size="icon" onClick={clearAllFilters} className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-xl transition-all shadow-sm bg-white" title="Clear Filters">
                <X className="h-4 w-4" />
              </Button>
            )}

            <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Main Content Area */}
        <Card className="border-none shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden bg-white/60 backdrop-blur-xl border border-white">
          {isInitialState ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-24 w-24 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Info className="h-10 w-10 text-primary/40" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Ready to Search?</h3>
                <p className="text-slate-500 font-medium px-4">
                  Tusmo School Management: Please use the filters above to display the student data you need.
                </p>
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <Badge variant="outline" className="bg-white border-none rounded-xl text-[10px] font-black uppercase text-slate-400 px-4 py-2">Select Level</Badge>
                <Badge variant="outline" className="bg-white border-none rounded-xl text-[10px] font-black uppercase text-slate-400 px-4 py-2">Select Class</Badge>
                <Badge variant="outline" className="bg-white border-none rounded-xl text-[10px] font-black uppercase text-slate-400 px-4 py-2">Select Gender</Badge>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase pl-8">ID / Full Name</TableHead>
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase">Contact Details</TableHead>
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase">Level / Class Unit</TableHead>
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase">Profile Info</TableHead>
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase">Reg. Status</TableHead>
                    <TableHead className="py-5 font-black text-slate-900 tracking-widest text-[11px] uppercase text-right pr-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-primary/[0.01] transition-all duration-300 group border-b border-slate-50">
                      <TableCell className="py-4 pl-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-primary font-black uppercase tracking-tighter">{student.studentId}</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[12px] font-black text-slate-600 transition-transform group-hover:scale-110">
                              {student.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight text-sm md:text-base">{student.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-slate-700">{student.phone}</span>
                          <span className="text-[11px] text-slate-400 font-medium lowercase tracking-wide italic">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className={cn(
                            "w-fit rounded-lg font-black text-[9px] uppercase px-2 py-0.5 border-none",
                            student.level === "Secondary" ? "bg-purple-50 text-purple-600" :
                              student.level === "Upper Primary" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {student.level}
                          </Badge>
                          <span className="text-xs font-black text-slate-900 pl-1">{student.class}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              student.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                            )} />
                            <span className="text-slate-500 font-bold text-[12px]">{student.gender}</span>
                            <span className="text-[11px] text-slate-300 font-black px-1.5 bg-slate-50 rounded-lg">{student.age} Yrs</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">Guardian: <span className="text-slate-600 font-bold">{student.guardianName}</span></div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(student.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-10">
                        <div className="flex items-center justify-end gap-2">
                          {student.status?.toUpperCase() === 'PENDING' && (
                            <Button size="sm" variant="outline" onClick={() => handleApprove(student.id)} className="h-9 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none font-black px-4 transition-transform active:scale-95 shadow-sm">
                              APPROVE
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-52">
                              <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-3 py-2 tracking-widest leading-none">Record Management</DropdownMenuLabel>
                              <DropdownMenuSeparator className="opacity-40" />
                              <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold py-3 hover:bg-primary/5 focus:bg-primary/5" onClick={() => handleOpenEdit(student)}>
                                <Edit className="h-4 w-4 text-primary" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold py-3 hover:bg-primary/5 focus:bg-primary/5" onClick={() => handleOpenViewGrades(student)}>
                                <BookOpen className="h-4 w-4 text-primary" /> View Grades
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="opacity-40" />
                              <DropdownMenuItem className="text-destructive gap-3 cursor-pointer rounded-xl font-bold py-3 hover:bg-destructive/5 focus:bg-destructive/5" onClick={() => handleOpenDelete(student)}>
                                <Trash2 className="h-4 w-4" /> Remove Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center bg-slate-50/20">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No data found matching your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="py-6 px-10 bg-slate-50/50 border-t flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Found {filteredStudents.length} Results
                </span>
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="h-8 rounded-xl opacity-50 font-black tracking-widest" disabled>PREVIOUS</Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-xl opacity-50 font-black tracking-widest" disabled>NEXT</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false)
          setIsEditOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] rounded-[30px] md:rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 p-8 border-b border-primary/5">
            <DialogHeader className="p-0 text-left">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">{isEditOpen ? "Update Student" : "Register Student"}</DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 font-medium italic text-sm md:text-base leading-snug">
                {isEditOpen ? "Updating academic profile for " + formData.name : "Registering a new academic profile into the Tusmo Management System."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 grid gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 border-l-4 border-primary pl-4">I. Identity Records</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="studentId" className="text-[11px] font-black uppercase tracking-widest text-slate-500">Academic ID</Label>
                    {isCheckingId && <span className="text-[10px] text-slate-400 font-bold animate-pulse">CHECKING...</span>}
                    {!isCheckingId && studentIdExists && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">
                        ⚠ EXISTS — WILL REQUIRE APPROVAL
                      </span>
                    )}
                  </div>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={e => handleStudentIdChange(e.target.value)}
                    className={cn(
                      "rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white",
                      studentIdExists && "border-red-300 bg-red-50/30 focus:border-red-400"
                    )}
                    placeholder="2024-XXX"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-500">Digital Identity (Email)</Label>
                    {isCheckingEmail && <span className="text-[10px] text-slate-400 font-bold animate-pulse">CHECKING...</span>}
                    {!isCheckingEmail && emailExists && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">
                        ⚠ EXISTS — WILL REQUIRE APPROVAL
                      </span>
                    )}
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    className={cn(
                      "rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white",
                      emailExists && "border-red-300 bg-red-50/30 focus:border-red-400"
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Contact Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Level</Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={val => setFormData({ ...formData, level: val, class: "" })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {levels.map(l => (
                        <SelectItem key={l} value={l} className="rounded-xl font-bold py-3">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Class Assignment</Label>
                  <Select 
                    value={formData.class} 
                    onValueChange={val => setFormData({ ...formData, class: val })}
                    disabled={!formData.level}
                  >
                    <SelectTrigger className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold">
                      <SelectValue placeholder={formData.level ? "Select Class" : "Select Level First"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {availableClasses
                        .filter(c => c.level === formData.level)
                        .map(c => (
                          <SelectItem key={c.id} value={c.name} className="rounded-xl font-bold py-3">{c.name}</SelectItem>
                        ))
                      }
                      {availableClasses.filter(c => c.level === formData.level).length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">No classes in this level.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</Label>
                  <Select value={formData.gender} onValueChange={val => setFormData({ ...formData, gender: val })}>
                    <SelectTrigger className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="Male" className="rounded-xl font-bold py-3">Male</SelectItem>
                      <SelectItem value="Female" className="rounded-xl font-bold py-3">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Age</Label>
                  <Input id="age" type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 border-l-4 border-primary pl-4">II. Guardian & Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="guardianName" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Guardian Official Name</Label>
                  <Input id="guardianName" value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guardianPhone" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Guardian Contact Phone</Label>
                  <Input id="guardianPhone" value={formData.guardianPhone} onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })} className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold focus:bg-white" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Registration Status</Label>
                <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="rounded-xl border-slate-100 h-14 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                    <SelectItem value="Active" className="rounded-xl font-bold py-3">Active (Current)</SelectItem>
                    <SelectItem value="Inactive" className="rounded-xl font-bold py-3">In-Active (Suspended)</SelectItem>
                    <SelectItem value="Graduate" className="rounded-xl font-bold py-3">Graduate (Alumni)</SelectItem>
                    <SelectItem value="Graduated" className="rounded-xl font-bold py-3">Graduated (Completed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-100/50 border-t flex flex-col md:flex-row justify-end gap-3">
            {(emailExists || studentIdExists) && (
              <div className="flex-1 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3">
                <span className="text-orange-600 text-[11px] font-black uppercase tracking-wide">
                  ⚠ Duplicate detected — will be sent to Approval Required
                </span>
              </div>
            )}
            <Button variant="ghost" onClick={() => { setIsAddOpen(false); setIsEditOpen(false) }} className="rounded-2xl px-10 h-14 font-black text-slate-400">
              CANCEL
            </Button>
            <Button
              onClick={isEditOpen ? handleEditSubmit : handleAddSubmit}
              className={cn(
                "rounded-2xl px-12 h-14 font-black shadow-2xl transform hover:scale-[1.02] transition-all text-white",
                (emailExists || studentIdExists)
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200"
                  : "bg-gradient-to-r from-primary to-blue-600 shadow-primary/25"
              )}
            >
              {isEditOpen
                ? (emailExists || studentIdExists) ? "SEND TO APPROVAL" : "UPDATE RECORD"
                : (emailExists || studentIdExists) ? "SEND TO APPROVAL" : "FINALIZE REGISTRATION"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs (Delete, Import, Grades) - Kept simple but modern */}
      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-10 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 transform -rotate-6">
              <Trash2 className="h-10 w-10 text-destructive" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 text-center leading-tight">Remove Asset?</DialogTitle>
              <DialogDescription className="text-center mt-3 text-slate-500 font-medium px-6 leading-relaxed">
                You are about to delete <span className="font-black text-slate-900">{selectedStudent?.name}</span>. Academic data associated with this ID will be detached.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 flex flex-col sm:flex-row gap-3 bg-slate-50/50 border-t">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-2xl flex-1 font-black h-14 border-slate-100 bg-white">
              KEEP RECORD
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-2xl flex-1 font-black h-14 shadow-xl shadow-destructive/20">
              CONFIRM DELETE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-10 border-b border-primary/5">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Bulk Import</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic mt-2">
                Sync academic records via CSV interface.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-6 bg-white">
            <div className="py-12 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[30px] bg-slate-50/30 gap-6 transition-all hover:bg-primary/[0.02]">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-slate-700">Drop academic CSV here</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Limit: 10MB per file</p>
              </div>
              <Input type="file" accept=".csv" className="hidden" id="csv-upload-main" onChange={handleFileUpload} />
              <Button variant="secondary" className="h-12 rounded-2xl font-black px-8 bg-slate-900 text-white shadow-xl shadow-slate-200" asChild>
                <label htmlFor="csv-upload-main" className="cursor-pointer">CHOOSE FILE</label>
              </Button>
            </div>
            <div className="flex justify-between items-center bg-blue-50/30 p-5 rounded-[20px] border border-blue-100/50">
              <div className="flex gap-4 items-center">
                <div className="bg-blue-100/50 p-3 rounded-xl"><FileDown className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Blueprint</p>
                  <p className="text-[10px] text-blue-700/60 font-medium">Standard format needed</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleDownloadSample} className="h-10 rounded-xl px-4 font-black text-blue-600 underline">DOWNLOAD</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grades Records - Updated design */}
      <Dialog open={isViewGradesOpen} onOpenChange={setIsViewGradesOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-primary/5 to-slate-100 p-10 border-b border-slate-100 flex items-center gap-6">
            <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 transition-transform hover:rotate-0">
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Academic Progress</DialogTitle>
              <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] leading-none">
                Student: {selectedStudent?.name}
              </DialogDescription>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-[24px] border border-slate-50 overflow-hidden shadow-inner bg-slate-50/20">
              <Table>
                <TableHeader className="bg-white/50 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 h-auto">Discipline</TableHead>
                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 h-auto">Grade</TableHead>
                    <TableHead className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 h-auto">Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["Mathematics", "Physics", "Chemistry", "Biology"].map((sub, i) => (
                    <TableRow key={sub} className="border-b border-slate-50 hover:bg-white transition-colors">
                      <TableCell className="px-8 font-black text-slate-700 py-5">{sub}</TableCell>
                      <TableCell className="font-black text-primary text-lg">A-</TableCell>
                      <TableCell className="px-8 text-right">
                        <Badge variant="outline" className="text-emerald-500 border-none bg-emerald-50 text-[10px] font-black uppercase px-4 h-7 rounded-lg">Verified</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="p-8 bg-slate-50/50 flex justify-end">
            <Button onClick={() => setIsViewGradesOpen(false)} className="rounded-2xl px-12 h-14 font-black bg-slate-900 text-white shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all">
              CLOSE PORTAL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isImportPreviewOpen} onOpenChange={setIsImportPreviewOpen}>
        <DialogContent className="sm:max-w-[1000px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-slate-50 p-10 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Import Verification</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-base">Review records before synchronizing with main database.</DialogDescription>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 flex gap-2 py-3 px-6 rounded-2xl font-black uppercase text-[10px]">
                <CheckCircle2 className="h-4 w-4" /> {importData.filter(d => !d.isDuplicate).length} Valid Entries
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 flex gap-2 py-3 px-6 rounded-2xl font-black uppercase text-[10px]">
                <AlertCircle className="h-4 w-4" /> {importData.filter(d => d.isDuplicate).length} Collisions
              </Badge>
            </div>
          </div>

          <div className="p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow className="border-b-2 border-slate-50 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-8">Compliance Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Identity Details</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Educational Unit</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Contact Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importData.map((row, idx) => (
                  <TableRow key={idx} className={cn(
                    "group transition-colors",
                    row.isDuplicate ? "bg-red-50/30 hover:bg-red-50/50 border-l-[6px] border-l-red-500" : "bg-white hover:bg-emerald-50/20 border-l-[6px] border-l-emerald-500"
                  )}>
                    <TableCell className="py-5 px-8">
                      {row.isDuplicate ? (
                        <div className="flex items-center gap-2 text-red-600 font-black text-[11px] uppercase tracking-widest">
                          <XCircle className="h-4 w-4" /> Conflict Detected
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-widest">
                          <CheckCircle2 className="h-4 w-4" /> Integration Ready
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <span className={cn("text-[10px] font-black uppercase tracking-tighter", row.isDuplicate ? 'text-red-400' : 'text-primary')}>{row.studentId}</span>
                        <span className="font-black text-slate-800 text-sm">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 font-black text-slate-600 text-sm uppercase">{row.class}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">{row.phone}</span>
                        <span className="text-[10px] font-medium text-slate-400">{row.email}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-10 bg-slate-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <Button variant="ghost" onClick={() => setIsImportPreviewOpen(false)} className="rounded-2xl px-12 h-14 font-black text-slate-400">
              ABORT IMPORT
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isProcessingImport}
              className="rounded-2xl px-16 h-14 font-black shadow-2xl shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 text-white min-w-[300px]"
            >
              {isProcessingImport ? "PROCESSING..." : "FINALIZE & SYNC DATA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
