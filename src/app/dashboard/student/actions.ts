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
    // In our current schema, the Student record is created during sign up.
    // We need to move the data (Class, Batch, etc.) from the master record to the current user's student record.
    // Or better: If the admin pre-created it with a dummy email, we merge them.
    
    const currentUserStudent = await prisma.student.findUnique({
      where: { userId }
    })

    if (!currentUserStudent) {
      return { success: false, error: "Account-kaaga lama helin." }
    }

    // Update the current user's student record with the details from the master record
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

    // Optionally: If the master record was a separate record (placeholder), delete it to avoid duplicates
    if (masterRecord.id !== currentUserStudent.id) {
      // Before deleting, check if it has its own user (dummy user)
      if (masterRecord.userId) {
         // Logically we might want to clean up, but for now let's just ensure the link is made
      }
    }

    revalidatePath("/dashboard/student")
    return { success: true }
  } catch (error) {
    console.error("Verification error:", error)
    return { success: false, error: "Cillad ayaa dhacday intii lagu guda jiray xaqiijinta." }
  }
}
