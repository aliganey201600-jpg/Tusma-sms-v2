"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function fetchStudents() {
  try {
    const studentsData = await prisma.$queryRawUnsafe(`
      SELECT 
        s.*, 
        u.email, 
        c.name as class_name, 
        c.grade as class_grade,
        c.level as class_level,
        b.name as batch_name
      FROM "Student" s
      JOIN "User" u ON s."userId" = u.id
      LEFT JOIN "Class" c ON s."classId" = c.id
      LEFT JOIN "Batch" b ON s."batchId" = b.id
      ORDER BY s."createdAt" DESC
    `)

    return (studentsData as any[]).map((s: any) => {
      const grade = s.class_grade || 0
      let displayLevel = ""
      if (grade >= 1 && grade <= 4) displayLevel = "Lower Primary"
      else if (grade >= 5 && grade <= 8) displayLevel = "Upper Primary"
      else if (grade >= 9 && grade <= 12) displayLevel = "Secondary"
      else displayLevel = s.class_level || "N/A"

      return {
        id: s.id,
        studentId: s.studentId || "N/A",
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phone || "N/A",
        class: s.class_name || "N/A",
        level: displayLevel,
        grade: grade.toString(),
        gender: s.gender,
        age: s.age?.toString() || "N/A",
        guardianName: s.guardianName || "N/A",
        guardianPhone: s.guardianPhone || "N/A",
        batch: s.batch_name || "N/A",
        status: s.status || "ACTIVE"
      }
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

export async function fetchClassesForStudents() {
  try {
    const classes = await (prisma as any).class.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        grade: true,
      },
      orderBy: { grade: "asc" }
    })

    // Derive level from grade for accuracy
    return classes.map((c: any) => {
      const grade = c.grade || 0
      let level = ""
      if (grade >= 1 && grade <= 4) level = "Lower Primary"
      else if (grade >= 5 && grade <= 8) level = "Upper Primary"
      else if (grade >= 9 && grade <= 12) level = "Secondary"
      else level = c.level || "N/A"
      return { id: c.id, name: c.name, level, grade }
    })
  } catch (error) {
    console.error("Error fetching classes for student dropdown:", error)
    return []
  }
}

// New validation action for CSV Preview
export async function validateImportData(studentsData: any[]) {
  try {
    const results = [];
    const seenIds = new Set();
    const seenEmails = new Set();
    
    for (const data of studentsData) {
      const email = data.email?.toLowerCase().trim();
      const studentId = data.studentId?.trim();

      // Check for existing records in Database
      const existingUser = email ? await prisma.user.findFirst({ 
        where: { email },
        include: { student: true }
      }) : null;
      
      const existingStudent = studentId ? await (prisma.student as any).findFirst({ 
        where: { studentId },
        include: { user: true }
      }) : null;
      
      const errors = [];
      let isDuplicate = false;

      // 1. Check DB collisions
      if (existingUser) {
        isDuplicate = true;
        errors.push(`Email (${email}) is already registered`);
      }
      if (existingStudent) {
        isDuplicate = true;
        errors.push(`ID (${studentId}) is already taken`);
      }

      // 2. Check Intra-file collisions (Ali might be a duplicate of John in the same file)
      if (studentId && seenIds.has(studentId)) {
        isDuplicate = true;
        errors.push(`Duplicate ID (${studentId}) found in file`);
      }
      if (email && seenEmails.has(email)) {
        isDuplicate = true;
        errors.push(`Duplicate Email (${email}) found in file`);
      }

      // Track what we've seen so far in this batch
      if (studentId) seenIds.add(studentId);
      if (email) seenEmails.add(email);
      
      results.push({
        ...data,
        isDuplicate: isDuplicate,
        errorMessage: errors.join(", ")
      });
    }
    
    return { success: true, data: results };
  } catch (error) {
    console.error("Validation error:", error);
    return { success: false, error: "Data validation failed" };
  }
}

// Map display status values to Prisma enum values
function normalizeStatus(status: string): string {
  const map: Record<string, string> = {
    "active": "ACTIVE",
    "inactive": "INACTIVE",
    "pending": "PENDING",
    "graduate": "GRADUATED",
    "graduated": "GRADUATED",
  }
  return map[status?.toLowerCase()] || "ACTIVE"
}

