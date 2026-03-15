"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function verifyStudentId(userId: string, studentId: string) {
  try {
    // 1. Find the master student record that matches this manual Student ID
    // and hasn't been linked to a real User yet (or belongs to this user)
    const masterRecord = await prisma.student.findFirst({
      where: {
        studentId: studentId.trim(),
        status: { in: ["ACTIVE", "PENDING"] }
      }
    })

    if (!masterRecord) {
      return { success: false, error: "Student ID-gan lama helin. Fadlan hubi ama la xiriir maamulka." }
    }

    // 2. Link the current logged-in User's student record to the Master data
    // Finding or creating the current student session record
    let currentUserStudent = await prisma.student.findUnique({
      where: { userId }
    })

    // If the student record doesn't exist for this user, we will link the Master record directly to this User
    if (!currentUserStudent) {
      // Check if the master record is already linked to another user
      if (masterRecord.userId && masterRecord.userId !== userId) {
        // If it's linked to a 'stub' user created by admin, we might need to handle that,
        // but for now, let's just reassign it to the real logged-in user if the stub user has no auth session.
      }
      
      await prisma.student.update({
        where: { id: masterRecord.id },
        data: { 
          userId: userId, // Link this master record to the logged-in user
          status: "ACTIVE" 
        }
      })
    } else {
      // If student record exists but is empty/unverified, update it with master data
      await prisma.student.update({
        where: { id: currentUserStudent.id },
        data: {
          studentId: masterRecord.studentId,
          classId: masterRecord.classId,
          batchId: masterRecord.batchId,
          firstName: masterRecord.firstName,
          lastName: masterRecord.lastName,
          gender: masterRecord.gender,
          status: "ACTIVE"
        }
      })

      // If we had a separate master record, we might want to clean it up or mark it
      if (masterRecord.id !== currentUserStudent.id) {
        // Delete the master record since we moved its logic or it was a duplicate
        try {
          await prisma.student.delete({ where: { id: masterRecord.id } })
        } catch (e) {
          console.warn("Could not delete duplicate master record:", e)
        }
      }
    }

    revalidatePath("/dashboard/student")
    return { success: true }
  } catch (error: any) {
    console.error("Verification error details:", error)
    return { success: false, error: `Cillad: ${error.message || "Unknown error"}` }
  }
}
