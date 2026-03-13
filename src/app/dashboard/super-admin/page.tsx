import { StatsCard } from "@/components/dashboard/stats-card"
import { 
  ShieldCheck, 
  School, 
  Settings, 
  Activity,
  History,
  AlertTriangle
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
        <p className="text-muted-foreground">Monitor system health, schools, and global configurations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Active Schools" 
          value="1" 
          icon={<School className="h-4 w-4" />}
        />
        <StatsCard 
          title="Total Users" 
          value="1,452" 
          icon={<Activity className="h-4 w-4" />}
          trend={{ value: 8, isUp: true }}
        />
        <StatsCard 
          title="System Uptime" 
          value="99.99%" 
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatsCard 
          title="Storage Used" 
          value="4.2 GB" 
          icon={<Settings className="h-4 w-4" />}
          description="of 50GB allocated"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
           <CardHeader>
             <CardTitle>Global Audit Logs</CardTitle>
             <CardDescription>Latest system-wide administrative actions.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-0">
              {[
                { action: "Admin User Created", user: "system", time: "10 mins ago", type: "info" },
                { action: "Database Schema Updated", user: "dev_bot", time: "1 hour ago", type: "warning" },
                { action: "Backup Completed", user: "system", time: "4 hours ago", type: "success" },
                { action: "Settings Changed", user: "admin_1", time: "Yesterday", type: "info" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                   <div className="flex gap-4 items-center">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        log.type === "warning" ? "bg-amber-100 text-amber-600" : 
                        log.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                      )}>
                         {log.type === "warning" ? <AlertTriangle className="h-4 w-4" /> : <History className="h-4 w-4" />}
                      </div>
                      <div>
                         <p className="text-sm font-bold">{log.action}</p>
                         <p className="text-xs text-muted-foreground">by {log.user}</p>
                      </div>
                   </div>
                   <span className="text-xs text-muted-foreground font-medium">{log.time}</span>
                </div>
              ))}
              <Button variant="link" className="w-full mt-2 text-xs h-8">View full audit trail</Button>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-full">
           <CardHeader>
              <CardTitle>System Health</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Database CPU</span>
                    <span>12%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[12%]" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Memory Usage</span>
                    <span>65%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%]" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>API Latency</span>
                    <span>42ms</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[5%]" />
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
