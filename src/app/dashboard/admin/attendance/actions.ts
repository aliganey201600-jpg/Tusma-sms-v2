"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendWhatsAppNotification } from "@/utils/whatsapp"
import { format } from "date-fns"

/**
 * Fetch classes for selection
 */
export async function fetchAttendanceClasses() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT id, name, level, grade
      FROM "Class"
      ORDER BY grade ASC, name ASC
    `);
  } catch (error) {
    console.error("Error fetching attendance classes:", error);
    return [];
  }
}

/**
 * Fetch students for a specific class on a specific date with their attendance status
 */
export async function fetchClassAttendance(classId: string, date: string) {
  try {
    // We want all students in the class, joined with attendance record for that date if it exists
    const query = `
      SELECT 
        s.id as student_id,
        s."firstName",
        s."lastName",
        s."studentId" as manual_id,
        a.id as attendance_id,
        a.status,
        a.remarks
      FROM "Student" s
      LEFT JOIN "Attendance" a ON s.id = a."studentId" AND a.date::date = $1::date
      WHERE s."classId" = $2
      ORDER BY s."firstName" ASC
    `;
    
    return await prisma.$queryRawUnsafe(query, date, classId);
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    return [];
  }
}

/**
 * Save or update attendance for a batch of students
 */
export async function saveAttendance(records: { studentId: string; status: string; remarks?: string }[], date: string) {
  try {
    const dateObj = new Date(date);
    
    // We'll do this in a loop since executeRawUnsafe doesn't easily support batch upserts with logic
    // For a production app with huge classes, a single stored procedure or complex SQL would be better
    for (const record of records) {
      // Upsert logic using Raw SQL (PostgreSQL style: ON CONFLICT)
      const query = `
        INSERT INTO "Attendance" (id, date, status, remarks, "studentId", "createdAt")
        VALUES (gen_random_uuid(), $1, $2::"AttendanceStatus", $3, $4, NOW())
        ON CONFLICT ("studentId", date) 
        DO UPDATE SET 
          status = EXCLUDED.status,
          remarks = EXCLUDED.remarks
      `;
      
      await prisma.$executeRawUnsafe(query, dateObj, record.status, record.remarks || null, record.studentId);
    }
    
    // Post-processing: Trigger Notifications for ABSENT students
    const absentRecords = records.filter(r => r.status === "ABSENT");
    
    if (absentRecords.length > 0) {
      // Fetch details for these students (names and phones)
      const studentIds = absentRecords.map(r => r.studentId);
      const studentDetails: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          s.id, 
          s."firstName", 
          s."lastName", 
          s.phone as student_phone, 
          s."guardianPhone", 
          c.name as class_name
        FROM "Student" s
        JOIN "Class" c ON s."classId" = c.id
        WHERE s.id = ANY($1)
      `, studentIds);

      const readableDate = format(dateObj, "dd/MM/yyyy");

      // Trigger background notifications (Don't await to avoid blocking UI)
      studentDetails.forEach(student => {
        const studentName = `${student.firstName} ${student.lastName}`;
        const message = `Salaam, Nidaamka Tusmo School: Ardayga ${studentName} wuxuu ka maqnaa fasalka (${student.class_name}) maanta oo ay taariikhdu tahay ${readableDate}. Fadlan nala soo xidhiidh haddii ay jirto dhibaato. Mahadsanid.`;

        // Send to Guardian if exists
        if (student.guardianPhone) {
          sendWhatsAppNotification({ phone: student.guardianPhone, message });
        }
        
        // Send to Student if exists
        if (student.student_phone) {
          sendWhatsAppNotification({ phone: student.student_phone, message });
        }
      });
    }
    
    revalidatePath("/dashboard/admin/attendance");
    return { success: true, notificationCount: absentRecords.length };
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return { success: false, error: error.message || "Failed to save attendance" };
  }
}

/**
 * Get attendance statistics for a class in a given month/year
 */
export async function fetchAttendanceStats(classId: string, month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = `
      SELECT 
        status, 
        COUNT(*)::int as count
      FROM "Attendance" a
      JOIN "Student" s ON a."studentId" = s.id
      WHERE s."classId" = $1 AND a.date >= $2 AND a.date <= $3
      GROUP BY status
    `;
    
    return await prisma.$queryRawUnsafe(query, classId, startDate, endDate);
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return [];
  }
}
