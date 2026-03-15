"use client"

import * as React from "react"
import { Sidebar, SidebarMobile } from "@/components/dashboard/sidebar"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSearchParams } from "next/navigation"

// Messages shared layout — role can be passed via query ?role=ADMIN, defaults to ADMIN
type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SUPER_ADMIN"

export default function MessagesDashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [role, setRole] = React.useState<Role>("ADMIN")

  React.useEffect(() => {
    setMounted(true)
    // Try to determine role from localStorage or session; default to ADMIN for now
    const storedRole = (localStorage.getItem("dashboardRole") as Role) || "ADMIN"
    setRole(storedRole)
  }, [])

  const initials: Record<Role, string> = {
    ADMIN: "AD", TEACHER: "TC", STUDENT: "ST", PARENT: "PR", SUPER_ADMIN: "SA",
  }
  const avatarBg: Record<Role, string> = {
    ADMIN: "bg-indigo-100 text-indigo-700",
    TEACHER: "bg-emerald-100 text-emerald-700",
    STUDENT: "bg-violet-100 text-violet-700",
    PARENT: "bg-orange-100 text-orange-700",
    SUPER_ADMIN: "bg-slate-800 text-white",
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background shrink-0 sticky top-0 h-screen">
        <Sidebar role={role} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-background sticky top-0 z-10 flex items-center px-4 md:px-8 gap-4">
          {mounted ? <SidebarMobile role={role} /> : <div className="w-10 h-10 md:hidden" />}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search messages..." className="pl-9 h-9 w-full bg-slate-50 border-none focus-visible:ring-1" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 md:gap-4">
            {mounted ? (
              <>
                <NotificationCenter userId="mock-user-id" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`font-bold ${avatarBg[role]}`}>{initials[role]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">User Account</p>
                      <p className="text-xs text-muted-foreground">user@tusmoschool.com</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-full" />}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
