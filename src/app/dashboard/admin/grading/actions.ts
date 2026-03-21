/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/utils/supabase/server"

export async function getGradingCourses() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return []

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { teacher: true, student: true }
    })

    // Fallback to ADMIN if no Prisma record is found but they successfully authenticated
    const role = user?.role || 'ADMIN'

    const where: any = {}
    
    if (role === 'TEACHER' && user?.teacher) {
      // Teachers only see their own courses
      where.teacherId = user.teacher.id
    } else if (role === 'STUDENT' && user?.student) {
      where.OR = [
        { enrollments: { some: { studentId: user.student.id } } },
        { teacherAssignments: { some: { classId: user.student.classId } } }
      ]
    }
    // ADMIN / SUPER_ADMIN: no filter — fetch everything

    const courses = await prisma.course.findMany({
      where,
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        teacherAssignments: { 
          include: { 
            class: { 
              select: { 
                name: true,
                _count: { select: { students: true } }
              } 
            } 
          }
        },
        _count: {
          select: {
            enrollments: true,
          }
        },
        sections: {
          include: {
            _count: { select: { quizzes: true } }
          }
        }
      }
    })

    const flattened: any[] = []
    
    courses.forEach(c => {
       const quizCount = c.sections.reduce((acc, s) => acc + s._count.quizzes, 0)
       
       if (c.teacherAssignments.length === 0) {
          flattened.push({
            id: c.id,
            name: c.name,
            teacher: `${c.teacher.firstName} ${c.teacher.lastName}`,
            className: "Unassigned",
            studentsCount: c._count.enrollments || 0,
            quizCount,
            category: c.category || "General",
            classId: null
          })
       } else {
          c.teacherAssignments.forEach(ta => {
            flattened.push({
              id: c.id,
              name: c.name,
              teacher: `${c.teacher.firstName} ${c.teacher.lastName}`,
              className: ta.class?.name || "Unassigned",
              studentsCount: ta.class?._count.students || 0,
              quizCount,
              category: c.category || "General",
              classId: ta.classId
            })
          })
       }
    })

    return flattened
  } catch (error) {
    console.error("Error fetching grading courses:", error)
    return []
  }
}

export async function getCourseQuizzes(courseId: string, classId?: string) {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { section: { courseId } },
      include: {
        attempts: {
          where: classId ? { student: { classId } } : {},
          select: { studentId: true }
        }
      }
    })

    return quizzes.map(q => {
      const uniqueStudents = new Set(q.attempts.map(a => a.studentId)).size
      return {
        ...q,
        uniqueStudents,
        totalAttempts: q.attempts.length
      }
    })
  } catch (error) {
    console.error("Error fetching course quizzes:", error)
    return []
  }
}

export async function getQuizSubmissions(quizId: string, classId?: string) {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { 
        quizId,
        ...(classId ? { student: { classId } } : {})
      },
      include: {
        student: { select: { firstName: true, lastName: true, studentId: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return attempts
  } catch (error) {
    console.error("Error fetching quiz submissions:", error)
    return []
  }
}

export async function getPendingGradingTasks() {
  try {
    const allAttempts = await prisma.quizAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        quiz: { select: { title: true, section: { select: { course: { select: { name: true } } } } } },
        student: { select: { firstName: true, lastName: true, studentId: true } }
      }
    })

    const pendingAttempts = allAttempts.filter(attempt => {
      const results = attempt.results as any[]
      if (!Array.isArray(results)) return false
      return results.some((r: any) => r.manual === true)
    })

    return pendingAttempts
  } catch (error) {
    console.error("Error fetching pending grading tasks:", error)
    return []
  }
}

