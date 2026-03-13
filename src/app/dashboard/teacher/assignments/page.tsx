"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, MoreVertical, Edit, Trash2, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/shared/file-upload"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const assignments = [
  { id: 1, title: "Algebra Quiz 1", class: "Grade 10A", dueDate: "Oct 15, 2026", status: "Published", submissions: "28/32" },
  { id: 2, title: "Physics Lab Report", class: "Grade 12B", dueDate: "Oct 20, 2026", status: "Published", submissions: "15/30" },
  { id: 3, title: "Calculus Homework", class: "Grade 12B", dueDate: "Oct 22, 2026", status: "Draft", submissions: "0/30" },
  { id: 4, title: "Mid-Term Project", class: "Grade 10A", dueDate: "Nov 05, 2026", status: "Published", submissions: "0/32" },
]

export default function TeacherAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Create, manage and grade student assignments and projects.</p>
        </div>
        <Button size="sm" className="gap-2 h-11 rounded-xl px-4 shadow-md">
          <Plus className="h-5 w-5" /> Create Assignment
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 items-start">
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                 <CardTitle className="text-lg">Resource Upload</CardTitle>
                 <CardDescription className="text-xs">Quickly upload syllabus or class materials.</CardDescription>
              </CardHeader>
              <CardContent>
                 <FileUpload 
                   bucket="materials" 
                   path="teachers/resources" 
                   label="Drop PDF or docx" 
                 />
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-primary/5">
              <CardHeader className="pb-3">
                 <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Grading Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between text-xs font-bold">
                    <span>Pending Review</span>
                    <span className="text-primary">12</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span>Graded This Week</span>
                    <span className="text-emerald-600">45</span>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-background">
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110",
                assignment.status === "Published" ? "bg-primary" : "bg-slate-500"
              )} />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                   <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-center text-primary">
                      <FileText className="h-6 w-6" />
                   </div>
                   <Badge variant={assignment.status === "Published" ? "secondary" : "outline"} className="h-5 text-[10px] uppercase font-black">
                      {assignment.status}
                   </Badge>
                </div>
                <CardTitle className="text-xl mt-4 leading-tight">{assignment.title}</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/80 mt-1">
                   {assignment.class}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                    <Clock className="h-4 w-4" />
                    <span>Due: <span className="font-bold text-foreground">{assignment.dueDate}</span></span>
                 </div>
                 
                 <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                       <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                       <span>Submissions:</span>
                    </div>
                    <span className="text-foreground">{assignment.submissions}</span>
                 </div>

                 <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-tighter">View Works</Button>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 border rounded-lg">
                             <MoreVertical className="h-4 w-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-xl w-40">
                          <DropdownMenuItem className="gap-2"><Edit className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Plus className="h-3.5 w-3.5" /> Extend Deadline</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
