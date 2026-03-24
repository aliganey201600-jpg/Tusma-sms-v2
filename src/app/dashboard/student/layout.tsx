"use client"

import * as React from "react"
import { Sidebar, SidebarMobile } from "@/components/dashboard/sidebar"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { Search } from "lucide-react"
import { PushNotificationButton } from "@/components/PushNotificationButton"
import { PushNotificationAutoPrompt } from "@/components/PushNotificationAutoPrompt"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = React.useState(false)
  const { user } = useCurrentUser()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }


  React.useEffect(() => {
    setMounted(true)
  }, [])

  const role = "STUDENT" as const

  // Initials from real name
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST"

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background shrink-0 sticky top-0 h-screen">
        <Sidebar role={role} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-background sticky top-0 z-10 flex items-center px-4 md:px-8 gap-4">
          {mounted ? <SidebarMobile role={role} /> : <div className="w-10 h-10 md:hidden" />}

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, assignments..."
                className="pl-9 h-9 w-full bg-slate-50 border-none focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            {mounted ? (
              <>
                <PushNotificationButton className="hidden sm:flex h-9 rounded-xl text-xs" />
                <NotificationCenter userId={user?.id || ""} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || "Student"} />
                        <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.fullName || "Student"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || ""}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>My Profile</DropdownMenuItem>
                    <DropdownMenuItem>Transcript</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive cursor-pointer" 
                      onClick={handleLogout}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-full" />
            )}
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PushNotificationAutoPrompt />
          {children}
        </main>
      </div>
    </div>
  )
}
