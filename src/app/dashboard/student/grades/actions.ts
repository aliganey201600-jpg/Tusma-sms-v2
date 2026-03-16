"use server"

import prisma from "@/lib/prisma"

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
    
    return enrollments
  } catch (error) {
    console.error("Error fetching student grades:", error)
    return []
  }
}
