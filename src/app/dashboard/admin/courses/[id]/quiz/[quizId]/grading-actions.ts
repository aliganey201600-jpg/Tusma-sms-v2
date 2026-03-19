"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Unified AI Caller for Grading
async function callGradeAI(question: string, studentAnswer: string, referenceAnswer: string, maxPoints: number) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "GEMINI_API_KEY is missing." };

  try {
     // Step 1: Discover available models
     const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
     const listData = await listResponse.json();
     const availableModels = listData.models || [];
     const listNames = availableModels.map((m: any) => m.name);

     let finalModelName = "gemini-1.5-flash"; 
     if (listNames.includes("models/gemini-flash-latest")) {
       finalModelName = "gemini-flash-latest";
     } else if (listNames.includes("models/gemini-pro-latest")) {
       finalModelName = "gemini-pro-latest";
     } else if (availableModels.length > 0) {
       const nonExp = availableModels.find((m: any) => !m.name.includes("2.0") && !m.name.includes("2.5") && (m.name.includes("flash") || m.name.includes("pro")));
       finalModelName = (nonExp ? nonExp.name : availableModels[0].name).replace("models/", "");
     }

     const prompt = `You are a professional academic examiner for Tusmo. 
     Grade the following student answer based on the correct reference answer and maximum points allowed.

     Question: ${question}
     Student's Answer: ${studentAnswer}
     Correct Reference: ${referenceAnswer}
     Max Points: ${maxPoints}

     Rules:
     1. Be fair and evaluate accuracy and understanding.
     2. Suggest a score between 0 and ${maxPoints}.
     3. Provide concise, constructive feedback.
     4. If the question or answer is in Somali, respond in Somali.
     
     Output ONLY a JSON object with: { "score": number, "feedback": "string" }`;

     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${finalModelName}:generateContent?key=${key}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         contents: [{ parts: [{ text: prompt }] }]
       }),
     });

     if (!response.ok) {
       const err = await response.json();
       return { error: `Gemini Error: ${err.error?.message || "AI Request Failed"}` };
     }

     const data = await response.json();
     const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
     return JSON.parse(text);
  } catch (error: any) {
    console.error("Grading AI Error:", error);
    return { error: error.message };
  }
}

// Fetch all student submissions for a specific quiz
export async function getQuizSubmissions(quizId: string) {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return attempts;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
}

// Grade a specific attempt using AI for subjective questions
export async function aiGradeSubmissionBatch(attemptId: string) {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
           include: {
              questions: true
           }
        }
      }
    });

    if (!attempt) return { error: "Attempt not found" };

    const results = attempt.results as any[];
    let updatedResults = [...results];
    let earnedPointsIncrement = 0;

    for (let i = 0; i < updatedResults.length; i++) {
        const res = updatedResults[i];
        // Only grade those that are marked for manual grading or 0 score but shouldn't be
        if (res.manual && !res.aiGraded) {
           const questionId = res.questionId; 
           const q = attempt.quiz.questions.find(q => q.question === res.question); // Fallback to Title if matching by ID is tricky in JSON
           
           if (q && (q.type === "SHORT_ANSWER" || q.type === "ESSAY" || q.type === "FILL_BLANK")) {
              const aiResult = await callGradeAI(q.question, res.studentAnswer, q.correctAnswer || "", q.points);
              
              if (aiResult.score !== undefined) {
                 updatedResults[i] = {
                    ...res,
                    earned: aiResult.score,
                    isCorrect: aiResult.score >= (q.points * 0.7),
                    feedback: aiResult.feedback,
                    aiGraded: true,
                    manual: false, // Now it has a score
                 };
                 earnedPointsIncrement += aiResult.score;
              }
           }
        }
    }

    // Update the attempt with new scores
    const newEarnedPoints = attempt.earnedPoints + earnedPointsIncrement;
    const newScore = (newEarnedPoints / attempt.totalPoints) * 100;

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        results: updatedResults,
        earnedPoints: newEarnedPoints,
        score: newScore,
        passed: newScore >= 70, // Basic passing threshold
      }
    });

    return { success: true, newScore };
  } catch (error: any) {
    console.error("Error in AI batch grading:", error);
    return { error: error.message };
  }
}

// Manually update a single question's grade
export async function updateManualGrade(attemptId: string, questionIndex: number, score: number, feedback: string) {
  try {
    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) return { error: "Attempt not found" };

    const results = attempt.results as any[];
    const oldEarned = results[questionIndex].earned || 0;
    
    results[questionIndex] = {
       ...results[questionIndex],
       earned: score,
       feedback,
       manual: false,
       aiGraded: false, // Flag as manually reviewed
    };

    const newEarnedPoints = attempt.earnedPoints - oldEarned + score;
    const newScore = (newEarnedPoints / attempt.totalPoints) * 100;

    await prisma.quizAttempt.update({
       where: { id: attemptId },
       data: {
          results,
          earnedPoints: newEarnedPoints,
          score: newScore,
          passed: newScore >= 70
       }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
