"use server"

import prisma from "@/lib/prisma"

export async function fetchDashboardStats() {
  try {
    const [studentCount, teacherCount, classCount, coursesCount] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.class.count(),
      prisma.course.count()
    ])

    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        class: true
      }
    })

    const recentTeachers = await prisma.teacher.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    return {
      stats: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        courses: coursesCount,
        attendance: 94.2 // Mocked for now as attendance table might be sparse
      },
      recentStudents: recentStudents.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        class: s.class?.name || "Unassigned",
        status: s.status,
        date: s.createdAt
      })),
      recentTeachers: recentTeachers.map(t => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        specialization: t.specialization || "General",
        status: t.status,
        date: t.createdAt
      }))
    }
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return {
      stats: { students: 0, teachers: 0, classes: 0, courses: 0, attendance: 0 },
      recentStudents: [],
      recentTeachers: []
    }
  }
}
