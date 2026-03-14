"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

/**
 * Bulk Import Batches
 */
export async function importBatchesCSV(rows: any[]) {
  try {
    const results = { imported: 0, skipped: 0, errors: [] as string[] }
    for (const row of rows) {
      if (!row.name || !row.academicYear) {
        results.skipped++
        continue
      }
      try {
        const id = crypto.randomUUID()
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Batch" (id, name, "academicYear", "updatedAt")
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (name) DO NOTHING
        `, id, row.name.trim(), row.academicYear.trim())
        results.imported++
      } catch (e: any) {
        results.errors.push(`Batch ${row.name}: ${e.message}`)
      }
    }
    revalidatePath("/dashboard/admin/batch")
    return { success: true, ...results }
  } catch (error) {
    return { success: false, error: "System error during Batch import." }
  }
}

/**
 * Bulk Import Classes
 */
export async function importClassesCSV(rows: any[]) {
  try {
    const results = { imported: 0, skipped: 0, errors: [] as string[] }
    for (const row of rows) {
      if (!row.name || !row.level || !row.grade) {
        results.skipped++
        continue
      }
      try {
        // Find batch by name
        let batchId = null
        if (row.batchName) {
           const batches = await prisma.$queryRawUnsafe(`SELECT id FROM "Batch" WHERE name = $1`, row.batchName.trim())
           batchId = (batches as any[])[0]?.id
        }

        const id = crypto.randomUUID()
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Class" (id, name, level, grade, section, room, capacity, "batchId", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (name, "batchId") DO NOTHING
        `, 
        id, 
        row.name.trim(), 
        row.level.trim(), 
        parseInt(row.grade), 
        row.section || "", 
        row.room || "", 
        parseInt(row.capacity || "30"),
        batchId
        )
        results.imported++
      } catch (e: any) {
        results.errors.push(`Class ${row.name}: ${e.message}`)
      }
    }
    revalidatePath("/dashboard/admin/classes")
    return { success: true, ...results }
  } catch (error) {
    return { success: false, error: "System error during Class import." }
  }
}

/**
 * Bulk Import Courses
 */
export async function importCoursesCSV(rows: any[]) {
  try {
    const results = { imported: 0, skipped: 0, errors: [] as string[] }
    for (const row of rows) {
      if (!row.name || !row.level) {
        results.skipped++
        continue
      }
      try {
        // Find teacher by name
        let teacherId = null
        if (row.teacherName) {
           const teachers = await prisma.$queryRawUnsafe(`SELECT id FROM "Teacher" WHERE "firstName" || ' ' || "lastName" ILIKE $1`, row.teacherName.trim())
           teacherId = (teachers as any[])[0]?.id
        }

        if (!teacherId) {
           results.errors.push(`Course ${row.name}: Teacher not found (${row.teacherName})`)
           results.skipped++
           continue
        }

        const id = crypto.randomUUID()
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Course" (id, name, code, description, category, credits, level, "teacherId", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, 
        id, 
        row.name.trim(), 
        row.code || null, 
        row.description || null, 
        row.category || "General", 
        row.credits || "3.0", 
        parseInt(row.level),
        teacherId
        )
        results.imported++
      } catch (e: any) {
        results.errors.push(`Course ${row.name}: ${e.message}`)
      }
    }
    revalidatePath("/dashboard/admin/courses")
    return { success: true, ...results }
  } catch (error) {
    return { success: false, error: "System error during Course import." }
  }
}
