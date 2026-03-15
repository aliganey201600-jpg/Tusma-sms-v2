"use server"

import prisma from "@/lib/prisma"

export async function getLeaderboardData() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalXp: true,
      },
      orderBy: { totalXp: 'desc' },
      take: 50 // Top 50 students
    })

    return {
      success: true,
      students: students.map((s, index) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        xp: s.totalXp,
        avatarUrl: null, // no avatar field exists
        rank: index + 1
      }))
    }
  } catch (error) {
    console.error("Failed to fetch leaderboard", error)
    return { success: false, students: [] }
  }
}
