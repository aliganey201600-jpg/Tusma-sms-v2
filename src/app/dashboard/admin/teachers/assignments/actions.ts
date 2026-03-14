"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

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
        ta.semester,
        ta."teacherId",
        ta."courseId",
        ta."classId"
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
 * Bulk assign subjects and classes to a teacher
 */
export async function createBulkAssignments(data: {
  teacherId: string;
  courseIds: string[];
  classIds: string[];
  academicYear?: string;
  semester?: string;
}) {
  try {
    const assignments = []
    
    // Using a simple loop for safety on direct DB execution
    for (const courseId of data.courseIds) {
      for (const classId of data.classIds) {
        const id = crypto.randomUUID()
        assignments.push(
          prisma.$executeRawUnsafe(`
            INSERT INTO "TeacherAssignment" (id, "teacherId", "courseId", "classId", "academicYear", semester, "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT ("teacherId", "courseId", "classId") DO UPDATE 
            SET "academicYear" = EXCLUDED."academicYear", semester = EXCLUDED.semester, "updatedAt" = NOW()
          `, id, data.teacherId, courseId, classId, data.academicYear || "", data.semester || "")
        )
      }
    }
    
    await Promise.all(assignments)
    revalidatePath("/dashboard/admin/teachers/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error creating bulk assignments:", error)
    return { success: false, error: "Failed to create assignments." }
  }
}

/**
 * Import assignments from CSV data
 */
export async function importAssignmentsCSV(rows: any[]) {
  try {
    const results = { imported: 0, skipped: 0, errors: [] as string[] }
    
    for (const row of rows) {
      try {
        const teacherName = row.teacherName?.trim()
        const courseName = row.courseName?.trim()
        const className = row.className?.trim()

        if (!teacherName || !courseName || !className) {
           results.skipped++
           continue
        }

        // Find IDs by ILIKE for flexibility
        const teachers = await prisma.$queryRawUnsafe(`SELECT id FROM "Teacher" WHERE "firstName" || ' ' || "lastName" ILIKE $1 LIMIT 1`, teacherName)
        const courses = await prisma.$queryRawUnsafe(`SELECT id FROM "Course" WHERE name ILIKE $1 LIMIT 1`, courseName)
        const classes = await prisma.$queryRawUnsafe(`SELECT id FROM "Class" WHERE name ILIKE $1 LIMIT 1`, className)

        const teacherId = (teachers as any[])[0]?.id
        const courseId = (courses as any[])[0]?.id
        const classId = (classes as any[])[0]?.id

        if (teacherId && courseId && classId) {
          const id = crypto.randomUUID()
          await prisma.$executeRawUnsafe(`
            INSERT INTO "TeacherAssignment" (id, "teacherId", "courseId", "classId", "academicYear", semester, "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT ("teacherId", "courseId", "classId") DO UPDATE 
            SET "academicYear" = EXCLUDED."academicYear", semester = EXCLUDED.semester, "updatedAt" = NOW()
          `, id, teacherId, courseId, classId, row.academicYear || "", row.semester || "")
          results.imported++
        } else {
          results.skipped++
          results.errors.push(`Not found: T:${teacherName}, C:${courseName}, CL:${className}`)
        }
      } catch (err: any) {
        results.errors.push(`Row error: ${err.message}`)
      }
    }
    
    revalidatePath("/dashboard/admin/teachers/assignments")
    return { success: true, ...results }
  } catch (error) {
    return { success: false, error: "Generic system error during import." }
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
