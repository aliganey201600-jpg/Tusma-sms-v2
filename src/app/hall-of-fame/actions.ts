"use server"

import prisma from "@/lib/prisma"

export async function getHallOfFameData() {
  try {
    // 1. Fetch Top 3 Students using Raw SQL
    const topStudents: any[] = await prisma.$queryRawUnsafe(`
      SELECT s.id, s."firstName", s."lastName", s."totalXp", s.level, s.username, c.name as "className"
      FROM "Student" s
      LEFT JOIN "Class" c ON s."classId" = c.id
      ORDER BY s."totalXp" DESC
      LIMIT 10
    `)

    // 2. Fetch Top Departments (Average XP per Class)
    const topClasses: any[] = await prisma.$queryRawUnsafe(`
      SELECT c.name as "className", AVG(s."totalXp") as "avgXp", COUNT(s.id) as "studentCount"
      FROM "Class" c
      JOIN "Student" s ON s."classId" = c.id
      GROUP BY c.name
      HAVING COUNT(s.id) > 1
      ORDER BY "avgXp" DESC
      LIMIT 5
    `)

    // 3. Live News Ticker (Latest Badges & Achievements)
    const news: any[] = await prisma.$queryRawUnsafe(`
      SELECT s."firstName", s.username, b.name as "badgeName", sb."earnedAt"
      FROM "StudentBadge" sb
      JOIN "Student" s ON sb."studentId" = s.id
      JOIN "Badge" b ON sb."badgeId" = b.id
      ORDER BY sb."earnedAt" DESC
      LIMIT 10
    `)

    return {
      success: true,
      podium: topStudents.slice(0, 3),
      leaderboard: topStudents.slice(3, 10),
      classes: topClasses,
      news: news.map(n => ({
        text: `${n.firstName} just earned the '${n.badgeName}' Badge! 🔥`,
        earnedAt: n.earnedAt
      }))
    }
  } catch (error) {
    console.error("Hall of Fame data error:", error)
    return { success: false }
  }
}
