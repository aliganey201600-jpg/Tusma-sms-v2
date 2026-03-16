"use server"

import prisma from "@/lib/prisma"

export async function fetchStudentCourses(userId: string) {
  try {
    // 1. Find the student linked to this user and their classId
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { 
        id: true,
        classId: true,
        lessonCompletions: {
          select: { lessonId: true }
        }
      }
    })

    if (!student || !student.classId) {
      return { success: true, courses: [] }
    }

    // 2. Fetch all TeacherAssignments for this class
    const assignments = await prisma.teacherAssignment.findMany({
      where: { classId: student.classId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        teacher: true
      }
    })

    // 3. Format the data for the UI
    const formattedCourses = assignments.map((a, idx) => {
      const allLessons = a.course.sections.flatMap(s => s.lessons)
      const totalLessonsCount = allLessons.length
      
      const completedIds = student.lessonCompletions.map(lc => lc.lessonId)
      const completedLessons = allLessons.filter(l => completedIds.includes(l.id)).length
      
      const progress = totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0
      
      // Find the first non-completed lesson
      const nextLesson = allLessons.find(l => !completedIds.includes(l.id))?.title || "Course Completed"
      
      return {
        id: a.course.id,
        name: a.course.name,
        teacher: `${a.teacher.firstName} ${a.teacher.lastName}`,
        progress,
        grade: "A-", // Mocked for now
        color: ["violet", "blue", "emerald", "amber", "rose", "lime"][idx % 6],
        lessons: totalLessonsCount,
        completedLessons,
        nextLesson,
        schedule: "Daily",
        time: "TBD",
      }
    })

    return { success: true, courses: formattedCourses }
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return { success: false, error: "Failed to fetch courses" }
  }
}
