"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchExams() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT e.*, c.name as "courseName"
      FROM "Exam" e
      JOIN "Course" c ON e."courseId" = c.id
      ORDER BY e."examDate" DESC
    `);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

export async function fetchCoursesForExams() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT id, name FROM "Course" ORDER BY name ASC
    `);
  } catch (error) {
    console.error("Error fetching courses for exams:", error);
    return [];
  }
}

export async function createExam(data: {
  title: string;
  description: string;
  type: string;
  courseId: string;
  maxMarks: number;
  examDate: string;
}) {
  try {
    const id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Exam" (id, title, description, type, "courseId", "maxMarks", "examDate", status)
       VALUES ($1, $2, $3, $4::"ExamType", $5, $6, $7, $8)`,
      id, data.title, data.description, data.type, data.courseId, data.maxMarks, new Date(data.examDate), 'SCHEDULED'
    );
    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { success: false, error: "Failed to create exam" };
  }
}

export async function fetchExamStudents(examId: string) {
  try {
    // Get the courseId for this exam first
    const exam: any[] = await prisma.$queryRawUnsafe(`SELECT "courseId" FROM "Exam" WHERE id = $1`, examId);
    if (!exam.length) return [];

    const courseId = exam[0].courseId;

    // Fetch students enrolled in this course plus their existing results for this exam
    return await prisma.$queryRawUnsafe(`
      SELECT 
        s.id as "studentId", 
        s."firstName", 
        s."lastName", 
        s."studentId" as "manualId",
        er."marksObtained",
        er.remarks
      FROM "Student" s
      JOIN "Enrollment" en ON s.id = en."studentId"
      LEFT JOIN "ExamResult" er ON s.id = er."studentId" AND er."examId" = $2
      WHERE en."courseId" = $1
      ORDER BY s."firstName" ASC
    `, courseId, examId);
  } catch (error) {
    console.error("Error fetching exam students:", error);
    return [];
  }
}

export async function saveExamResults(examId: string, results: any[]) {
  try {
    for (const res of results) {
      const resultId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(`
        INSERT INTO "ExamResult" (id, "examId", "studentId", "marksObtained", remarks, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("examId", "studentId") 
        DO UPDATE SET "marksObtained" = EXCLUDED."marksObtained", remarks = EXCLUDED.remarks, "updatedAt" = NOW()
      `, resultId, examId, res.studentId, parseFloat(res.marksObtained), res.remarks || "");
    }
    revalidatePath("/dashboard/admin/exams");
    return { success: true };
  } catch (error) {
    console.error("Error saving exam results:", error);
    return { success: false, error: "Failed to save results" };
  }
}

export async function fetchExamStats() {
  try {
    const totalExams: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "Exam"`);
    const totalResults: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "ExamResult"`);
    const avgScore: any[] = await prisma.$queryRawUnsafe(`SELECT AVG("marksObtained") as avg FROM "ExamResult"`);
    
    return {
      totalExams: Number(totalExams[0]?.count || 0),
      totalGraded: Number(totalResults[0]?.count || 0),
      averageScore: parseFloat(avgScore[0]?.avg || 0).toFixed(1)
    };
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    return { totalExams: 0, totalGraded: 0, averageScore: 0 };
  }
}
