"use server"

import prisma from "@/lib/prisma"

export async function getLeaderboardData() {
  try {
    // 1. Fetch Students for Engagement Leaderboard (XP)
    const xpStudents = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalXp: true
      },
      orderBy: { totalXp: 'desc' },
      take: 50
    })

    // 2. Fetch Students for Academic Leaderboard (Avg Score)
    const studentsWithGrades = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        quizAttempts: { select: { score: true } },
        examResults: { select: { marksObtained: true, exam: { select: { maxMarks: true } } } },
        grades: { select: { score: true } }
      },
      take: 200
    })

    const academicRankings = (studentsWithGrades as any[]).map(s => {
      let totalPct = 0
      let count = 0

      s.quizAttempts.forEach((a: any) => {
        totalPct += parseFloat(a.score.toString())
        count++
      })

      s.examResults.forEach((er: any) => {
        totalPct += (er.marksObtained / er.exam.maxMarks) * 100
        count++
      })

      s.grades.forEach((ag: any) => {
        totalPct += parseFloat(ag.score.toString())
        count++
      })

      const avg = count > 0 ? totalPct / count : 0
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        score: parseFloat(avg.toFixed(1)),
        avatarUrl: null,
        type: 'ACADEMIC'
      }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((s, i) => ({ ...s, rank: i + 1 }))

    // 3. Fetch Class/Department Rankings
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        students: { select: { totalXp: true } }
      }
    })

    const classRankings = classes.map(c => {
      // @ts-ignore
      const studentXPs = c.students.map(s => s.totalXp)
      const totalXp = studentXPs.reduce((a, b) => a + b, 0)
      const avgXp = studentXPs.length > 0 ? totalXp / studentXPs.length : 0
      return {
        id: c.id,
        name: c.name,
        xp: Math.round(avgXp),
        rank: 0 
      }
    })
    .sort((a, b) => b.xp - a.xp)
    .map((c, i) => ({ ...c, rank: i + 1 }))

    return {
      success: true,
      xpStudents: (xpStudents as any[]).map((s, index) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        xp: s.totalXp,
        avatarUrl: null,
        rank: index + 1
      })),
      academicStudents: academicRankings,
      classRankings: classRankings
    }
  } catch (error) {
    console.error("Failed to fetch leaderboard", error)
    return { success: false, xpStudents: [], academicStudents: [], classRankings: [] }
  }
}
