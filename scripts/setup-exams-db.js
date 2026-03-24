const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createExamsTables() {
  console.log("Creating Exams & Results tables...");
  try {
    // 1. Create Enum (If not exists)
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "ExamType" AS ENUM ('MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT', 'OTHER')`);
      console.log("- ExamType enum created.");
    } catch (e) {
      console.log("- ExamType enum already exists or could not be created.");
    }

    // 2. Create Exam table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Exam" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "type" "ExamType" NOT NULL DEFAULT 'MIDTERM',
        "courseId" TEXT NOT NULL,
        "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
        "examDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
      )
    `);
    console.log("- Exam table ready.");

    // 3. Create ExamResult table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ExamResult" (
        "id" TEXT PRIMARY KEY,
        "examId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "marksObtained" DOUBLE PRECISION NOT NULL,
        "remarks" TEXT,
        "gradedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE,
        CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
        UNIQUE("examId", "studentId")
      )
    `);
    console.log("- ExamResult table ready.");

    console.log("SUCCESS: All exams tables are ready!");
  } catch (error) {
    console.error("FAILED to create tables:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createExamsTables();
