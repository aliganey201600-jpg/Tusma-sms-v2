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
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
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
        }
      }
    })
    
    const formatted = enrollments.map((en: any) => {
      const course = en.course
      const exams: any[] = []
      
      // Add Exam results
      course.exams.forEach((exam: any) => {
        const result = exam.results[0]
        if (result) {
          exams.push({
            name: exam.title,
            score: result.marksObtained,
            max: exam.maxMarks,
            date: new Date(result.gradedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
            grade: scoreToGrade((result.marksObtained / exam.maxMarks) * 100),
          })
        }
      })

      // Add Assignment results as pseudo-exams for the UI
      course.assignments.forEach((ass: any) => {
        const grade = ass.grades[0]
        if (grade) {
          exams.push({
            name: ass.title,
            score: grade.score,
            max: 100,
            date: new Date(grade.gradedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
            grade: scoreToGrade(grade.score),
          })
        }
      })

      // Calculate average for this course
      let avgScore = 0
      if (exams.length > 0) {
        // Simple average for now
        avgScore = exams.reduce((acc, curr) => acc + (curr.score / curr.max), 0) / exams.length * 100
      }

      return {
        subject: course.name,
        teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
        grade: scoreToGrade(avgScore),
        gpa: scoreToGPA(avgScore),
        color: ["emerald", "violet", "blue", "amber", "indigo", "lime"][Math.floor(Math.random() * 6)],
        exams: exams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    })

    return formatted
  } catch (error) {
    console.error("Error fetching student grades:", error)
    return []
  }
}
