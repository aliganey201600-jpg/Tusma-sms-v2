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
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MoreHorizontal,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit,
  GraduationCap,
  CalendarDays,
  AlertCircle,
  Settings2,
  ChevronDown,
  Check,
  X,
  Info,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  fetchBatches, 
  createBatch, 
  updateBatch, 
  deleteBatch,
  advanceAcademicYear,
  revertAcademicYear,
  advanceAllBatches,
  revertAllBatches
} from "./actions"

export default function BatchManagementPage() {
  const [batches, setBatches] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedBatch, setSelectedBatch] = React.useState<any>(null)
  const [isYearAdjustable, setIsYearAdjustable] = React.useState(false)
  const [isAdvanceOpen, setIsAdvanceOpen] = React.useState(false)
  const [isRevertOpen, setIsRevertOpen] = React.useState(false)
  const [isAdvanceAllOpen, setIsAdvanceAllOpen] = React.useState(false)
  const [isRevertAllOpen, setIsRevertAllOpen] = React.useState(false)
  const [isProcessingAction, setIsProcessingAction] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Advanced Filters State
  const [selectedYears, setSelectedYears] = React.useState<string[]>([])
  const [isInitialState, setIsInitialState] = React.useState(false)
  const [isYearOpen, setIsYearOpen] = React.useState(false)

  const uniqueYears = React.useMemo(() => {
    return Array.from(new Set(batches.map(b => b.academicYear))).sort().reverse()
  }, [batches])
  const [currentAcademicYear, setCurrentAcademicYear] = React.useState<string>("")

  React.useEffect(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const ay = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    setCurrentAcademicYear(ay);
  }, []);

  const getAcademicYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)
    
    if (month >= 8) { // September or later
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const getBatchPrefix = (date: Date) => {
    const yearStr = date.getFullYear().toString().slice(-2);
    return `BATCH${yearStr}-`;
  };

  const [formData, setFormData] = React.useState({
    name: "",
    startDate: "",
    academicYear: ""
  })

  // Set initial data when adding or on mount
  React.useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      name: prev.name || getBatchPrefix(now),
      startDate: prev.startDate || format(now, "yyyy-MM-dd"),
      academicYear: prev.academicYear || getAcademicYear(now)
    }));
  }, []);

  // Set initial data when adding
  React.useEffect(() => {
    if (isAddOpen && !isEditOpen) {
      const now = new Date();
      setFormData({
        name: getBatchPrefix(now),
        startDate: format(now, "yyyy-MM-dd"),
        academicYear: getAcademicYear(now)
      });
    }
  }, [isAddOpen, isEditOpen]);

  const handleDateChange = (dateStr: string) => {
    const newDate = new Date(dateStr);
    if (!isNaN(newDate.getTime())) {
      const prefix = getBatchPrefix(newDate);
      const currentNumber = formData.name.split("-")[1] || "";
      setFormData({
        ...formData,
        startDate: dateStr,
        name: `${prefix}${currentNumber}`
      });
    } else {
      setFormData({ ...formData, startDate: dateStr });
    }
  };

  const loadData = async () => {
    setIsLoading(true)
    const data = await fetchBatches()
    setBatches(data)
    setIsLoading(false)
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleAddSubmit = async () => {
    const res = await createBatch(formData)
    if (res.success) {
      toast.success("New batch has been saved!")
      loadData()
      setIsAddOpen(false)
    } else {
      toast.error(res.error || "Failed to add batch")
    }
  }

  const handleEditSubmit = async () => {
    const res = await updateBatch(selectedBatch.id, formData)
    if (res.success) {
      toast.success("Batch data has been updated!")
      loadData()
      setIsEditOpen(false)
    } else {
      toast.error(res.error || "Failed to update batch")
    }
  }

  const handleDeleteConfirm = async () => {
    const res = await deleteBatch(selectedBatch.id)
    if (res.success) {
      toast.success("Batch has been deleted!")
      loadData()
      setIsDeleteOpen(false)
    } else {
      toast.error(res.error || "Failed to remove batch")
    }
  }

  const handleAdvanceConfirm = async () => {
    setIsProcessingAction(true);
    const res = await advanceAcademicYear(selectedBatch.id);
    setIsProcessingAction(false);
    if (res.success) {
      toast.success(`Batch advanced to ${res.newYear}!`, {
        description: `${res.progressedCount} students progressed and ${res.graduatedCount} students graduated.`
      });
      loadData();
      setIsAdvanceOpen(false);
    } else {
      toast.error(res.error || "Failed to advance batch");
    }
  };

  const handleRevertConfirm = async () => {
    setIsProcessingAction(true);
    const res = await revertAcademicYear(selectedBatch.id);
    setIsProcessingAction(false);
    if (res.success) {
      toast.success(`Batch reverted to ${res.prevYear}!`);
      loadData();
      setIsRevertOpen(false);
    } else {
      toast.error(res.error || "Failed to revert batch");
    }
  };

  const handleAdvanceAllConfirm = async () => {
    setIsProcessingAction(true);
    const res = await advanceAllBatches();
    setIsProcessingAction(false);
    if (res.success) {
      toast.success("All active batches have been advanced!", {
        description: `Total: ${res.totalProgressed} students progressed and ${res.totalGraduated} students graduated.`
      });
      loadData();
      setIsAdvanceAllOpen(false);
    } else {
      toast.error(res.error || "Failed to advance all batches");
    }
  };

  const handleRevertAllConfirm = async () => {
    setIsProcessingAction(true);
    const res = await revertAllBatches();
    setIsProcessingAction(false);
    if (res.success) {
      toast.success("All active batches have been reverted!");
      loadData();
      setIsRevertAllOpen(false);
    } else {
      toast.error(res.error || "Failed to revert all batches");
    }
  };

  // Filter Helpers
  const toggleYear = (year: string) => {
    setIsInitialState(false)
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year))
    } else {
      setSelectedYears([...selectedYears, year])
    }
  }

  const toggleAllYears = () => {
    setIsInitialState(false)
    if (selectedYears.length === uniqueYears.length) {
      setSelectedYears([])
    } else {
      setSelectedYears(uniqueYears)
    }
  }

  const clearFilters = () => {
    setSelectedYears([])
    setSearchTerm("")
    setIsInitialState(true)
  }

  const openEdit = (batch: any) => {
    setSelectedBatch(batch)
    setFormData({
      name: batch.name,
      startDate: format(new Date(batch.startDate), "yyyy-MM-dd"),
      academicYear: batch.academicYear
    })
    setIsEditOpen(true)
  }

  const openDelete = (batch: any) => {
    setSelectedBatch(batch)
    setIsDeleteOpen(true)
  }

  const openAdvance = (batch: any) => {
    setSelectedBatch(batch)
    setIsAdvanceOpen(true)
  }

  const openRevert = (batch: any) => {
    setSelectedBatch(batch)
    setIsRevertOpen(true)
  }

  const filteredBatches = React.useMemo(() => {
    if (isInitialState && searchTerm === "" && selectedYears.length === 0) return []
    
    return batches.filter(b => {
      const matchesSearch = (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.academicYear || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = selectedYears.length === 0 || selectedYears.includes(b.academicYear);
      return matchesSearch && matchesYear;
    })
  }, [batches, searchTerm, selectedYears, isInitialState])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading Batch Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Session Notification Banner */}
      <Card className="border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg rounded-3xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="p-6 relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                Active Academic Session: <span suppressHydrationWarning>{currentAcademicYear || "..."}</span>
                <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-400/30 text-[10px] font-black uppercase">Live</Badge>
              </h2>
              <p className="text-blue-100 text-sm font-medium mt-1">
                The system has automatically transitioned to the new academic year. 
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAdvanceAllOpen(true)}
              className="rounded-2xl bg-white/10 border-white/30 text-white hover:bg-emerald-500 hover:text-white font-bold h-12 px-6 transition-all active:scale-95 flex gap-2"
            >
              <ArrowUpCircle className="h-4 w-4" /> Global Advance
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRevertAllOpen(true)}
              className="rounded-2xl bg-white/10 border-white/30 text-white hover:bg-amber-500 hover:text-white font-bold h-12 px-6 transition-all active:scale-95 flex gap-2"
            >
              <ArrowDownCircle className="h-4 w-4" /> Global Revert
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsYearAdjustable(!isYearAdjustable);
                toast.info(isYearAdjustable ? "Academic year locked to automatic." : "Academic year field is now unlocked for adjustment.");
              }}
              className="rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-700 font-bold h-12 px-6 transition-all active:scale-95 flex gap-2"
            >
              <Settings2 className="h-4 w-4" /> {isYearAdjustable ? "Lock Setting" : "Adjust Session"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Batch Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1 italic">
            Manage student batches for same-year enrollments.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="rounded-xl h-12 px-6 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 flex gap-2">
          <Plus className="h-5 w-5" /> New Batch
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="p-6 border-b bg-white/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search batch or year..." 
              className="pl-10 rounded-2xl border-slate-200 h-12 focus-visible:ring-primary/20 bg-white font-bold"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value) setIsInitialState(false)
              }}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu open={isYearOpen} onOpenChange={setIsYearOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white font-bold gap-2 min-w-[180px]">
                  {selectedYears.length === 0 ? "Academic Year" : `Years (${selectedYears.length})`}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="filter-dropdown-content" 
                align="end"
                onKeyDown={(e) => { if (e.key === "Enter") setIsYearOpen(false); }}
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 p-2">Select Session Year</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedYears.length === uniqueYears.length}
                  onCheckedChange={toggleAllYears}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg p-2 font-black text-sm cursor-pointer text-primary"
                >
                  <div className="custom-checkbox-container">
                    <div className={cn("custom-checkbox-box", selectedYears.length === uniqueYears.length && "checked")}>
                      {selectedYears.length === uniqueYears.length && <Check className="h-3 w-3 text-white" />}
                    </div>
                    SELECT ALL
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {uniqueYears.map(year => (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYears.includes(year)}
                    onCheckedChange={() => toggleYear(year)}
                    onSelect={(e) => e.preventDefault()}
                    className="rounded-lg p-2 font-bold text-sm cursor-pointer"
                  >
                    <div className="custom-checkbox-container">
                      <div className={cn("custom-checkbox-box", selectedYears.includes(year) && "checked")}>
                        {selectedYears.includes(year) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {year}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsYearOpen(false)} className="justify-center font-black text-[10px] tracking-widest text-primary hover:bg-primary/5 cursor-pointer rounded-lg py-2">
                   CLOSE & APPLY
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isInitialState && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="h-12 w-12 text-destructive hover:bg-destructive/5 rounded-xl transition-all shadow-sm bg-white" title="Clear Filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px] pl-8">Batch Name</TableHead>
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Start Date</TableHead>
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Academic Year</TableHead>
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Students</TableHead>
                <TableHead className="py-5 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialState ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                        <Info className="h-8 w-8 text-primary/30" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <h3 className="text-lg font-black text-slate-900">Search Student Batches</h3>
                        <p className="text-sm text-slate-500 font-medium">Please use the filters above to browse academic batches and session records.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium italic">
                    No batches found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-black text-slate-900 text-sm tracking-tight">{batch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-xs bg-slate-100/50 w-fit px-3 py-1.5 rounded-lg border border-slate-200/50">
                        <CalendarDays className="h-3.5 w-3.5 text-primary/60" />
                        {format(new Date(batch.startDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-600 border-blue-100 font-black px-3 py-1 text-[10px]">
                        {batch.academicYear}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={cn(
                        "rounded-lg font-black px-3 py-1 text-[10px] uppercase",
                        batch.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        batch.status === "GRADUATED" ? "bg-purple-50 text-purple-600 border-purple-100" :
                        "bg-slate-50 text-slate-600 border-slate-100"
                      )}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-slate-500 text-xs">
                      {batch.studentCount} Students
                    </TableCell>
                    <TableCell className="py-4 text-right pr-8">
                       <div className="flex items-center justify-end gap-2">
                        {batch.status === "ACTIVE" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAdvance(batch)}
                            className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold gap-1 text-[10px]"
                          >
                            <ArrowUpCircle className="h-3.5 w-3.5" /> Advance
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm rounded-full transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 w-48">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEdit(batch)} className="rounded-xl focus:bg-primary/5 cursor-pointer flex gap-3 font-bold py-2.5">
                              <Edit className="h-4 w-4 text-primary" /> Edit Batch
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => openAdvance(batch)} disabled={batch.status !== "ACTIVE"} className="rounded-xl focus:bg-emerald-500/5 cursor-pointer flex gap-3 font-bold py-2.5 text-emerald-600 focus:text-emerald-700">
                              <ArrowUpCircle className="h-4 w-4" /> Advance Year
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRevert(batch)} disabled={batch.status !== "ACTIVE"} className="rounded-xl focus:bg-amber-500/5 cursor-pointer flex gap-3 font-bold py-2.5 text-amber-600 focus:text-amber-700">
                              <ArrowDownCircle className="h-4 w-4" /> Revert Year
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => openDelete(batch)} className="rounded-xl focus:bg-destructive/5 text-destructive cursor-pointer flex gap-3 font-bold py-2.5">
                              <Trash2 className="h-4 w-4" /> Delete Batch
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

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(val) => { if(!val) { setIsAddOpen(false); setIsEditOpen(false); }}}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-8 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">{isEditOpen ? "Update Batch" : "Create New Batch"}</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic mt-2">
                Please enter batch details to configure.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Batch Name (Example: BATCH25-5)</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="rounded-xl h-12 border-slate-200 shadow-inner focus-visible:ring-primary/20 bg-slate-50/50"
                placeholder="BATCH25-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Start Date</Label>
                <Input 
                  type="date"
                  value={formData.startDate} 
                  onChange={e => handleDateChange(e.target.value)} 
                  className="rounded-xl h-12 border-slate-200 shadow-inner focus-visible:ring-primary/20 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Academic Year {isYearAdjustable && <span className="text-amber-500 font-black ml-2">(Manual Mode)</span>}
                </Label>
                <Input 
                  value={formData.academicYear} 
                  readOnly={!isYearAdjustable}
                  onChange={e => isYearAdjustable && setFormData({...formData, academicYear: e.target.value})}
                  className={`rounded-xl h-12 border-slate-200 shadow-inner transition-all ${
                    !isYearAdjustable 
                      ? "bg-slate-100 font-bold text-primary cursor-not-allowed" 
                      : "bg-white border-amber-200 focus-visible:ring-amber-200"
                  }`}
                  placeholder="2025-2026"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false) }} className="rounded-xl px-6 h-12 font-bold border-slate-200 hover:bg-white transition-all">
              Cancel
            </Button>
            <Button onClick={isEditOpen ? handleEditSubmit : handleAddSubmit} className="rounded-xl px-10 h-12 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
              {isEditOpen ? "Update Batch" : "Create Batch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 pb-4 text-center">
            <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-10 w-10 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Are you sure?</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-3 italic px-4">
              Batch <span className="text-slate-900 font-black not-italic">{selectedBatch?.name}</span> will be deleted. This cannot be undone.
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-xl h-12 font-black shadow-lg shadow-destructive/20 transition-all active:scale-95">
              Yes, Delete Batch
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl h-12 font-bold border-slate-200 bg-white">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advance Year Dialog */}
      <Dialog open={isAdvanceOpen} onOpenChange={setIsAdvanceOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 pb-4 text-center">
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowUpCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Advance Academic Year</DialogTitle>
            <div className="text-slate-500 font-medium mt-3 px-4 flex flex-col gap-2">
              <p>Advance batch <span className="text-slate-900 font-black">{selectedBatch?.name}</span> to the next academic year.</p>
              <ul className="text-sm text-left list-disc list-inside bg-amber-50 rounded-xl p-3 text-amber-800">
                <li>Students will advance to next grade level.</li>
                <li>Grade 12 students will be marked as <span className="font-bold">GRADUATED</span>.</li>
              </ul>
            </div>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <Button 
              onClick={handleAdvanceConfirm} 
              disabled={isProcessingAction}
              className="rounded-xl h-12 font-black shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-95 text-white"
            >
              {isProcessingAction ? "Processing..." : "Advance Year & Students"}
            </Button>
            <Button variant="outline" disabled={isProcessingAction} onClick={() => setIsAdvanceOpen(false)} className="rounded-xl h-12 font-bold border-slate-200 bg-white">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revert Year Dialog */}
      <Dialog open={isRevertOpen} onOpenChange={setIsRevertOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 pb-4 text-center">
            <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowDownCircle className="h-10 w-10 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Revert Academic Year</DialogTitle>
            <div className="text-slate-500 font-medium mt-3 px-4 flex flex-col gap-2">
              <p>Revert batch <span className="text-slate-900 font-black">{selectedBatch?.name}</span> to previous academic year.</p>
              <ul className="text-sm text-left list-disc list-inside bg-amber-50 rounded-xl p-3 text-amber-800">
                <li>Students will return to previous grade.</li>
                <li>Recently graduated students will revert to <span className="font-bold">ACTIVE</span> status.</li>
              </ul>
            </div>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <Button 
              onClick={handleRevertConfirm} 
              disabled={isProcessingAction}
              className="rounded-xl h-12 font-black shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 transition-all active:scale-95 text-white"
            >
               {isProcessingAction ? "Processing..." : "Revert Year & Students"}
            </Button>
            <Button variant="outline" disabled={isProcessingAction} onClick={() => setIsRevertOpen(false)} className="rounded-xl h-12 font-bold border-slate-200 bg-white">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advance All Dialog */}
      <Dialog open={isAdvanceAllOpen} onOpenChange={setIsAdvanceAllOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 pb-4 text-center">
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowUpCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Global Academic Advance</DialogTitle>
            <div className="text-slate-500 font-medium mt-3 px-4 flex flex-col gap-2">
              <p>This will advance <span className="text-slate-900 font-black uppercase">ALL ACTIVE BATCHES</span> to the next academic year.</p>
              <ul className="text-sm text-left list-disc list-inside bg-blue-50 rounded-xl p-3 text-blue-800">
                <li>All active students will advance one grade level.</li>
                <li>Current Grade 12 students will be GRADUATED.</li>
                <li>This process may take a few moments.</li>
              </ul>
            </div>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <Button 
              onClick={handleAdvanceAllConfirm} 
              disabled={isProcessingAction}
              className="rounded-xl h-12 font-black shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-95 text-white"
            >
              {isProcessingAction ? "Processing..." : "Advance All Batches"}
            </Button>
            <Button variant="outline" disabled={isProcessingAction} onClick={() => setIsAdvanceAllOpen(false)} className="rounded-xl h-12 font-bold border-slate-200 bg-white">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revert All Dialog */}
      <Dialog open={isRevertAllOpen} onOpenChange={setIsRevertAllOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 pb-4 text-center">
            <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowDownCircle className="h-10 w-10 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Global Academic Revert</DialogTitle>
            <div className="text-slate-500 font-medium mt-3 px-4 flex flex-col gap-2">
              <p>This will revert <span className="text-slate-900 font-black uppercase">ALL ACTIVE BATCHES</span> to the previous academic year.</p>
              <ul className="text-sm text-left list-disc list-inside bg-amber-50 rounded-xl p-3 text-amber-800">
                <li>Students will return to their previous grade.</li>
                <li>Graduated students from the current year will be reactivated.</li>
              </ul>
            </div>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <Button 
              onClick={handleRevertAllConfirm} 
              disabled={isProcessingAction}
              className="rounded-xl h-12 font-black shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 transition-all active:scale-95 text-white"
            >
               {isProcessingAction ? "Processing..." : "Revert All Batches"}
            </Button>
            <Button variant="outline" disabled={isProcessingAction} onClick={() => setIsRevertAllOpen(false)} className="rounded-xl h-12 font-bold border-slate-200 bg-white">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
