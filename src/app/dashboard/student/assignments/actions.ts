"use server"

import prisma from "@/lib/prisma"

export async function getStudentAssignments(studentId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    })
    
    const courseIds = enrollments.map(e => e.courseId)

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        course: {
          select: {
            name: true,
            category: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        grades: {
          where: { studentId },
          take: 1
        }
      },
      orderBy: { dueDate: "asc" }
    })

    return assignments
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    return []
  }
}
