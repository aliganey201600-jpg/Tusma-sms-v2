"use client"

import * as React from "react"
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

export function NotificationCenter({ userId }: { userId: string }) {
  const { notifications, markAsRead } = useNotifications(userId)
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-black rounded-full border-2 border-background animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-2xl shadow-xl border-none p-0 overflow-hidden" align="end" forceMount>
        <div className="bg-primary/5 p-4 border-b">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Notifications</h3>
              <Badge variant="secondary" className="h-5 text-[10px] uppercase">{unreadCount} New</Badge>
           </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
               <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-2 text-muted-foreground/30">
                  <Bell className="h-6 w-6" />
               </div>
               <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
               <p className="text-xs text-muted-foreground/60">No new notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer flex gap-4 items-start",
                  !notification.isRead && "bg-primary/[0.02]"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={cn(
                  "mt-1 shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                  notification.type === 'INFO' ? "bg-blue-100 text-blue-600" :
                  notification.type === 'SUCCESS' ? "bg-emerald-100 text-emerald-600" :
                  notification.type === 'WARNING' ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                )}>
                   {notification.type === 'SUCCESS' ? <CheckCircle2 className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                     <p className={cn("text-xs font-bold leading-none", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                       {notification.title}
                     </p>
                     <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                   <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
           <DropdownMenuSeparator className="m-0" />
        )}
        {notifications.length > 0 && (
           <Button variant="ghost" className="w-full h-11 text-xs font-bold text-primary hover:text-primary rounded-none">
              View All Notifications
           </Button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { Badge } from "@/components/ui/badge"