export async function createStudent(data: any) {
  try {
    const [firstName = "", ...rest] = (data.name || "").trim().split(" ")
    const lastName = rest.join(" ") || " "

    if (!data.email) return { success: false, error: "Email is required." }

    // Check if studentId already exists
    if (data.studentId) {
      const existingId: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "Student" WHERE "studentId" = $1 LIMIT 1`,
        data.studentId
      );
      if (existingId.length > 0) return { success: false, error: "Student ID is already assigned to another student." }
    }

    let classId = null
    if (data.class && data.class !== "all" && data.class !== "N/A") {
      const classRec: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "Class" WHERE name = $1 LIMIT 1`,
        data.class
      );
      if (classRec.length > 0) classId = classRec[0].id;
    }

    // Check if user already exists
    const existingUsers: any[] = await prisma.$queryRawUnsafe(
      `SELECT u.id, s.id as student_id FROM "User" u LEFT JOIN "Student" s ON u.id = s."userId" WHERE u.email = $1 LIMIT 1`,
      data.email.toLowerCase()
    );
    
    if (existingUsers.length > 0 && existingUsers[0].student_id) {
      return { success: false, error: "A student record already exists with this email address." }
    }

    const userId = existingUsers.length > 0 ? existingUsers[0].id : crypto.randomUUID();
    const studentId = crypto.randomUUID();
    const now = new Date();

    if (existingUsers.length === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3::"Role", $4, $5)`,
        userId, data.email.toLowerCase(), "STUDENT", now, now
      );
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Student" (id, "studentId", "userId", "firstName", "lastName", phone, age, gender, "guardianName", "guardianPhone", "dateOfBirth", "classId", "batchId", status, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::"StudentStatus", $15, $16)`,
      studentId, data.studentId || null, userId, firstName, lastName, data.phone || null, 
      data.age ? parseInt(data.age) : null, data.gender || "Male", data.guardianName || null, 
      data.guardianPhone || null, now, classId, data.batchId || null, normalizeStatus(data.status), now, now
    );

    revalidatePath("/dashboard/admin/students")
    return { success: true, id: studentId }
  } catch (error: any) {
    console.error("Error creating student:", error)
    return { success: false, error: error.message || "Failed to add student." }
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const studentData: any[] = await prisma.$queryRawUnsafe(
      `SELECT s.*, u.email FROM "Student" s JOIN "User" u ON s."userId" = u.id WHERE s.id = $1 LIMIT 1`,
      id
    );
    if (studentData.length === 0) return { success: false, error: "Academic record not found." }
    const student = studentData[0];

    // Check if new studentId is taken by SOMEONE ELSE
    if (data.studentId && data.studentId !== student.studentId) {
      const existingId: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "Student" WHERE "studentId" = $1 AND id != $2 LIMIT 1`,
        data.studentId, id
      );
      if (existingId.length > 0) return { success: false, error: "This Student ID is already assigned to another student." }
    }

    const [firstName = "", ...rest] = (data.name || "").trim().split(" ")
    const lastName = rest.join(" ") || " "

    let classId = null
    if (data.class && data.class !== "all" && data.class !== "N/A") {
      const classRec: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "Class" WHERE name = $1 LIMIT 1`,
        data.class
      );
      if (classRec.length > 0) classId = classRec[0].id;
    }

    const now = new Date();

    // Update User Email
    if (data.email && student.email !== data.email) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET email = $1, "updatedAt" = $2 WHERE id = $3`,
        data.email.toLowerCase(), now, student.userId
      );
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "Student" 
       SET "studentId" = $1, "firstName" = $2, "lastName" = $3, phone = $4, age = $5, gender = $6, "guardianName" = $7, "guardianPhone" = $8, "classId" = $9, status = $10::"StudentStatus", "updatedAt" = $11
       WHERE id = $12`,
      data.studentId || null, firstName, lastName, data.phone || null, data.age ? parseInt(data.age) : null,
      data.gender, data.guardianName || null, data.guardianPhone || null, classId, normalizeStatus(data.status), now, id
    );

    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating student:", error)
    return { success: false, error: error.message || "Failed to finalize update." }
  }
}

