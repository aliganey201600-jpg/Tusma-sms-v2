"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function verifyStudentId(userId: string, studentId: string) {
  try {
    console.log("Starting verification for:", { userId, studentId })

    // 1. Find the master record
    const masterEntries: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Student" WHERE "studentId" = $1 LIMIT 1`,
      studentId.trim()
    )

    if (masterEntries.length === 0) {
      return { success: false, error: "Student ID-kan lama helin. Fadlan hubi ID-ga iskuulka." }
    }

    const master = masterEntries[0]

    // 2. Find current user's student record
    const currentUserStudents: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "Student" WHERE "userId" = $1 LIMIT 1`,
      userId
    )

    const now = new Date()

    if (currentUserStudents.length > 0) {
      const currentId = currentUserStudents[0].id

      // UPDATE existing student record with master data
      await prisma.$executeRawUnsafe(
        `UPDATE "Student" SET 
          "studentId" = $1, 
          "classId" = $2, 
          "batchId" = $3, 
          "firstName" = $4, 
          "lastName" = $5, 
          gender = $6, 
          status = 'ACTIVE',
          "updatedAt" = $7
         WHERE id = $8`,
        master.studentId, 
        master.classId, 
        master.batchId, 
        master.firstName, 
        master.lastName, 
        master.gender || 'Male', // Default if missing
        now,
        currentId
      )

      // If master record was a separate stub (placeholder), delete it to avoid ghost records
      if (master.id !== currentId) {
        await prisma.$executeRawUnsafe(`DELETE FROM "Student" WHERE id = $1`, master.id)
      }
    } else {
      // LINK master record directly to this user if no student record exists yet
      await prisma.$executeRawUnsafe(
        `UPDATE "Student" SET "userId" = $1, status = 'ACTIVE', "updatedAt" = $2 WHERE id = $3`,
        userId, now, master.id
      )
    }

    revalidatePath("/dashboard/student")
    return { success: true }
  } catch (error: any) {
    console.error("Critical Verification Error:", error)
    return { success: false, error: `Cillad: ${error.message || "Lama xaqiijin karo account-ka."}` }
  }
}
