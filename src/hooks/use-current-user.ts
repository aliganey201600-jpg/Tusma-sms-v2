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
  level?: number
  currentStreak?: number
  username?: string
  bio?: string
  coverImage?: string
  inventory?: any[]
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

        const meta = authUser.user_metadata || {}
        const fullName =
          meta.full_name ||
          meta.fullName ||
          meta.name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          authUser.email?.split("@")[0] ||
          "User"

        const firstName = fullName.split(" ")[0]
        const lastName = fullName.split(" ").slice(1).join(" ")

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
              studentId: data.student?.id || data.student?.studentId,
              status: data.student?.status,
              classId: data.student?.classId,
              totalXp: data.student?.totalXp || 0,
              level: data.student?.level || 1,
              currentStreak: data.student?.currentStreak || 0,
              username: data.student?.username,
              bio: data.student?.bio,
              coverImage: data.student?.coverImage,
              inventory: data.student?.inventory
            })

          } else {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
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
                studentId: data.student?.id || data.student?.studentId,
                status: data.student?.status,
                classId: data.student?.classId,
                totalXp: data.student?.totalXp || 0,
                level: data.student?.level || 1,
                currentStreak: data.student?.currentStreak || 0,
                username: data.student?.username,
                bio: data.student?.bio,
                coverImage: data.student?.coverImage,
                inventory: data.student?.inventory
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
