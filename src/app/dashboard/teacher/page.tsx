import { StatsCard } from "@/components/dashboard/stats-card"
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Clock, 
  GraduationCap 
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Hello, Mr. Abdi. You have 3 classes today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="My Classes" 
          value="4" 
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard 
          title="Total Students" 
          value="124" 
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatsCard 
          title="Assignments" 
          value="12" 
          icon={<ClipboardCheck className="h-4 w-4" />}
          description="3 pending grading"
        />
        <StatsCard 
          title="Teaching Hours" 
          value="18h" 
          icon={<Clock className="h-4 w-4" />}
          description="this week"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes and meetings for today, October 11, 2026.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: "08:00 AM", subject: "Mathematics - 10A", room: "Room 204", students: 32 },
              { time: "10:30 AM", subject: "Calculus - 12B", room: "Lab 2", students: 28 },
              { time: "01:30 PM", subject: "Algebra - 9C", room: "Room 105", students: 30 },
            ].map((period, i) => (
              <div key={i} className="flex items-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                <div className="w-24 text-sm font-semibold text-primary">{period.time}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{period.subject}</h4>
                  <p className="text-sm text-muted-foreground">{period.room} • {period.students} Students</p>
                </div>
                <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Mark Attendance
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Links / Actions */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button className="w-full justify-start gap-2 h-11 rounded-xl">
                 <ClipboardCheck className="h-4 w-4" />
                 Post New Assignment
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-11 rounded-xl bg-background">
                 <BookOpen className="h-4 w-4" />
                 Upload Material
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-11 rounded-xl bg-background">
                 <Users className="h-4 w-4" />
                 Message Parents
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg">Recent Alerts</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                   <div>
                      <p className="text-sm font-medium">Assignment "Algebra Quiz" due today.</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-slate-300 mt-2" />
                   <div>
                      <p className="text-sm font-medium">New message from Parent of Ahmed F.</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
