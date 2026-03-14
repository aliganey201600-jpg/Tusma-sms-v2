"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Fetch all teacher assignments with details
 */
export async function fetchTeacherAssignments() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT 
        ta.id,
        t."firstName" as "teacherFirst",
        t."lastName" as "teacherLast",
        c.name as "courseName",
        cl.name as "className",
        ta."academicYear",
        ta.semester
      FROM "TeacherAssignment" ta
      JOIN "Teacher" t ON ta."teacherId" = t.id
      JOIN "Course" c ON ta."courseId" = c.id
      JOIN "Class" cl ON ta."classId" = cl.id
      ORDER BY t."firstName" ASC, cl.name ASC
    `)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return []
  }
}

/**
 * Fetch teachers, courses, and classes for selection
 */
export async function fetchAssignmentOptions() {
  try {
    const teachers = await prisma.$queryRawUnsafe(`SELECT id, "firstName", "lastName" FROM "Teacher" WHERE status = 'ACTIVE'`)
    const courses = await prisma.$queryRawUnsafe(`SELECT id, name FROM "Course"`)
    const classes = await prisma.$queryRawUnsafe(`SELECT id, name FROM "Class"`)
    
    return {
      teachers: teachers as any[],
      courses: courses as any[],
      classes: classes as any[]
    }
  } catch (error) {
    console.error("Error fetching assignment options:", error)
    return { teachers: [], courses: [], classes: [] }
  }
}

/**
 * Assign a subject to a teacher for a specific class
 */
export async function createAssignment(data: {
  teacherId: string;
  courseId: string;
  classId: string;
  academicYear?: string;
  semester?: string;
}) {
  try {
    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO "TeacherAssignment" (id, "teacherId", "courseId", "classId", "academicYear", semester, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT ("teacherId", "courseId", "classId") DO UPDATE 
      SET "academicYear" = EXCLUDED."academicYear", semester = EXCLUDED.semester, "updatedAt" = NOW()
    `, id, data.teacherId, data.courseId, data.classId, data.academicYear || "", data.semester || "")
    
    revalidatePath("/dashboard/admin/teachers/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Tani horey ayaa loo diwaangeliyey ama qalad ayaa dhacay." }
  }
}

/**
 * Remove an assignment
 */
export async function deleteAssignment(id: string) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "TeacherAssignment" WHERE id = $1`, id)
    revalidatePath("/dashboard/admin/teachers/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false }
  }
}

/**
 * Get a specific teacher's full load
 */
export async function fetchTeacherLoad(teacherId: string) {
  try {
     return await prisma.$queryRawUnsafe(`
      SELECT 
        c.name as "courseName",
        cl.name as "className",
        ta."academicYear"
      FROM "TeacherAssignment" ta
      JOIN "Course" c ON ta."courseId" = c.id
      JOIN "Class" cl ON ta."classId" = cl.id
      WHERE ta."teacherId" = $1
    `, teacherId)
  } catch (error) {
    return []
  }
}
