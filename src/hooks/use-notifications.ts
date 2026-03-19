"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const supabase = createClient();

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!userId) return

    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`
        },
        (payload: any) => {
          setNotifications((prev) => [payload.new, ...prev])
          toast(payload.new.title, {
            description: payload.new.message,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('Notification')
      .update({ isRead: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
    }
  }

  return { notifications, markAsRead }
}
