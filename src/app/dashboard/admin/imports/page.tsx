"use client"

import * as React from "react"
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCcw,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { importBatchesCSV, importClassesCSV, importCoursesCSV } from "./actions"
import { importAssignmentsCSV } from "../teachers/assignments/actions"

const IMPORT_TYPES = [
  { 
    id: "batch", 
    label: "Academic Batches", 
    icon: CalendarDays, 
    color: "blue",
    columns: ["name", "academicYear"],
    sample: "2024-2025,2024\n2025-2026,2025"
  },
  { 
    id: "class", 
    label: "School Classes", 
    icon: GraduationCap, 
    color: "emerald",
    columns: ["name", "level", "grade", "section", "room", "capacity", "batchName"],
    sample: "Grade 10A,Secondary,10,A,Room 101,30,2024-2025"
  },
  { 
    id: "course", 
    label: "Courses / Subjects", 
    icon: BookOpen, 
    color: "purple",
    columns: ["name", "code", "description", "category", "credits", "level", "teacherName"],
    sample: "Mathematics,MATH101,Algebra and Geo,Science,3.0,10,Ahmed Ali"
  },
  { 
    id: "assignment", 
    label: "Teacher Assignments", 
    icon: Briefcase, 
    color: "indigo",
    columns: ["teacherName", "courseName", "className", "academicYear", "semester"],
    sample: "Ahmed Ali,Mathematics,Grade 10A,2024-2025,Semester 1"
  }
]

export default function ImportCenterPage() {
  const [selectedType, setSelectedType] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [results, setResults] = React.useState<any>(null)

  const downloadSample = (typeId: string) => {
    const type = IMPORT_TYPES.find(t => t.id === typeId)
    if (!type) return

    const content = type.columns.join(",") + "\n" + type.sample
    const blob = new Blob([content], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${typeId}_sample.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedType) return

    setIsUploading(true)
    setResults(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n")
      const headers = lines[0].split(",").map(h => h.trim())
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(",")
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim()
        })
        return obj
      })

      let res
      switch (selectedType) {
        case "batch": res = await importBatchesCSV(data); break
        case "class": res = await importClassesCSV(data); break
        case "course": res = await importCoursesCSV(data); break
        case "assignment": res = await importAssignmentsCSV(data); break
      }

      setIsUploading(false)
      if (res?.success) {
        setResults(res)
        const successRes = res as any
        toast.success(`Import complete: ${successRes.imported} records added.`)
      } else {
        toast.error((res as any)?.error || "Import fashilmay.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-8 space-y-12 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl">
              <RefreshCcw className="h-8 w-8 text-emerald-400" />
            </div>
            Data Import Hub.
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Mass-import your school data using smart CSV mapping.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {IMPORT_TYPES.map((type) => (
          <Card 
            key={type.id} 
            className={`rounded-[35px] border-none transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedType === type.id ? "ring-4 ring-slate-900 ring-offset-4 scale-[1.02]" : "hover:scale-[1.02] shadow-xl shadow-slate-100"
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <CardHeader className="p-8">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner bg-${type.color}-50 text-${type.color}-600`}>
                <type.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-black">{type.label}</CardTitle>
              <CardDescription className="font-bold uppercase text-[9px] tracking-widest text-slate-400">CSV Bulk Mapping</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
               <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 h-10 rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-xs"
                onClick={(e) => { e.stopPropagation(); downloadSample(type.id); }}
               >
                 <Download className="h-4 w-4" />
                 Download Template
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <Card className="rounded-[45px] border-none shadow-3xl bg-slate-900 text-white p-12 relative overflow-hidden animate-in slide-in-from-bottom-5">
           <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
             <FileSpreadsheet className="h-96 w-96 text-white" />
           </div>

           <div className="relative z-10 max-w-2xl">
              <Badge className="bg-emerald-500 text-slate-900 border-none px-4 py-1 mb-6 font-black uppercase text-[10px] tracking-widest">Selected: {selectedType.toUpperCase()}</Badge>
              <h2 className="text-4xl font-black tracking-tight mb-4">Ready for Upload.</h2>
              <p className="text-slate-300 font-medium text-lg leading-relaxed mb-10">
                Please ensure your CSV matches the template columns perfectly. Our engine will map names to database IDs automatically.
              </p>

              <div className="flex flex-wrap gap-4">
                 <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv" 
                      id="csv-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Button 
                      asChild 
                      className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest gap-3 shadow-xl hover:bg-slate-50"
                    >
                      <label htmlFor="csv-upload">
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="h-5 w-5" />}
                        Choose CSV File
                      </label>
                    </Button>
                 </div>
                 <Button 
                   variant="outline" 
                   className="h-16 px-10 rounded-2xl border-white/20 bg-white/5 text-white font-black hover:bg-white/10"
                   onClick={() => downloadSample(selectedType)}
                 >
                   Sample CSV
                 </Button>
              </div>
           </div>

           {results && (
             <div className="mt-12 p-8 rounded-3xl bg-white/5 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Imported</p>
                      <p className="text-2xl font-black text-white">{results.imported}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <RefreshCcw className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Skipped/No Change</p>
                      <p className="text-2xl font-black text-white">{results.skipped}</p>
                   </div>
                </div>
                {results.errors?.length > 0 && (
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
                        <AlertCircle className="h-6 w-6" />
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-slate-400">Logs (First 10)</p>
                        <p className="text-xs font-mono text-white/50 truncate">Check browser console for full log</p>
                     </div>
                  </div>
                )}
             </div>
           )}
        </Card>
      )}
    </div>
  )
}
