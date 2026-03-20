"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"

const scoreToGrade = (score: number) => {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

const scoreToGPA = (score: number) => {
  if (score >= 90) return 4.0
  if (score >= 80) return 3.5
  if (score >= 70) return 3.0
  if (score >= 60) return 2.5
  if (score >= 50) return 2.0
  return 0.0
}

export async function getStudentGrades() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, data: [] }

    const studentProfile = await prisma.student.findUnique({
      where: { userId: authUser.id },
      select: { id: true, classId: true }
    })

    if (!studentProfile) return { success: false, data: [] }

    const studentId = studentProfile.id

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { enrollments: { some: { studentId } } },
          { teacherAssignments: { some: { classId: studentProfile.classId || "none" } } }
        ]
      },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        sections: {
          include: {
            quizzes: {
              include: {
                attempts: {
                  where: { studentId },
                  orderBy: { score: 'desc' },
                }
              }
            }
          }
        },
        exams: {
          include: {
            results: {
              where: { studentId },
              take: 1
            }
          }
        },
        assignments: {
          include: {
            grades: {
              where: { studentId },
              take: 1
            }
          }
        }
      }
    })

    if (courses.length === 0) return { success: true, data: [] }

    const formatted = courses.map((course: any) => {
      const quizItems: any[] = []

      // 1. Quizzes
      course.sections.forEach((section: any) => {
        section.quizzes.forEach((quiz: any) => {
          const studentAttempts = quiz.attempts
          if (studentAttempts.length > 0) {
            const scores = studentAttempts.map((a: any) => parseFloat(a.score.toString()))
            const bestAttempt = studentAttempts[0] // ordered by score desc

            quizItems.push({
              id: quiz.id,
              title: quiz.title,
              max: parseFloat(Math.max(...scores).toFixed(1)),
              avg: parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)),
              attempts: studentAttempts.length,
              details: studentAttempts.map((a: any) => ({
                score: parseFloat(a.score.toString()).toFixed(1),
                results: a.results || []
              }))
            })
          }
        })
      })

      // 2. Exams (for report card template)
      const examItems: any[] = []
      course.exams.forEach((exam: any) => {
        const result = exam.results[0]
        if (result) {
          const scorePct = Math.round((result.marksObtained / exam.maxMarks) * 100)
          examItems.push({ score: scorePct, max: 100 })
        }
      })

      // Calculate course-level grade from all activities
      const allScores: number[] = [
        ...quizItems.map(q => q.avg),
        ...examItems.map(e => e.score)
      ]

      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0

      return {
        // For the UI accordion
        name: course.name,
        teacher: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Unassigned',
        grade: avgScore,
        quizzes: quizItems,
        // For the report card template (matches ReportCardTemplate's data prop shape)
        subject: course.name,
        gpa: scoreToGPA(avgScore),
        exams: examItems
      }
    })

    return { success: true, data: formatted }
  } catch (error) {
    console.error("Error fetching student grades:", error)
    return { success: false, data: [] }
  }
}
