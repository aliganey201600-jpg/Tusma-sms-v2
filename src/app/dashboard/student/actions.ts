"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function verifyStudentId(userId: string, studentId: string) {
  try {
    console.log("Starting verification for:", { userId, studentId })

    if (!userId) return { success: false, error: "User ID is missing." }

    // 1. Ensure the User record exists in our Prisma DB
    // Sometimes Supabase users exist but haven't been synced to the User table
    const existingUsers: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "User" WHERE id = $1 LIMIT 1`,
      userId
    )

    if (existingUsers.length === 0) {
      // Create the user record if it's missing (happens on first-time login)
      // We'll need their email. Since we don't have it here easily, 
      // let's try to get it from the Master Student record if possible, or use a placeholder.
      const now = new Date()
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, role, "createdAt", "updatedAt") 
         VALUES ($1, $2, 'STUDENT', $3, $4)`,
        userId, 
        `student-${userId.slice(0, 5)}@tusmo.temp`, // Placeholder email
        now, 
        now
      )
      console.log("Created missing User record for:", userId)
    }

    // 2. Find the master record (created by Admin) - Force Uppercase for consistency
    const formattedId = studentId.trim().toUpperCase()
    const masterEntries: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Student" WHERE UPPER("studentId") = $1 LIMIT 1`,
      formattedId
    )

    if (masterEntries.length === 0) {
      return { success: false, error: "ID-ga iskuulka waa qalad. Fadlan hubi (Tusma-001)." }
    }

    const master = masterEntries[0]
    const now = new Date()

    // 3. Find if this user already has a temporary student record
    const currentUserStudents: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "Student" WHERE "userId" = $1 LIMIT 1`,
      userId
    )

    if (currentUserStudents.length > 0) {
      const currentId = currentUserStudents[0].id

      if (master.id !== currentId) {
        // PRIORITIZE THE MASTER RECORD (The one from Admin which has history)
        // 1. Link Master record to the current User
        await prisma.$executeRawUnsafe(
          `UPDATE "Student" SET "userId" = $1, status = 'ACTIVE', "updatedAt" = $2 WHERE id = $3`,
          userId, now, master.id
        )

        // 2. Delete the temporary Session record (created during sign up)
        // Since the dashboard was blocked, it shouldn't have any real data yet.
        await prisma.$executeRawUnsafe(`DELETE FROM "Student" WHERE id = $1`, currentId)
      } else {
        // If they are the same, just activate
        await prisma.$executeRawUnsafe(
          `UPDATE "Student" SET status = 'ACTIVE', "updatedAt" = $1 WHERE id = $2`,
          now, currentId
        )
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

export async function logoutAndResetStudent(userId: string) {
  try {
    // Reset the student's status to PENDING so they must re-verify next time
    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET status = 'PENDING' WHERE "userId" = $1`,
      userId
    )
    return { success: true }
  } catch (error) {
    console.error("Logout reset error:", error)
    return { success: false }
  }
}
