"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { logoutAndResetStudent } from "@/app/dashboard/student/actions"
import { useCurrentUser } from "@/hooks/use-current-user"
import {
  LayoutDashboard,
  Users,
  UserRound,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  CheckCircle2,
  CreditCard,
  Briefcase,
  RefreshCcw,
  Trophy,
  FileText,
  Smartphone
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SUPER_ADMIN"
}

export function Sidebar({ className, role }: SidebarProps) {
  return (
    <React.Suspense fallback={<div className="pb-12 h-full flex flex-col" />}>
      <SidebarInner className={className} role={role} />
    </React.Suspense>
  )
}

function SidebarInner({ className, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useCurrentUser()

  const handleLogout = async () => {
    // If it's a student, reset their verification status in DB
    if (role === "STUDENT" && user?.id) {
      await logoutAndResetStudent(user.id)
    }
    
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const routes = {
    SUPER_ADMIN: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/super-admin" },
      { label: "Schools", icon: GraduationCap, href: "/dashboard/super-admin/schools" },
      { label: "Admins", icon: Users, href: "/dashboard/super-admin/admins" },
      { label: "Messages", icon: Bell, href: "/dashboard/messages" },
      { label: "Logs", icon: BookOpen, href: "/dashboard/super-admin/logs" },
      { label: "Settings", icon: Settings, href: "/dashboard/super-admin/settings" },
    ],
    ADMIN: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
      { label: "Students", icon: UserRound, href: "/dashboard/admin/students" },
      { label: "Batch", icon: CalendarDays, href: "/dashboard/admin/batch" },
      { label: "Teachers", icon: Users, href: "/dashboard/admin/teachers" },
      { label: "Classes", icon: GraduationCap, href: "/dashboard/admin/classes" },
      { label: "Courses", icon: BookOpen, href: "/dashboard/admin/courses" },
      { label: "Attendance", icon: CheckCircle2, href: "/dashboard/admin/attendance" },
      { label: "Finance", icon: CreditCard, href: "/dashboard/admin/finance" },
      { label: "Exams", icon: GraduationCap, href: "/dashboard/admin/exams" },
      { label: "Grading", icon: BookOpen, href: "/dashboard/admin/grading" },
      { label: "Gradebook", icon: FileText, href: "/dashboard/admin/grading?view=gradebook" },
      { label: "WhatsApp", icon: Smartphone, href: "/dashboard/admin/whatsapp" },
      { label: "Assignments", icon: Briefcase, href: "/dashboard/admin/teachers/assignments" },
      { label: "Imports", icon: RefreshCcw, href: "/dashboard/admin/imports" },
      { label: "Messages", icon: Bell, href: "/dashboard/messages" },
      { label: "Events", icon: CalendarDays, href: "/dashboard/admin/events" },
    ],
    TEACHER: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/teacher" },
      { label: "My Classes", icon: Users, href: "/dashboard/teacher/classes" },
      { label: "Materials", icon: BookOpen, href: "/dashboard/teacher/materials" },
      { label: "Assignments", icon: LayoutDashboard, href: "/dashboard/teacher/assignments" },
      { label: "Attendance", icon: CalendarDays, href: "/dashboard/teacher/attendance" },
      { label: "Gradebook", icon: FileText, href: "/dashboard/teacher/grading?view=gradebook" },
      { label: "Messages", icon: Bell, href: "/dashboard/messages" },
    ],
    STUDENT: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/student" },
      { label: "My Courses", icon: BookOpen, href: "/dashboard/student/courses" },
      { label: "Leaderboard", icon: Trophy, href: "/dashboard/student/leaderboard" },
      { label: "Assignments", icon: LayoutDashboard, href: "/dashboard/student/assignments" },
      { label: "My Grades", icon: GraduationCap, href: "/dashboard/student/grades" },
      { label: "Gradebook", icon: FileText, href: "/dashboard/student/grading?view=gradebook" },
      { label: "Attendance", icon: CalendarDays, href: "/dashboard/student/attendance" },
      { label: "Messages", icon: Bell, href: "/dashboard/messages" },
    ],
    PARENT: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/parent" },
      { label: "Children", icon: Users, href: "/dashboard/parent/children" },
      { label: "Attendance", icon: CalendarDays, href: "/dashboard/parent/attendance" },
      { label: "Teachers", icon: Users, href: "/dashboard/parent/teachers" },
      { label: "Messages", icon: Bell, href: "/dashboard/messages" },
    ],
  }

  const currentRoutes = routes[role] || []
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view')
  
  // Highlighting logic that accounts for query params
  const isRouteActive = (routeHref: string) => {
    const [path, query] = routeHref.split('?')
    if (pathname !== path) return false
    
    if (query) {
      const routeParams = new URLSearchParams(query)
      const routeView = routeParams.get('view')
      // If we are looking for a specific view (like gradebook)
      if (routeView) return viewParam === routeView
    }
    
    // For route with NO view param, it should only be active if searchParams has NO view param
    if (viewParam) return false
    
    return true
  }

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="px-6 py-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            T
          </div>
          <span className="font-bold text-xl tracking-tight">Tusmo School</span>
        </Link>
      </div>
      <div className="flex-1 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {currentRoutes.map((route) => {
              const active = isRouteActive(route.href)
              return (
                <Button
                  key={route.href}
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    active && "bg-secondary font-medium"
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export function SidebarMobile({ role }: { role: SidebarProps["role"] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[240px]">
        <React.Suspense fallback={null}>
          <SidebarInner role={role} />
        </React.Suspense>
      </SheetContent>
    </Sheet>
  )
}
