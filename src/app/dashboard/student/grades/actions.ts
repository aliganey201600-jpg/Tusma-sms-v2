"use server"

import prisma from "@/lib/prisma"

const scoreToGrade = (score: number) => {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

const scoreToGPA = (score: number) => {
  if (score >= 90) return 4.0
  if (score >= 80) return 3.0
  if (score >= 70) return 2.0
  if (score >= 60) return 1.0
  return 0.0
}

export async function getStudentGrades(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true }
    })
    
    if (!student) return []

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { enrollments: { some: { studentId } } },
          { teacherAssignments: { some: { classId: student.classId || "none" } } }
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
    
    if (courses.length === 0) return []

    const formatted = courses.map((course: any) => {
      const items: any[] = []
      
      // 1. Quizzes
      course.sections.forEach((section: any) => {
        section.quizzes.forEach((quiz: any) => {
          const studentAttempts = quiz.attempts
          if (studentAttempts.length > 0) {
            const scores = studentAttempts.map((a: any) => parseFloat(a.score.toString()))
            const bestAttempt = studentAttempts[0] // ordered by score desc
            
            items.push({
              id: quiz.id,
              name: quiz.title,
              score: bestAttempt.score,
              max: 100,
              date: new Date(bestAttempt.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
              grade: scoreToGrade(bestAttempt.score),
              type: 'QUIZ',
              stats: {
                count: studentAttempts.length,
                min: parseFloat(Math.min(...scores).toFixed(1)),
                max: parseFloat(Math.max(...scores).toFixed(1)),
                avg: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
              },
              results: bestAttempt.results // Array of { question, studentAnswer, correctAnswer, earned, total, feedback, isCorrect }
            })
          }
        })
      })

      // 2. Exams
      course.exams.forEach((exam: any) => {
        const result = exam.results[0]
        if (result) {
          const scorePct = (result.marksObtained / exam.maxMarks) * 100
          items.push({
            name: exam.title,
            score: result.marksObtained,
            max: exam.maxMarks,
            date: new Date(result.gradedAt || result.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
            grade: scoreToGrade(scorePct),
            type: 'EXAM'
          })
        }
      })

      // 3. Assignments
      course.assignments.forEach((ass: any) => {
        const grade = ass.grades[0]
        if (grade) {
          items.push({
            name: ass.title,
            score: grade.score,
            max: 100,
            date: new Date(grade.gradedAt || grade.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
            grade: scoreToGrade(grade.score),
            type: 'ASSIGNMENT'
          })
        }
      })

      // Calculate Course Average
      let avgScore = 0
      if (items.length > 0) {
        const totalPct = items.reduce((acc, curr) => acc + (curr.score / curr.max), 0)
        avgScore = (totalPct / items.length) * 100
      }

      const colors = ["emerald", "violet", "blue", "amber", "indigo", "lime"]
      const colorIndex = Math.abs(course.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % colors.length

      return {
        subject: course.name,
        teacher: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Unassigned',
        grade: scoreToGrade(avgScore),
        gpa: scoreToGPA(avgScore),
        color: colors[colorIndex],
        exams: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    })

    return formatted
  } catch (error) {
    console.error("Error fetching student grades:", error)
    return []
  }
}
