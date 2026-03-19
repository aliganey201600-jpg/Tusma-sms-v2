"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

