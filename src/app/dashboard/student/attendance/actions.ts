"use server"

import prisma from "@/lib/prisma"

export async function getStudentAttendance(studentId: string) {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 100
    })

    // Group by status for initial summary
    const summary = {
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      total: attendance.length
    }

    // Format for the UI daily log
    const log = attendance.map(a => ({
      date: new Date(a.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
      status: a.status.toLowerCase(),
      day: new Date(a.date).getDate(),
      fullDate: a.date
    }))

    return {
      summary,
      log
    }
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    return {
      summary: { present: 0, absent: 0, late: 0, total: 0 },
      log: []
    }
  }
}
