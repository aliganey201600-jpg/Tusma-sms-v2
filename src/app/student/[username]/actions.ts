"use server"

import { revalidatePath } from "next/cache"

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
        },
        // @ts-ignore
        certificates: {
          include: { course: { select: { name: true } } },
          orderBy: { issuedAt: 'desc' },
          take: 3
        },
        // Correct selection path for subject name
        grades: {
          select: { 
            score: true, 
            assignment: { 
              select: { 
                course: { select: { name: true } } 
              } 
            } 
          }
        }
      }
    })

    if (!student) return { success: false }

    // 1. Calculate Global Rank
    // @ts-ignore
    const betterStudents = await prisma.student.count({
      where: {
        // @ts-ignore
        totalXp: { gt: student.totalXp }
      }
    })
    const globalRank = betterStudents + 1

    // 2. Calculate Subject Mastery (Realistic average based on grades)
    const subjectAverages: Record<string, { total: number, count: number }> = {}
    // @ts-ignore
    student.grades.forEach((g: any) => {
      const sName = g.assignment?.course?.name || "General"
      if (!subjectAverages[sName]) subjectAverages[sName] = { total: 0, count: 0 }
      subjectAverages[sName].total += g.score
      subjectAverages[sName].count += 1
    })

    const mastery = Object.entries(subjectAverages).map(([name, data]) => ({
      name,
      progress: Math.min(100, Math.round((data.total / (data.count * 100)) * 100))
    }))

    // Sort by progress desc
    mastery.sort((a,b) => b.progress - a.progress)

    return { 
      success: true, 
      profile: {
        ...student,
        globalRank,
        mastery: mastery.length > 0 ? mastery : [
          { name: 'Mathematics', progress: 0 },
          { name: 'Arabic', progress: 0 },
          { name: 'Computer Science', progress: 0 }
        ]
      } 
    }
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
    const wasAlreadyComplete = !!(student.bio && student.coverImage && student.username)

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
    }

    // 5. Revalidate Cache
    // @ts-ignore
    revalidatePath(`/student/${student.username || 'unknown'}`)
    revalidatePath(`/dashboard/student`)

    return { success: true, message: isNowComplete && !wasAlreadyComplete ? "Profile Updated! You earned +200 XP for completing your profile! 🏆" : "Profile Updated!" }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, error: error.message }
  }
}
