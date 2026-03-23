"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"
import { awardPoints } from "@/lib/gamification"

export async function getPublicProfile(username: string) {
  if (!username) return { success: false }
  
  try {
    // 1. Fetch Student using Raw SQL to bypass client sync issues
    const students: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "Student" WHERE "username" ILIKE $1 LIMIT 1',
      username
    )

    if (!students || students.length === 0) return { success: false }
    const student = students[0]
    const studentId = student.id

    // 2. Fetch related data using Raw SQL
    const results = await Promise.all([
      prisma.$queryRawUnsafe(
        'SELECT sb.*, b.name as "badgeName", b.description as "badgeDescription", b.icon as "badgeIcon" FROM "StudentBadge" sb JOIN "Badge" b ON sb."badgeId" = b.id WHERE sb."studentId" = $1 ORDER BY sb."earnedAt" DESC',
        studentId
      ),
      prisma.$queryRawUnsafe(
        'SELECT c.*, cr.name as "courseName" FROM "Certificate" c JOIN "Course" cr ON c."courseId" = cr.id WHERE c."studentId" = $1 ORDER BY c."issuedAt" DESC LIMIT 3',
        studentId
      ),
      prisma.$queryRawUnsafe(
        'SELECT g.score, cr.name as "courseName" FROM "Grade" g JOIN "Assignment" a ON g."assignmentId" = a.id JOIN "Course" cr ON a."courseId" = cr.id WHERE g."studentId" = $1',
        studentId
      )
    ])

    const badges = (results[0] as any[] || []).map(b => ({ 
      ...b, 
      earnedAt: b.earnedAt,
      badge: { name: b.badgeName, description: b.badgeDescription, icon: b.badgeIcon } 
    }))

    const certificates = (results[1] as any[] || []).map(c => ({ 
      ...c, 
      course: { name: c.courseName } 
    }))

    const grades = results[2] as any[] || []

    // Calculate Global Rank using raw SQL
    const rankResult: any[] = await prisma.$queryRawUnsafe(
      'SELECT count(*) + 1 as rank FROM "Student" WHERE "totalXp" > $1',
      student.totalXp || 0
    )
    const globalRank = Number(rankResult[0]?.rank || 1)

    // Calculate Subject Mastery
    const subjectAverages: Record<string, { total: number, count: number }> = {}
    grades.forEach((g: any) => {
      const sName = g.courseName || "General"
      if (!subjectAverages[sName]) subjectAverages[sName] = { total: 0, count: 0 }
      subjectAverages[sName].total += g.score || 0
      subjectAverages[sName].count += 1
    })

    const subjectMastery = Object.entries(subjectAverages).map(([subject, data]) => ({
      subject,
      percentage: Math.min(100, Math.round((data.total / (data.count * 100)) * 100)),
      color: ['violet', 'blue', 'emerald', 'amber'][Math.floor(Math.random() * 4)]
    }))

    return { 
      success: true, 
      profile: {
        ...student,
        badges,
        certificates,
        globalRank,
        subjectMastery: subjectMastery.length > 0 ? subjectMastery : [
          { subject: 'Mathematics', percentage: 0, color: 'violet' },
          { subject: 'Arabic', percentage: 0, color: 'blue' },
          { subject: 'Computer Science', percentage: 0, color: 'emerald' }
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
