"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendWhatsAppNotification } from "@/utils/whatsapp"
import { format } from "date-fns"

/**
 * Fetch assigned courses for a teacher
 */
export async function fetchTeacherCourses(teacherId: string) {
  try {
    return await prisma.teacherAssignment.findMany({
      where: { teacherId },
      include: {
        course: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    return [];
  }
}

/**
 * Save Subject Attendance and Send Immediate WhatsApp Alerts
 */
export async function saveSubjectAttendance({
  classId,
  courseId,
  courseName,
  date,
  records
}: {
  classId: string;
  courseId: string;
  courseName: string;
  date: string;
  records: { studentId: string; status: string; remarks?: string }[];
}) {
  try {
    const dateObj = new Date(date);
    const somaliDate = format(dateObj, "dd/MM/yyyy");

    // 1. Save to Database
    for (const record of records) {
      // @ts-ignore - Prisma needs migration to recognize new fields
      await prisma.attendance.upsert({
        where: {
          // @ts-ignore
          studentId_date_courseId: {
            studentId: record.studentId,
            date: dateObj,
            courseId: courseId
          }
        },
        update: {
          status: record.status as any,
          remarks: record.remarks || null
        },
        create: {
          date: dateObj,
          status: record.status as any,
          remarks: record.remarks || null,
          studentId: record.studentId,
          // @ts-ignore
          courseId: courseId
        }
      });
    }

    // 2. Trigger Immediate Notifications for ABSENT students
    const absentRecords = records.filter(r => r.status === "ABSENT");
    
    if (absentRecords.length > 0) {
      const studentIds = absentRecords.map(r => r.studentId);
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          guardianPhone: true,
          guardianName: true
        }
      });

      for (const student of students) {
        const studentName = `${student.firstName} ${student.lastName}`;
        const guardianName = student.guardianName || "Waalid";
        
        // Message format requested by user
        const message = 
            `*Tusmo School — Ogeysiis Maqnaanshaha*\n\n` +
            `Salaan mudan/marwo *${guardianName}*,\n` +
            `Waxaan kugu ogeysiinaynaa in ardayga *${studentName}* uu ka maqnaa maadada *${courseName}* maanta oo ay taariikhdu tahay *${somaliDate}*.\n\n` +
            `Fadlan nala soo xiriir haddii aad ogtahay sababta. Mahadsanid.`;

        // Send to Guardian
        if (student.guardianPhone) {
          await sendWhatsAppNotification({ phone: student.guardianPhone, message });
        }
        
        // Optionally send to Student if they have a phone
        if (student.phone) {
          const studentMsg = `Salaan ${student.firstName}, waxaa lagugu soo qoray maqnaanshaha maadada ${courseName} maanta (${somaliDate}). Fadlan sababta la xiriir xafiiska.`;
          await sendWhatsAppNotification({ phone: student.phone, message: studentMsg });
        }
      }
    }

    revalidatePath("/dashboard/teacher/attendance");
    return { success: true, count: absentRecords.length };
  } catch (error: any) {
    console.error("Error saving subject attendance:", error);
    return { success: false, error: error.message };
  }
}
