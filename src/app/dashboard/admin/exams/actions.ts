"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchExams() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        course: { select: { name: true } },
        class: { select: { name: true } }
      },
      orderBy: { examDate: 'desc' }
    });
    
    return exams.map(e => ({
      ...e,
      courseName: e.course.name,
      className: e.class.name,
      // Format date for the client
      examDate: e.examDate.toISOString()
    }));
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

export async function fetchCoursesForExams() {
  try {
    // Return all specific class-course combinations that actually exist
    const assignments = await prisma.teacherAssignment.findMany({
      include: {
        course: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
      },
      orderBy: { class: { name: 'asc' } }
    });

    return assignments.map(a => ({
      id: a.course.id,
      name: `${a.course.name} (${a.class.name})`,
      courseId: a.courseId,
      classId: a.classId
    }));
  } catch (error) {
    console.error("Error fetching courses for exams:", error);
    return [];
  }
}

export async function createExam(data: {
  title: string;
  description: string;
  type: any; // ExamType enum
  courseId: string;
  classId: string;
  maxMarks: number;
  examDate: string;
}) {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        courseId: data.courseId,
        classId: data.classId,
        maxMarks: data.maxMarks,
        examDate: new Date(data.examDate),
        status: 'DRAFT'
      }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan abuuro imtixaanka" };
  }
}

export async function updateExam(id: string, data: {
  title: string;
  description: string;
  type: any;
  courseId: string;
  classId: string;
  maxMarks: number;
  examDate: string;
}) {
  try {
    await prisma.exam.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        courseId: data.courseId,
        classId: data.classId,
        maxMarks: data.maxMarks,
        examDate: new Date(data.examDate),
      }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error updating exam:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan cusboonaysiiyo imtixaanka" };
  }
}

export async function deleteExam(id: string) {
  try {
    await prisma.exam.delete({
      where: { id }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error deleting exam:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan tirtiro imtixaanka" };
  }
}

export async function toggleExamStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    await prisma.exam.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling exam status:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan badalo heerka imtixaanka" };
  }
}

export async function duplicateExam(id: string) {
  try {
    const original = await prisma.exam.findUnique({
      where: { id }
    });

    if (!original) return { success: false, error: "Imtixaanka lama helin" };

    await prisma.exam.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        type: original.type,
        courseId: original.courseId,
        classId: original.classId,
        maxMarks: original.maxMarks,
        examDate: original.examDate,
        status: "DRAFT"
      }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error duplicating exam:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan koobiyeeyo imtixaanka" };
  }
}

export async function fetchExamStudents(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { classId: true }
    });

    if (!exam) return [];

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      include: {
        examResults: {
          where: { examId: examId },
          select: { marksObtained: true, remarks: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    return students.map(s => ({
      studentId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      manualId: s.studentId,
      marksObtained: s.examResults[0]?.marksObtained?.toString() || "",
      remarks: s.examResults[0]?.remarks || ""
    }));
  } catch (error) {
    console.error("Error fetching exam students:", error);
    return [];
  }
}

export async function saveExamResults(examId: string, results: any[]) {
  try {
    for (const res of results) {
       await prisma.examResult.upsert({
         where: {
            examId_studentId: {
               examId: examId,
               studentId: res.studentId
            }
         },
         create: {
            examId,
            studentId: res.studentId,
            marksObtained: parseFloat(res.marksObtained) || 0,
            remarks: res.remarks || ""
         },
         update: {
            marksObtained: parseFloat(res.marksObtained) || 0,
            remarks: res.remarks || ""
         }
       });
    }

    // Update exam status if marks are saved
    await prisma.exam.update({
       where: { id: examId },
       data: { status: 'COMPLETED' }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error saving exam results:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan keydiyo dhibcaha" };
  }
}

export async function fetchExamStats() {
  try {
    const [totalExams, totalGraded, avgScore] = await Promise.all([
      prisma.exam.count(),
      prisma.examResult.count(),
      prisma.examResult.aggregate({
         _avg: { marksObtained: true }
      })
    ]);
    
    return {
      totalExams,
      totalGraded,
      averageScore: (avgScore._avg.marksObtained || 0).toFixed(1)
    };
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    return { totalExams: 0, totalGraded: 0, averageScore: "0" };
  }
}
