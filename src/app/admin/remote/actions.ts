"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { awardPoints } from "@/lib/gamification"

export async function searchStudents(query: string) {
  if (!query || query.length < 2) return []
  
  try {
    // Use Raw SQL to bypass outdated Prisma Client (username field)
    const students: any[] = await prisma.$queryRaw`
      SELECT id, "firstName", "lastName", username, "totalXp", level
      FROM "Student"
      WHERE "firstName" ILIKE ${'%' + query + '%'}
         OR "lastName" ILIKE ${'%' + query + '%'}
         OR "username" ILIKE ${'%' + query + '%'}
      LIMIT 5
    `
    return students
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

export async function awardTeacherBonus(studentId: string, amount: number, reason: string) {
  try {
    // 1. Award Points using our robust utility
    const result = await awardPoints(studentId, amount, `BONUS: ${reason}`)
    
    if (result.success) {
      // 2. Revalidate key pages
      revalidatePath('/hall-of-fame')
      revalidatePath('/')
      
      // Fetch student username for revalidation using raw SQL
      const students: any[] = await prisma.$queryRaw`SELECT username FROM "Student" WHERE id = ${studentId}`
      const student = students[0]

      if (student?.username) {
        revalidatePath(`/student/${student.username}`)
      }

      return { success: true, message: `Successfully awarded +${amount} XP!` }
    }
    
    return { success: false, message: "Failed to award points." }
  } catch (error: any) {
    console.error("Bonus error:", error)
    return { success: false, message: error.message }
  }
}

/**
 * Fetch the single latest bonus transaction for the TV poll
 */
export async function getLatestBonusAnnouncement() {
  try {
    // Use Raw SQL for PointTransaction because it might be missing from Prisma Client
    const transactions: any[] = await prisma.$queryRaw`
      SELECT pt.id, pt.points, pt.reason, pt."createdAt", s."firstName"
      FROM "PointTransaction" pt
      JOIN "Student" s ON pt."studentId" = s.id
      WHERE pt.reason LIKE 'BONUS:%'
      ORDER BY pt."createdAt" DESC
      LIMIT 1
    `

    const latestBonus = transactions[0]
    if (!latestBonus) return null

    // Only return if it's less than 15 seconds old
    const ageSeconds = (new Date().getTime() - new Date(latestBonus.createdAt).getTime()) / 1000
    if (ageSeconds > 15) return null

    return {
      id: latestBonus.id,
      studentName: latestBonus.firstName,
      amount: latestBonus.points,
      reason: latestBonus.reason.replace('BONUS: ', ''),
      timestamp: latestBonus.createdAt
    }
  } catch (error) {
    console.error("Get latest bonus error:", error)
    return null
  }
}