export async function deleteStudent(id: string) {
  try {
    const students: any[] = await prisma.$queryRawUnsafe(`SELECT "userId" FROM "Student" WHERE id = $1 LIMIT 1`, id);
    if (students.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE id = $1`, students[0].userId);
    }
    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error) {
    console.error("Error deleting student:", error)
    return { success: false, error: "Failed to delete" }
  }
}

export async function importStudentsCSV(studentsData: any[]) {
  try {
    let successCount = 0;
    
    for (const data of studentsData) {
      let firstName = "";
      let lastName = "";
      try {
        const [first = "", ...rest] = (data.name || "").split(" ");
        firstName = first;
        lastName = rest.join(" ") || " ";

        let classRecord = null
        if (data.class) {
          classRecord = await prisma.class.findFirst({ where: { name: data.class } })
        }

        const isDuplicate = data.isDuplicate;
        const targetStatus = isDuplicate ? "PENDING" : "ACTIVE";
        
        // Handle uniqueness for Pending ones
        const suffix = isDuplicate ? `_${Date.now()}_${Math.random().toString(36).substr(2, 3)}` : "";
        const processedEmail = data.email?.trim() || "";
        const processedId = data.studentId?.trim() || "";
        
        const finalEmail = isDuplicate ? `${processedEmail}${suffix}` : (processedEmail || `${Date.now()}@temp.com`);
        const finalStudentId = isDuplicate ? (processedId ? `${processedId}${suffix}` : null) : (processedId || null);

        const userId = crypto.randomUUID();
        const now = new Date();

        // Create User via Raw SQL
        await prisma.$executeRawUnsafe(
          `INSERT INTO "User" (id, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3::"Role", $4, $5)`,
          userId, finalEmail.toLowerCase(), "STUDENT", now, now
        );

        // Create Student via Raw SQL
        const parsedAge = parseInt(data.age);
        const studentId = crypto.randomUUID();
        
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Student" (id, "studentId", "userId", "firstName", "lastName", phone, age, gender, "guardianName", "guardianPhone", "dateOfBirth", "classId", status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::"StudentStatus", $14, $15)`,
          studentId, finalStudentId, userId, firstName, lastName, 
          data.phone?.trim() || null, !isNaN(parsedAge) ? parsedAge : null, 
          data.gender || "Male", data.guardianName?.trim() || null, 
          data.guardianPhone?.trim() || null, now, classRecord?.id || null, 
          targetStatus, now, now
        );
        successCount++;
      } catch (rowError: any) {
        console.error("Row import error:", rowError);
        return { success: false, error: `Import failed at row ${firstName} ${lastName}: ${rowError?.message || String(rowError)}` }
      }
    }

    revalidatePath("/dashboard/admin/students")
    return { success: true, count: successCount }
  } catch (error) {
    console.error("Batch import error:", error)
    return { success: false, error: "Batch import failed" }
  }
}

export async function checkEmailExists(email: string, excludeStudentId?: string): Promise<boolean> {
  try {
    const user = await (prisma.user as any).findFirst({
      where: { email: email.toLowerCase() },
      include: { student: true }
    })
    if (!user?.student) return false
    // If editing, allow the current student's own email
    if (excludeStudentId && user.student.id === excludeStudentId) return false
    return true
  } catch {
    return false
  }
}

export async function checkStudentIdExists(studentId: string, excludeStudentId?: string): Promise<boolean> {
  try {
    const student = await (prisma.student as any).findFirst({
      where: excludeStudentId
        ? { studentId, NOT: { id: excludeStudentId } }
        : { studentId }
    })
    return !!student
  } catch {
    return false
  }
}

export async function approveStudent(id: string) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET status = 'ACTIVE', "updatedAt" = $1 WHERE id = $2`,
      new Date(), id
    );
    revalidatePath("/dashboard/admin/students");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to approve" };
  }
}
