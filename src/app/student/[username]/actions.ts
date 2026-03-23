"use server"

import prisma from "@/lib/prisma"
import { awardPoints } from "@/lib/gamification"

export async function getPublicProfile(username: string) {
  try {
    const student = await prisma.student.findUnique({
      // @ts-ignore
      where: { username },
      include: {
        class: { select: { name: true } },
        // @ts-ignore
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        }
      }
    })

    if (!student) return { success: false }

    return { success: true, profile: student }
  } catch (error) {
    console.error("Public profile fetch error:", error)
    return { success: false }
  }
}

/**
 * Updates student social fields and checks for Profile Completion Reward (+200 XP)
 */
export async function updateStudentSocialProfile(
  studentId: string, 
  data: { bio?: string, coverImage?: string, featuredBadgeIds?: string[], username?: string }
) {
  try {
    // 1. Fetch current student to state-check completion
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      // @ts-ignore
      include: { badges: true }
    })

    if (!student) return { success: false, error: "Student not found" }

    // Check if they already had a bio/image (to avoid double reward if they just edit)
    // @ts-ignore
    const wasAlreadyComplete = !!(student.bio && student.coverImage)

    // 2. Update Basic Fields
    await prisma.student.update({
      where: { id: studentId },
      data: {
        // @ts-ignore
        username: data.username,
        // @ts-ignore
        bio: data.bio,
        // @ts-ignore
        coverImage: data.coverImage
      }
    })

    // 3. Update Featured Badges (isFeatured flag)
    if (data.featuredBadgeIds) {
      // @ts-ignore
      await prisma.studentBadge.updateMany({
        where: { studentId },
        data: { isFeatured: false }
      })

      // @ts-ignore
      await prisma.studentBadge.updateMany({
        where: {
          studentId,
          badgeId: { in: data.featuredBadgeIds.slice(0, 3) }
        },
        data: { isFeatured: true }
      })
    }

    // 4. Reward Logic (+200 XP)
    const isNowComplete = !!(data.bio && data.coverImage && data.username)
    
    if (isNowComplete && !wasAlreadyComplete) {
      await awardPoints(studentId, 200, "PROFILE_COMPLETION", studentId)
      return { success: true, message: "Profile Updated! You earned +200 XP for completing your profile! 🏆" }
    }

    return { success: true, message: "Profile Updated!" }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, error: error.message }
  }
}
