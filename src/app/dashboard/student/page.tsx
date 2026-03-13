import { StatsCard } from "@/components/dashboard/stats-card"
import { 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Hello, Ahmed. You have 2 assignments due this week.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Current Courses" 
          value="6" 
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard 
          title="Avg. Grade" 
          value="A-" 
          icon={<GraduationCap className="h-4 w-4" />}
          trend={{ value: 5, isUp: true }}
          description="from last month"
        />
        <StatsCard 
          title="Pending Tasks" 
          value="4" 
          icon={<ClipboardList className="h-4 w-4" />}
          description="2 due in 48h"
        />
        <StatsCard 
          title="Attendance" 
          value="98%" 
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Learning Progress */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Estimated completion of your current semester courses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: "Mathematics", progress: 65 },
              { name: "Physics", progress: 42 },
              { name: "Computer Science", progress: 88 },
              { name: "History", progress: 55 },
            ].map((course, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                   <h4 className="text-sm font-bold uppercase tracking-wide text-foreground/80">{course.name}</h4>
                   <span className="text-xs font-medium text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-none shadow-sm h-full">
           <CardHeader>
             <CardTitle>Upcoming Deadlines</CardTitle>
             <CardDescription>Assignments and project submissions.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {[
                { title: "Algebra Quiz", due: "Tomorrow", color: "text-destructive" },
                { title: "Physics Lab Report", due: "Friday", color: "text-orange-500" },
                { title: "History Essay", due: "Next Mon", color: "text-muted-foreground" },
              ].map((task, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-dashed hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                   <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-bold">{task.title}</p>
                      <p className={cn("text-xs font-semibold", task.color)}>Due: {task.due}</p>
                   </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs h-9 rounded-xl mt-2">
                 View Calendar
              </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Re-importing cn just in case
import { cn } from "@/lib/utils"
