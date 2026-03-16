"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"

interface CurrentUser {
  id: string
  email: string | undefined
  fullName: string
  firstName: string
  lastName?: string
  role: string
  avatarUrl?: string
  studentId?: string | null
  status?: string
  classId?: string | null
  totalXp?: number
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
        const lastName = fullName.split(" ").slice(1).join(" ")

        // Fetch extended data from API to be sure
        try {
          const res = await fetch(`/api/user/profile?id=${authUser.id}`)
          const data = await res.json()
          if (data.success) {
            setUser({
              id: authUser.id,
              email: authUser.email,
              fullName,
              firstName,
              lastName,
              role: meta.role || "STUDENT",
              avatarUrl: meta.avatar_url,
              studentId: data.student?.studentId,
              status: data.student?.status,
              classId: data.student?.classId,
              totalXp: data.student?.totalXp || 0
            })

          } else {
            // Fallback if API fails but Auth succeeds
            setUser({
              id: authUser.id,
              email: authUser.email,
              fullName,
              firstName,
              lastName,
              role: meta.role || "STUDENT",
              avatarUrl: meta.avatar_url,
              studentId: meta.studentId || null,
              status: meta.status || "PENDING",
            })
          }
        } catch (e) {
          console.error("Profile fetch error:", e)
        }
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
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      // Only react to actual auth events that change the user
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Instead of overriding with partial info, re-fetch the profile if we have a user
        if (session?.user) {
          try {
            const res = await fetch(`/api/user/profile?id=${session.user.id}`)
            const data = await res.json()
            const meta = session.user.user_metadata || {}
            
            const fullName =
              meta.full_name ||
              meta.fullName ||
              meta.name ||
              [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
              session.user.email?.split("@")[0] ||
              "User"

            if (data.success) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                fullName,
                firstName: fullName.split(" ")[0],
                lastName: fullName.split(" ").slice(1).join(" "),
                role: meta.role || "STUDENT",
                avatarUrl: meta.avatar_url,
                studentId: data.student?.studentId,
                status: data.student?.status,
                classId: data.student?.classId,
                totalXp: data.student?.totalXp || 0
              })
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email,
                fullName,
                firstName: fullName.split(" ")[0],
                lastName: fullName.split(" ").slice(1).join(" "),
                role: meta.role || "STUDENT",
                avatarUrl: meta.avatar_url,
                studentId: meta.studentId || null,
                status: meta.status || "PENDING",
              })
            }
          } catch (e) {
            console.error("Profile fetch error on auth state change:", e)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
