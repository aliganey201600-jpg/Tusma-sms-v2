"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"

interface CurrentUser {
  id: string
  email: string | undefined
  fullName: string
  firstName: string
  role: string
  avatarUrl?: string
  studentId?: string | null
  status?: string
  classId?: string | null
}

export function useCurrentUser() {
  const [user, setUser] = React.useState<CurrentUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setLoading(false)
          return
        }

        // Pull name from user_metadata (set during sign-up) or from Prisma DB
        const meta = authUser.user_metadata || {}
        
        // Try to get name from metadata fields (common patterns)
        const fullName =
          meta.full_name ||
          meta.fullName ||
          meta.name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          authUser.email?.split("@")[0] || // fallback: part before @
          "User"

        const firstName = fullName.split(" ")[0]

        setUser({
          id: authUser.id,
          email: authUser.email,
          fullName,
          firstName,
          role: meta.role || "STUDENT",
          avatarUrl: meta.avatar_url,
          studentId: meta.studentId || null,
          status: meta.status || "PENDING",
        })
        
        // Fetch extended data from API to be sure
        fetch(`/api/user/profile?id=${authUser.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setUser(prev => prev ? ({
                ...prev,
                studentId: data.student?.studentId,
                status: data.student?.status,
                classId: data.student?.classId
              }) : null)
            }
          }).catch(() => {})
      } catch (err) {
        console.error("useCurrentUser error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const fullName =
          meta.full_name ||
          meta.fullName ||
          meta.name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          session.user.email?.split("@")[0] ||
          "User"
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName,
          firstName: fullName.split(" ")[0],
          role: meta.role || "STUDENT",
          avatarUrl: meta.avatar_url,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
