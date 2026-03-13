"use client"

import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { StatsCard } from "@/components/dashboard/stats-card"
import { 
  Users, 
  UserRound, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  MoreVertical 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today at Tusmo School.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value="1,284" 
          icon={<UserRound className="h-4 w-4" />}
          trend={{ value: 12, isUp: true }}
          description="from last semester"
        />
        <StatsCard 
          title="Total Teachers" 
          value="72" 
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 4, isUp: true }}
          description="newly joined this month"
        />
        <StatsCard 
          title="Active Classes" 
          value="48" 
          icon={<GraduationCap className="h-4 w-4" />}
          description="across all grade levels"
        />
        <StatsCard 
          title="Avg. Attendance" 
          value="94.2%" 
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 2, isUp: true }}
          description="vs target (92%)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Real Charts Integration */}
        <div className="lg:col-span-4">
          <DashboardCharts />
        </div>

        {/* Recent Enrollments Table */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Latest enrollments in the system.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Ahmed Farah", class: "Grade 10A", status: "Active" },
                  { name: "Leyla Ali", class: "Grade 8B", status: "Pending" },
                  { name: "Mustafa J.", class: "Grade 11C", status: "Active" },
                  { name: "Zahra S.", class: "Grade 9A", status: "Active" },
                  { name: "Ibrahim H.", class: "Grade 7A", status: "Active" },
                ].map((student, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{student.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{student.class}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={student.status === "Active" ? "secondary" : "outline"} className="text-[10px] uppercase font-bold py-0 h-5">
                        {student.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="link" className="w-full mt-4 text-xs h-8" asChild>
               <a href="/dashboard/admin/students">View all students</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
