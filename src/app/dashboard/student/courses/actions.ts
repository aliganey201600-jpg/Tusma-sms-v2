"use server"

import prisma from "@/lib/prisma"

export async function fetchStudentCourses(userId: string) {
  try {
    // 1. Find the student linked to this user and their classId
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { classId: true }
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
                lessons: true
              }
            }
          }
        },
        teacher: true
      }
    })

    // 3. Format the data for the UI
    const formattedCourses = assignments.map(a => {
      // Calculate progress (mocked for now, or based on Lesson completion if we had that)
      // Total lessons across all sections
      const totalLessons = a.course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
      
      // We don't have a LessonCompletion model in schema.prisma yet based on what I saw, 
      // so we'll use a placeholder for completedLessons or mock it.
      // But we can at least return the real course names and teachers.
      
      return {
        id: a.course.id,
        name: a.course.name,
        teacher: `${a.teacher.firstName} ${a.teacher.lastName}`,
        progress: 0, // Placeholder
        grade: "N/A", // Placeholder
        color: ["violet", "blue", "emerald", "amber", "rose", "lime"][Math.floor(Math.random() * 6)],
        lessons: totalLessons,
        completedLessons: 0, // Placeholder
        nextLesson: a.course.sections[0]?.lessons[0]?.title || "No lessons yet",
        schedule: "Daily", // Placeholder
        time: "TBD", // Placeholder
      }
    })

    return { success: true, courses: formattedCourses }
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return { success: false, error: "Failed to fetch courses" }
  }
}