export async function submitGradeUpdate(attemptId: string, updatedResults: any[]) {
  try {
    let earnedPoints = 0
    let totalPoints = 0
    
    updatedResults.forEach((res) => {
      earnedPoints += (res.earned || 0)
      totalPoints += (res.total || 0)
    })

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true }
    })
    
    if (!attempt) return { success: false, error: "Attempt not found" }

    const passed = score >= (attempt.quiz?.passingScore || 70)

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        results: updatedResults,
        score,
        earnedPoints,
        totalPoints,
        passed
      }
    })

    revalidatePath('/dashboard/admin/grading')
    return { success: true, attempt: updatedAttempt }
  } catch (error: any) {
    console.error("Error updating grade:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function bulkUpdateQuizScores(quizId: string, updates: { studentId: string, earned: number, total: number }[]) {
  try {
    const results = await Promise.all(updates.map(async (upd) => {
      const student = await prisma.student.findFirst({
        where: { OR: [ { studentId: upd.studentId }, { id: upd.studentId } ] }
      })
      
      if (!student) return { studentId: upd.studentId, success: false, error: "Student not found" }

      const attempt = await prisma.quizAttempt.findFirst({
        where: { quizId, studentId: student.id },
        orderBy: { createdAt: 'desc' }
      })

      if (!attempt) return { studentId: upd.studentId, success: false, error: "No attempt found" }

      const score = upd.total > 0 ? Math.round((upd.earned / upd.total) * 100) : 0
      
      // Update results array to mark everything as manual: false (sanity check)
      const currentResults = (attempt.results as any[]) || []
      const updatedResults = currentResults.map(r => ({ ...r, manual: false }))

      await prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          earnedPoints: upd.earned,
          totalPoints: upd.total,
          score,
          results: updatedResults,
          passed: score >= 50 // Default passing score if not set
        }
      })

      return { studentId: upd.studentId, success: true }
    }))

    revalidatePath('/dashboard/admin/grading')
    const successCount = results.filter(r => r.success).length
    return { success: true, count: successCount, details: results }
  } catch (error: any) {
    console.error("Bulk update quiz error:", error)
    return { success: false, error: error.message }
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateAIGrade(questionText: string, studentAnswer: string, maxPoints: number, correctAnswer?: string) {
  if (!process.env.GEMINI_API_KEY) return { success: false, error: "GEMINI_API_KEY is missing." };

  try {
    const prompt = `You are an expert academic evaluator. You need to grade a student's answer to a specific question.
    
    Question: ${questionText}
    ${correctAnswer ? `Official Correct Answer / Rubric: ${correctAnswer}\n` : ""}
    Student's Answer: ${studentAnswer}
    Maximum Possible Points: ${maxPoints}
    
    Instructions:
    1. Read the student's answer carefully.
    2. Determine how many points they deserve out of ${maxPoints}. Use your best academic judgment. A partially correct answer can receive partial points (e.g. 1.5 out of 2).
    3. Write a brief feedback (1-3 sentences in Somali) encouraging the student, explaining why they got these points, and what they missed if applicable.
    
    Respond STRICTLY with a valid JSON document matching this exact format, with no markdown fences, no extra text:
    {
      "earned": <number>,
      "feedback": "<string>"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
       text = text.substring(startIndex, endIndex + 1);
    }
    
    try {
      const parsed = JSON.parse(text);
      return { success: true, earned: parsed.earned, feedback: parsed.feedback };
    } catch (parseError) {
      console.error("AI Grading JSON Parse Error. Raw text:", text);
      return { success: false, error: "Adeega AI-da xog qaldan ayuu soo celiyay. Mar kale isku day." };
    }
  } catch (error: any) {
    console.error("AI Grading Error:", error);
    return { success: false, error: error.message || "Failed to generate AI grade" };
  }
}

export async function generateBatchAIGrades(items: { id: string, question: string, studentAnswer: string, total: number, correctAnswer?: string }[]) {
  if (!process.env.GEMINI_API_KEY) return { success: false, error: "GEMINI_API_KEY is missing." };

  try {
    const prompt = `You are an expert academic evaluator. Grade the following list of student answers. 
    For each item, determine points earned and provide brief Somali feedback (1-3 sentences).
    
    ITEMS TO GRADE:
    ${items.map((it, idx) => `
    ITEM_ID: ${it.id}
    Question: ${it.question}
    ${it.correctAnswer ? `Expected: ${it.correctAnswer}` : ""}
    Student: ${it.studentAnswer}
    Max Points: ${it.total}
    `).join('\n---\n')}
    
    Instructions:
    1. Be fair and consistent.
    2. Give points out of the indicated Max Points for each item.
    3. Provide encouraging Somali feedback.
    
    Respond STRICTLY with a valid JSON array matching this exact format, with no extra text:
    [
      { "id": "string", "earned": number, "feedback": "string" },
      ...
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
       text = text.substring(startIndex, endIndex + 1);
    }
    
    try {
      const parsed = JSON.parse(text);
      return { success: true, results: parsed };
    } catch (parseError) {
      console.error("Batch AI Grading JSON Parse Error. Raw text:", text);
      return { success: false, error: "AI failed to respond in a readable format." };
    }
  } catch (error: any) {
    console.error("Batch AI Grading Error:", error);
    return { success: false, error: error.message || "Bulk grading failed" };
  }
}

export async function generateGlobalQuizAIGrades(quizId: string, classId?: string) {
  if (!process.env.GEMINI_API_KEY) return { success: false, error: "GEMINI_API_KEY is missing." };

  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { 
        quizId,
        ...(classId ? { student: { classId } } : {})
      },
      include: {
        student: { select: { firstName: true, lastName: true } }
      }
    });

    if (attempts.length === 0) {
      return { success: false, error: "No attempts found to grade." };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let successCount = 0;

    for (const attempt of attempts) {
      const results = attempt.results as any[];
      const subjectiveQuestions = results.filter(r => r.manual === true);
      if (subjectiveQuestions.length === 0) continue;

      const prompt = `Grade these ${subjectiveQuestions.length} answers for student ${attempt.student.firstName}.
      ${subjectiveQuestions.map((q, i) => `
      Q${i}: ${q.question}
      Ans: ${q.studentAnswer || "N/A"}
      Ideal: ${q.correctAnswer || "General knowledge"}
      Max: ${q.total}
      `).join('\n')}
      Respond ONLY with: [{"earned": number, "feedback": "string (Somali)"}]`;

      try {
        const aiResult = await model.generateContent(prompt);
        const responseText = aiResult.response.text();
        // Alternative to /s flag: use [\s\S]* to match everything including newlines
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const aiAnswers = JSON.parse(jsonMatch[0]);
          const updatedResults = results.map(r => {
            if (r.manual === true) {
              const subIdx = subjectiveQuestions.findIndex(sq => sq.question === r.question);
              if (subIdx !== -1 && aiAnswers[subIdx]) {
                const eval_ = aiAnswers[subIdx];
                return { ...r, earned: eval_.earned, feedback: eval_.feedback, isCorrect: eval_.earned > 0 };
              }
            }
            return r;
          });

          await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: { results: updatedResults }
          });
          successCount++;
        }
      } catch (e) {
        console.error(`AI fail for attempt ${attempt.id}`);
      }
    }

    revalidatePath("/dashboard/admin/grading");
    return { success: true, message: `Successfully auto-graded ${successCount} student attempts.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate global AI grades" };
  }
}


export async function getCourseGradebookData(courseId: string, classId: string) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const studentFilter: any = { classId }
    if (authUser) {
       const user = await prisma.user.findUnique({ where: { id: authUser.id } })
       if (user?.role === 'STUDENT') {
         const studentProfile = await prisma.student.findUnique({ where: { userId: user.id } })
         if (studentProfile) studentFilter.id = studentProfile.id
       }
    }

    // 1. Get all quizzes for this course
    const quizzes = await prisma.quiz.findMany({
      where: { section: { courseId } },
      orderBy: { order: 'asc' },
      select: { id: true, title: true }
    })

    // 2. Get all students in this class
    const students = await prisma.student.findMany({
      where: studentFilter,
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        studentId: true 
      },
      orderBy: { firstName: 'asc' }
    })

    // 3. Get all quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: { in: quizzes.map(q => q.id) },
        studentId: { in: students.map(s => s.id) }
      },
      select: {
        id: true,
        quizId: true,
        studentId: true,
        score: true,
        earnedPoints: true,
        totalPoints: true
      }
    })

    // 4. Get Exams for this course and class
    const exams = await prisma.exam.findMany({
      where: { courseId, classId },
      select: { id: true, type: true, maxMarks: true }
    })

    const examResults = await prisma.examResult.findMany({
      where: {
        examId: { in: exams.map(e => e.id) },
        studentId: { in: students.map(s => s.id) }
      },
      select: {
        studentId: true,
        examId: true,
        marksObtained: true
      }
    })

    // 5. Transform into a matrix
    const gradebook = students.map(student => {
      const studentAttempts = attempts.filter(a => a.studentId === student.id)
      const studentExamResults = examResults.filter(er => er.studentId === student.id)

      const quizScores: Record<string, { earned: number; total: number; score: number } | null> = {}
      let totalEarned = 0
      let totalPossible = 0

      quizzes.forEach(quiz => {
        // Best attempt for this quiz
        const quizAttempt = studentAttempts
          .filter(a => a.quizId === quiz.id)
          .sort((a, b) => b.score - a.score)[0]
        
        if (quizAttempt) {
          quizScores[quiz.id] = {
            earned: quizAttempt.earnedPoints || 0,
            total: quizAttempt.totalPoints || 0,
            score: quizAttempt.score
          }
          totalEarned += (quizAttempt.earnedPoints || 0)
          totalPossible += (quizAttempt.totalPoints || 0)
        } else {
          quizScores[quiz.id] = null
        }
      })

      // Quiz Total (Scaled to 30%)
      const quizTotal30 = totalPossible > 0 ? (totalEarned / totalPossible) * 30 : 0

      // Exam Results
      const midtermResult = studentExamResults.find(er => {
        const ex = exams.find(e => e.id === er.examId)
        return ex?.type === 'MIDTERM'
      })
      const finalResult = studentExamResults.find(er => {
        const ex = exams.find(e => e.id === er.examId)
        return ex?.type === 'FINAL'
      })

      const midtermScore = midtermResult ? Number(midtermResult.marksObtained) : 0
      const finalScore = finalResult ? Number(finalResult.marksObtained) : 0

      const midtermMax = midtermResult?.exam?.maxMarks || 100
      const finalMax = finalResult?.exam?.maxMarks || 100
      
      const midtermWeight = midtermResult ? (midtermScore / midtermMax) * 30 : 0
      const finalWeight = finalResult ? (finalScore / finalMax) * 40 : 0

      // Grand Total (Weighted: 30% Quiz, 30% Mid, 40% Final)
      const grandTotal = Math.round(quizTotal30 + midtermWeight + finalWeight)

      return {
        studentId: student.id,
        manualId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        quizScores,
        quizTotal30: parseFloat(quizTotal30.toFixed(2)),
        midterm: midtermScore,
        final: finalScore,
        grandTotal: parseFloat(grandTotal.toFixed(2))
      }
    })

    return { quizzes, gradebook }
  } catch (error) {
    console.error("Error fetching gradebook data:", error)
    return { quizzes: [], gradebook: [] }
  }
}

export async function getClassOverallGradebook(classId: string) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const studentQuery: any = { classId }
    if (authUser) {
       const user = await prisma.user.findUnique({ where: { id: authUser.id } })
       if (user?.role === 'STUDENT') {
         const studentProfile = await prisma.student.findUnique({ where: { userId: user.id } })
         if (studentProfile) studentQuery.id = studentProfile.id
       }
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          where: { id: studentQuery.id }, // Correctly filter students within the class
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          }
        }
      }
    })

    if (!targetClass) throw new Error("Fasalka lama helin.")

    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: { classId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                quizzes: true
              }
            }
          }
        }
      }
    })

    const courses = teacherAssignments.map(ta => ta.course)
    const courseNames = Array.from(new Set(courses.map(c => c.name)))

    const matrix = await Promise.all(targetClass.students.map(async (student) => {
      const courseGrades: Record<string, any> = {}
      let totalValidGrades = 0
      let sumOfAverages = 0

      for (const courseName of courseNames) {
        const matchingCourses = courses.filter(c => c.name === courseName)
        const courseIds = matchingCourses.map(c => c.id)
        const quizIds = matchingCourses.flatMap(c => c.sections.flatMap(s => s.quizzes.map(q => q.id)))

        // Fetch Quizzes average
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: { studentId: student.id, quizId: { in: quizIds } },
          select: { quizId: true, score: true }
        })
        const bestQuizScores: Record<string, number> = {}
        quizAttempts.forEach(a => {
           const s = parseFloat(a.score.toString())
           if (!bestQuizScores[a.quizId] || s > bestQuizScores[a.quizId]) bestQuizScores[a.quizId] = s
        })
        const quizAvg = quizIds.length > 0 ? Math.round(Object.values(bestQuizScores).reduce((a, b) => a + b, 0) / quizIds.length) : 0

        // Fetch Exam results (Midterm & Final)
        const examResults = await prisma.examResult.findMany({
          where: { 
            studentId: student.id, 
            exam: { courseId: { in: courseIds }, classId: classId } 
          },
          include: { exam: true }
        })

        const midtermResult = examResults.find(r => r.exam.type === 'MIDTERM')
        const finalResult = examResults.find(r => r.exam.type === 'FINAL')

        const midtermRaw = midtermResult?.marksObtained || 0
        const finalRaw = finalResult?.marksObtained || 0
        const midtermMax = midtermResult?.exam?.maxMarks || 100
        const finalMax = finalResult?.exam?.maxMarks || 100

        const midtermWeight = midtermResult ? (midtermRaw / midtermMax) * 30 : 0
        const finalWeight = finalResult ? (finalRaw / finalMax) * 40 : 0
        
        // Calculate Weighted Grade: 30% Quizzes, 30% Midterm, 40% Final (Total 100%)
        const hasExams = examResults.length > 0
        const weightedGrade = hasExams 
          ? Math.round((quizAvg * 0.3) + midtermWeight + finalWeight)
          : Math.round(quizAvg * 0.3)

        courseGrades[courseName] = {
           grade: weightedGrade,
           midterm,
           final,
           quizzes: quizAvg
        }
        
        sumOfAverages += weightedGrade
        totalValidGrades++
      }

      const overallAverage = totalValidGrades > 0 ? Math.round(sumOfAverages / totalValidGrades) : 0

      return {
        studentId: student.id,
        manualId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        courseGrades,
        overallAverage
      }
    }))

    return {
      className: targetClass.name,
      courses: courseNames,
      students: matrix
    }
  } catch (error) {
    console.error("getClassOverallGradebook error:", error)
    return { className: "", courses: [], students: [] }
  }
}

export async function getGradingClasses() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return []

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { teacher: true, student: true }
    })

    const role = user?.role || 'ADMIN'

    const where: any = {}

    if (role === 'TEACHER' && user?.teacher) {
      // Teacher sees only classes they're assigned to
      where.subjectAssignments = { some: { teacherId: user.teacher.id } }
    } else if (role === 'STUDENT' && user?.student) {
      where.id = user.student.classId
    }
    // ADMIN / SUPER_ADMIN: no filter — fetch everything

    const classes = await prisma.class.findMany({
      where,
      include: {
        _count: {
          select: {
            students: true,
            subjectAssignments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return classes.map(c => ({
      id: c.id,
      name: c.name,
      studentsCount: (c as any)._count.students,
      coursesCount: (c as any)._count.subjectAssignments
    }))
  } catch (error) {
    console.error("getGradingClasses error:", error)
    return []
  }
}
export async function getBulkReportData(classId: string) {
  try {
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          }
        }
      }
    })

    if (!targetClass) throw new Error("Fasalka lama helin.")

    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: { classId },
      include: {
        course: {
          include: {
            teacher: { select: { firstName: true, lastName: true } },
            sections: { include: { quizzes: true } }
          }
        }
      }
    })

    const courses = teacherAssignments.map(ta => ta.course)
    
    const studentsFullData = await Promise.all(targetClass.students.map(async (student) => {
      const studentGrades: any[] = []

      for (const course of courses) {
        const quizIds = course.sections.flatMap(s => s.quizzes.map(q => q.id))
        
        // 1. Quizzes
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: { studentId: student.id, quizId: { in: quizIds } },
          select: { quizId: true, score: true }
        })
        const bestQuizScores: Record<string, number> = {}
        quizAttempts.forEach(a => {
           const s = parseFloat(a.score.toString())
           if (!bestQuizScores[a.quizId] || s > bestQuizScores[a.quizId]) bestQuizScores[a.quizId] = s
        })
        const quizAvg = quizIds.length > 0 ? Math.round(Object.values(bestQuizScores).reduce((a, b) => a + b, 0) / quizIds.length) : 0

        // 2. Exams
        const examResults = await prisma.examResult.findMany({
          where: { studentId: student.id, exam: { courseId: course.id, classId: classId } },
          include: { exam: true }
        })
        const midtermResult = examResults.find(r => r.exam.type === 'MIDTERM')
        const finalResult = examResults.find(r => r.exam.type === 'FINAL')

        const midtermRaw = midtermResult?.marksObtained || 0
        const finalRaw = finalResult?.marksObtained || 0
        const midtermMax = midtermResult?.exam?.maxMarks || 100
        const finalMax = finalResult?.exam?.maxMarks || 100

        const midtermWeight = midtermResult ? (midtermRaw / midtermMax) * 30 : 0
        const finalWeight = finalResult ? (finalRaw / finalMax) * 40 : 0
        
        // 3. Weighting (30% Q, 30% M, 40% F)
        const finalGrade = examResults.length > 0 
           ? Math.round((quizAvg * 0.3) + midtermWeight + finalWeight)
           : quizAvg

        const gpa = finalGrade >= 90 ? 4.0 : finalGrade >= 80 ? 3.5 : finalGrade >= 70 ? 3.0 : finalGrade >= 60 ? 2.5 : finalGrade >= 50 ? 2.0 : 0.0

        studentGrades.push({
          subject: course.name,
          teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
          grade: finalGrade,
          quizzes: quizAvg,
          midterm,
          final,
          gpa
        })
      }

      return {
        user: {
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          id: student.id
        },
        grades: studentGrades
      }
    }))

    return { success: true, className: targetClass.name, studentsWithGrades: studentsFullData }
  } catch (error) {
    console.error("getBulkReportData error:", error)
    return { success: false, error: "Cillad ayaa dhacday" }
  }
}
