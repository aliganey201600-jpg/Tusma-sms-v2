import { StatsCard } from "@/components/dashboard/stats-card"
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Calendar,
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ParentDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-muted-foreground">Hello, Mrs. Amina. Here is a summary of Ahmed's performance.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Children Selector / Profile */}
        <Card className="w-full md:w-[300px] border-none shadow-sm h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Children</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Ahmed Farah", grade: "Grade 10A", avatar: "AF" },
              { name: "Leyla Farah", grade: "Grade 6B", avatar: "LF" },
            ].map((child, i) => (
              <Button key={i} variant={i === 0 ? "secondary" : "ghost"} className="w-full justify-start h-16 gap-3 rounded-xl px-4">
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{child.avatar}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-bold leading-none">{child.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{child.grade}</p>
                </div>
              </Button>
            ))}
            <Button variant="outline" className="w-full mt-4 rounded-xl text-xs h-9">
               Management Accounts
            </Button>
          </CardContent>
        </Card>

        {/* Selected Child Stats */}
        <div className="flex-1 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard 
              title="Attendance Rate" 
              value="98.5%" 
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatsCard 
              title="Academic Rank" 
              value="5th / 32" 
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <StatsCard 
              title="Messages" 
              value="2 New" 
              icon={<MessageSquare className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
             <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Conduct & Grades</CardTitle>
                  <CardDescription>Latest feedback from teachers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { subject: "Mathematics", grade: "A", comment: "Excellent progress in Algebra." },
                    { subject: "Physics", grade: "B+", comment: "Good lab participation." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2">
                       <div className="flex justify-between items-center">
                          <h4 className="font-bold">{item.subject}</h4>
                          <span className="text-lg font-black text-primary">{item.grade}</span>
                       </div>
                       <p className="text-sm text-muted-foreground italic">"{item.comment}"</p>
                    </div>
                  ))}
                </CardContent>
             </Card>

             <Card className="border-none shadow-sm">
                <CardHeader>
                   <CardTitle>Upcoming School Fees</CardTitle>
                   <CardDescription>Payment schedule for the next term.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center p-4 border border-dashed rounded-2xl">
                      <div>
                         <p className="text-sm font-bold tracking-tight">Term 2 Tuition</p>
                         <p className="text-xs text-muted-foreground">Due: Nov 1, 2026</p>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-bold tracking-tighter">$450.00</p>
                         <Button size="sm" className="h-7 text-[10px] px-3 mt-1 rounded-full uppercase font-bold">Pay Now</Button>
                      </div>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <div>
                         <p className="text-sm font-bold tracking-tight">Transport Fee</p>
                         <p className="text-xs text-emerald-600 font-medium">Paid on Oct 1</p>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-bold tracking-tighter text-emerald-600">$80.00</p>
                         <span className="text-[10px] font-bold text-emerald-600 uppercase">Confirmed</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
