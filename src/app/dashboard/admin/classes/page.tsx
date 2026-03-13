"use client"

import * as React from "react"
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  UserCircle,
  Users2,
  LayoutGrid,
  TrendingUp,
  GraduationCap,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  School,
  DoorOpen,
  CalendarDays,
  ChevronDown,
  Check,
  X,
  Info
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  fetchClasses, 
  createClass, 
  updateClass, 
  deleteClass, 
  getClassStats, 
  fetchTeachers,
  fetchBatches
} from "./actions"

export default function ClassesPage() {
  const [classes, setClasses] = React.useState<any[]>([])
  const [teachers, setTeachers] = React.useState<any[]>([])
  const [batches, setBatches] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [currentClass, setCurrentClass] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  // Filters state (Multiple Selection)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>([])
  const [selectedBatches, setSelectedBatches] = React.useState<string[]>([])
  const [isInitialState, setIsInitialState] = React.useState(true)

  // Dropdown Open States
  const [isLevelOpen, setIsLevelOpen] = React.useState(false)
  const [isBatchOpen, setIsBatchOpen] = React.useState(false)

  const levels = ["Lower Primary", "Upper Primary", "Secondary"]
  
  const [formData, setFormData] = React.useState({
    name: "",
    level: "",
    grade: "",
    section: "A",
    room: "Room One",
    capacity: "30",
    batchId: "",
    teacherId: ""
  })

  // Load Initial Data
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedClasses, fetchedStats, fetchedTeachers, fetchedBatches] = await Promise.all([
        fetchClasses(),
        getClassStats(),
        fetchTeachers(),
        fetchBatches()
      ])
      setClasses(fetchedClasses)
      setStats(fetchedStats)
      setTeachers(fetchedTeachers)
      setBatches(fetchedBatches)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Multi-select helpers
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
    setSelectedLevels([])
    setSelectedBatches([])
    setSearchTerm("")
    setIsInitialState(true)
  }

  // Derived filtered classes
  const filteredClasses = React.useMemo(() => {
    if (isInitialState && searchTerm === "" && selectedLevels.length === 0 && selectedBatches.length === 0) {
      return []
    }

    return classes.filter(cls => {
      const matchesSearch = (cls.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (cls.room || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(cls.level);
      const matchesBatch = selectedBatches.length === 0 || selectedBatches.includes(cls.batchId);
      
      return matchesSearch && matchesLevel && matchesBatch;
    })
  }, [classes, searchTerm, selectedLevels, selectedBatches, isInitialState])

  // Handlers
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createClass({
      ...formData,
      grade: parseInt(formData.grade),
      capacity: parseInt(formData.capacity),
      batchId: formData.batchId || null,
      teacherId: formData.teacherId || null as any
    })

    if (result.success) {
      toast.success("Class created successfully")
      setIsDialogOpen(false)
      setFormData({ 
        name: "", 
        level: "", 
        grade: "", 
        section: "A", 
        room: "Room One", 
        capacity: "30", 
        batchId: "",
        teacherId: "" 
      })
      loadData()
    } else {
      toast.error(result.error)
    }
  }

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await updateClass(currentClass.id, {
      ...formData,
      grade: parseInt(formData.grade),
      capacity: parseInt(formData.capacity),
      batchId: formData.batchId || null,
      teacherId: formData.teacherId || null as any
    })

    if (result.success) {
      toast.success("Class updated successfully")
      setIsEditDialogOpen(false)
      loadData()
    } else {
      toast.error(result.error)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      const result = await deleteClass(id)
      if (result.success) {
        toast.success("Class deleted successfully")
        loadData()
      } else {
        toast.error(result.error)
      }
    }
  }

  const openEditDialog = (cls: any) => {
    setCurrentClass(cls)
    setFormData({
      name: cls.name,
      level: cls.level,
      grade: cls.grade.toString(),
      section: cls.section || "A",
      room: cls.room || "Room One",
      capacity: cls.capacity.toString(),
      batchId: cls.batchId || "",
      teacherId: cls.teacherId || ""
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Users2 className="h-6 w-6 text-primary animate-bounce" />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Class Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-10 py-4 px-4 sm:px-0">
      {/* Scrollbar Customization Styles */}
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/20 transform -rotate-3 transition hover:rotate-0 duration-500">
              <Users2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            Class Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1 md:mt-2 italic flex items-center gap-2 text-sm md:text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Manage grades, capacity, and teacher assignments efficiently.
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto gap-2 h-12 md:h-14 px-6 md:px-8 font-black shadow-2xl shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all text-white rounded-xl md:rounded-2xl active:scale-95 border-none"
        >
          <Plus className="h-5 w-5" /> NEW CLASS
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          title="Total Classes" 
          value={stats?.totalClasses || 0} 
          icon={<LayoutGrid className="h-5 w-5" />} 
          color="bg-primary/5 text-primary" 
          trend="Currently Active"
        />
        <StatsCard 
          title="Students" 
          value={stats?.totalStudents || 0} 
          icon={<Users className="h-5 w-5" />} 
          color="bg-emerald-50 text-emerald-600" 
          trend={`${stats?.utilizationRate || 0}% Occupancy`}
        />
        <StatsCard 
          title="Total Capacity" 
          value={stats?.totalCapacity || 0} 
          icon={<Layers className="h-5 w-5" />} 
          color="bg-orange-50 text-orange-600"
          trend="Total Seats Available"
        />
        <StatsCard 
          title="Avg. Scale" 
          value={stats?.averageStudentsPerClass || 0} 
          icon={<TrendingUp className="h-5 w-5" />} 
          color="bg-purple-50 text-purple-600"
          trend="Students Per class"
        />
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[30px] md:rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
               placeholder="Filter classes or rooms..." 
               className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-600 focus:bg-white transition-all focus:ring-primary/20"
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value)
                 if(e.target.value) setIsInitialState(false)
               }}
             />
           </div>
           
           <div className="flex flex-wrap gap-2">
             {/* Level Filter */}
             <DropdownMenu open={isLevelOpen} onOpenChange={setIsLevelOpen}>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[140px]">
                   {selectedLevels.length === 0 ? "Educational Level" : `Level (${selectedLevels.length})`}
                   <ChevronDown className="h-3 w-3 opacity-50" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent 
                 className="filter-dropdown-content" 
                 align="end"
                 onKeyDown={(e) => { if (e.key === "Enter") setIsLevelOpen(false); }}
               >
                 <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Educational Level</DropdownMenuLabel>
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
                 <DropdownMenuItem onClick={() => setIsLevelOpen(false)} className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2">
                    CLOSE & APPLY
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>

             {/* Batch Filter */}
             <DropdownMenu open={isBatchOpen} onOpenChange={setIsBatchOpen}>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold gap-2 min-w-[140px]">
                   {selectedBatches.length === 0 ? "Academic Batch" : `Batch (${selectedBatches.length})`}
                   <ChevronDown className="h-3 w-3 opacity-50" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent 
                 className="filter-dropdown-content max-h-[300px] overflow-y-auto" 
                 align="end"
                 onKeyDown={(e) => { if (e.key === "Enter") setIsBatchOpen(false); }}
               >
                 <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Academic Batch</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuCheckboxItem
                   checked={selectedBatches.length === batches.length}
                   onCheckedChange={() => handleToggleAll(batches.map(b => b.id), selectedBatches, setSelectedBatches)}
                   onSelect={(e) => e.preventDefault()}
                   className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                 >
                   <div className="custom-checkbox-container">
                     <div className={cn("custom-checkbox-box", selectedBatches.length === batches.length && "checked")}>
                       {selectedBatches.length === batches.length && <Check className="h-3 w-3 text-white" />}
                     </div>
                     SELECT ALL BATCHES
                   </div>
                 </DropdownMenuCheckboxItem>
                 <DropdownMenuSeparator />
                 {batches.map((batch: any) => (
                   <DropdownMenuCheckboxItem
                     key={batch.id}
                     checked={selectedBatches.includes(batch.id)}
                     onCheckedChange={() => toggleSelection(batch.id, selectedBatches, setSelectedBatches)}
                     onSelect={(e) => e.preventDefault()}
                     className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                   >
                     <div className="custom-checkbox-container">
                       <div className={cn("custom-checkbox-box", selectedBatches.includes(batch.id) && "checked")}>
                         {selectedBatches.includes(batch.id) && <Check className="h-3 w-3 text-white" />}
                       </div>
                       {batch.name}
                     </div>
                   </DropdownMenuCheckboxItem>
                 ))}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => setIsBatchOpen(false)} className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2">
                    CLOSE & APPLY
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>

             {!isInitialState && (
               <Button variant="ghost" size="icon" onClick={clearAllFilters} className="h-12 w-12 text-destructive hover:bg-destructive/5 rounded-xl transition-all shadow-sm bg-white" title="Clear Filters">
                 <X className="h-4 w-4" />
               </Button>
             )}

             <Button variant="secondary" size="icon" className="h-12 w-12 shrink-0 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg">
               <Filter className="h-4 w-4" />
             </Button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100/50 hover:bg-transparent">
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] pl-10 border-none">Class Detail</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] border-none">Level/Grade</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] border-none">Room/Batch</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] border-none">Assigned Teacher</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] border-none">Occupancy</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] border-none">Status</TableHead>
                <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-right pr-10 border-none">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialState ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                        <Info className="h-8 w-8 text-primary/30" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <h3 className="text-lg font-black text-slate-900">Search Academic Classes</h3>
                        <p className="text-sm text-slate-500 font-medium">Please select a filter above to view the associated class records.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-400 font-bold italic">
                    No academic classes found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-all duration-300">
                    <TableCell className="py-5 pl-10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <Users className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-base tracking-tight">{cls.name}</span>
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Sec: {cls.section} | Ref: {cls.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit rounded-lg bg-blue-50 text-blue-600 border-blue-100 font-black px-2 py-0.5 text-[9px] uppercase">
                          {cls.level}
                        </Badge>
                        <span className="font-black text-slate-700 text-sm pl-0.5">Grade {cls.grade}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <DoorOpen className="h-4 w-4 text-slate-400" />
                          {cls.room || "Room-N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {cls.batchName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-[10px] text-slate-600">
                          {cls.teacher?.charAt(0) || <UserCircle className="h-4 w-4" />}
                        </div>
                        {cls.teacher}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-2 w-32">
                        <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tight">
                          <span>{cls.students} / {cls.capacity}</span>
                          <span>{Math.round((cls.students / cls.capacity) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000 ease-out rounded-full",
                              cls.students >= cls.capacity ? "bg-destructive" : "bg-gradient-to-r from-primary to-blue-400"
                            )} 
                            style={{ width: `${Math.min((cls.students / cls.capacity) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge className={cn(
                        "rounded-xl font-black px-4 py-1.5 text-[11px] uppercase border",
                        cls.students >= cls.capacity 
                          ? "bg-red-50 text-red-600 border-red-200" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      )} variant="outline">
                        {cls.students >= cls.capacity ? "Full" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-white hover:shadow-xl rounded-2xl transition-all group-hover:scale-110">
                            <MoreVertical className="h-5 w-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-[24px] border-slate-100 shadow-2xl p-3 w-56 border border-white/50 backdrop-blur-xl">
                          <DropdownMenuLabel className="text-[11px] uppercase font-black text-slate-400 px-4 py-3 tracking-widest">Control Panel</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => openEditDialog(cls)}
                            className="rounded-2xl hover:bg-primary/5 focus:bg-primary/5 cursor-pointer flex gap-3 font-bold py-3 text-slate-700 transition-colors"
                          >
                            <Edit className="h-5 w-5 text-primary" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-2xl focus:bg-primary/5 cursor-pointer flex gap-3 font-bold py-3 text-slate-700">
                            <Users className="h-5 w-5 text-primary" /> Students
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 bg-slate-50" />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClass(cls.id)}
                            className="rounded-2xl focus:bg-destructive/5 text-destructive cursor-pointer flex gap-3 font-bold py-3"
                          >
                            <Trash2 className="h-5 w-5" /> Delete Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialogs */}
      <ClassDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSubmit={handleCreateClass}
        formData={formData}
        setFormData={setFormData}
        teachers={teachers}
        batches={batches}
        title="Create New Class"
        description="Fill in the details below to initialize a new academic class."
      />

      <ClassDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        onSubmit={handleUpdateClass}
        formData={formData}
        setFormData={setFormData}
        teachers={teachers}
        batches={batches}
        title="Edit Class Details"
        description={`Modify properties for class ${formData.name}.`}
      />
    </div>
  )
}

function StatsCard({ title, value, icon, color, trend }: any) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[28px] md:rounded-[32px] overflow-hidden bg-white hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-5 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm", color)}>
            {icon}
          </div>
          <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-black text-[9px] md:text-[10px] uppercase">{trend}</Badge>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[9px] md:text-[10px]">{title}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ClassDialog({ isOpen, onClose, onSubmit, formData, setFormData, teachers, batches, title, description }: any) {
  
  // Logic for Level Grade options
  const getGradeOptions = () => {
    switch (formData.level) {
      case "Lower Primary":
        return [1, 2, 3, 4]
      case "Upper Primary":
        return [5, 6, 7, 8]
      case "Secondary":
        return [9, 10, 11, 12]
      default:
        return []
    }
  }

  // Auto-fill Name logic
  React.useEffect(() => {
    if (formData.grade && formData.section) {
      setFormData((prev: any) => ({
        ...prev,
        name: `Grade ${prev.grade}-${prev.section}`
      }))
    }
  }, [formData.grade, formData.section, setFormData])

  const handleLevelChange = (level: string) => {
    setFormData((prev: any) => ({
      ...prev,
      level,
      grade: "" 
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[30px] md:rounded-[40px] overflow-hidden border-none shadow-2xl p-0">
        <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 md:p-10">
          <DialogHeader className="p-0 text-left text-primary-rgb">
            <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <School className="h-5 w-5 text-white" />
               </div>
               <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 font-medium italic mt-1 md:mt-2 text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="max-h-[70vh] md:max-h-[60vh] overflow-y-auto px-6 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8 bg-white custom-scrollbar">
          <form id="class-form" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              {/* Educational Level */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Level</Label>
                <Select value={formData.level} onValueChange={handleLevelChange} required>
                  <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold shadow-sm">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Lower Primary">Lower Primary (G1-G4)</SelectItem>
                    <SelectItem value="Upper Primary">Upper Primary (G5-G8)</SelectItem>
                    <SelectItem value="Secondary">Secondary (G9-G10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Grade</Label>
                <Select value={formData.grade} onValueChange={(v) => setFormData({...formData, grade: v})} disabled={!formData.level} required>
                  <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold shadow-sm">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl text-primary">
                    {getGradeOptions().map(g => (
                      <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch/Section */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Section</Label>
                <Select value={formData.section} onValueChange={(v) => setFormData({...formData, section: v})} required>
                  <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold shadow-sm">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {["A", "B", "C", "D", "E", "F"].map(s => (
                      <SelectItem key={s} value={s}>Section {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Code (Auto-fill) */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Class Name</Label>
                <div className="relative">
                  <Input value={formData.name} readOnly className="h-12 md:h-14 bg-slate-100/50 border-slate-200 rounded-[15px] md:rounded-[20px] font-black text-primary" />
                  <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-emerald-500 text-[8px] uppercase">Auto</Badge>
                </div>
              </div>

              {/* Room */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Room Label</Label>
                <Input value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="Room One" className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold" />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Room Cap</Label>
                <Input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} min="1" max="100" className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold" />
              </div>
              
              {/* Batch Assignment */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Academic Batch</Label>
                <Select value={formData.batchId} onValueChange={(v) => setFormData({...formData, batchId: v})} required>
                  <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold shadow-sm">
                    <SelectValue placeholder="Assign this class to a Batch..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {batches.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty Member */}
              <div className="sm:col-span-2 space-y-2 pb-2">
                <Label className="font-black text-[11px] uppercase text-slate-500 tracking-widest pl-1">Assigned Teacher</Label>
                <Select value={formData.teacherId} onValueChange={(v) => setFormData({...formData, teacherId: v})}>
                  <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-[15px] md:rounded-[20px] font-bold shadow-sm">
                    <SelectValue placeholder="Select Instructor..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {teachers.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 md:p-10 flex flex-col sm:flex-row gap-3 border-t bg-slate-50/50">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl font-black px-8 h-12 md:h-14 text-slate-400">
            CANCEL
          </Button>
          <Button form="class-form" type="submit" className="rounded-2xl font-black px-10 h-12 md:h-14 bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/25 text-white flex-1">
            SAVE CLASS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
