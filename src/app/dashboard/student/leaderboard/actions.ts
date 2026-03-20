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
    // To keep it performant, we'll fetch students who have at least some grades
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

      // Quizzes
      s.quizAttempts.forEach((a: any) => {
        totalPct += parseFloat(a.score.toString())
        count++
      })

      // Exams
      s.examResults.forEach((er: any) => {
        totalPct += (er.marksObtained / er.exam.maxMarks) * 100
        count++
      })

      // Assignments
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

    return {
      success: true,
      xpStudents: (xpStudents as any[]).map((s, index) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        xp: s.totalXp,
        avatarUrl: null,
        rank: index + 1
      })),
      academicStudents: academicRankings
    }
  } catch (error) {
    console.error("Failed to fetch leaderboard", error)
    return { success: false, xpStudents: [], academicStudents: [] }
  }
}
