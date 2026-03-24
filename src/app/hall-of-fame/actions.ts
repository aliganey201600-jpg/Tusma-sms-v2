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
      podium: topStudents.slice(0, 3).map(s => ({ ...s, totalXp: Number(s.totalXp) })),
      leaderboard: topStudents.slice(3, 10).map(s => ({ ...s, totalXp: Number(s.totalXp) })),
      classes: topClasses.map(c => ({
          className: c.className,
          avgXp: Number(c.avgXp),
          studentCount: Number(c.studentCount)
      })),
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

export async function getLatestBonusAnnouncement() {
  try {
    const latest: any[] = await prisma.$queryRawUnsafe(`
      SELECT pt.id, pt.points as amount, pt.reason, pt."createdAt",
             s."firstName" as "studentName"
      FROM "PointTransaction" pt
      JOIN "Student" s ON pt."studentId" = s.id
      WHERE pt."createdAt" > NOW() - INTERVAL '60 seconds'
      ORDER BY pt."createdAt" DESC
      LIMIT 1
    `)
    return latest[0] || null
  } catch {
    return null
  }
}
