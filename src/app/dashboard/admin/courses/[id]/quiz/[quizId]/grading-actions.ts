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

     const prompt = `You are a professional academic examiner for Tusmo Educational System. 
     Your goal is to evaluate a student's answer accurately, even if the phrasing or spelling of proper nouns varies (e.g., "Mogadishu", "Muqdisho", "Muqdisha", "Mogdishu" are all the same).

     Context:
     - Question: ${question}
     - Student's Submission: "${studentAnswer}"
     - Expected Reference: "${referenceAnswer}"
     - Maximum Points: ${maxPoints}

     Grading Criteria:
     1. Semantic Accuracy: Does the student demonstrate they know the correct answer? (e.g. if the answer is "Muqdisho" and they say "Mogadishu", that is 100% correct).
     2. Linguistic Flexibility: For Somali names and locations, accept common variations in spelling.
     3. Partial Credit: If the answer is partially correct but missing details, award points proportionally.
     4. Tone: Provide encouraging and professional feedback. Use Somali for your feedback if the question/answer is in Somali.

     JSON Output Format:
     Return ONLY a JSON object: { "score": number, "feedback": "string" }`;

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
    let totalEarned = 0;

    for (let i = 0; i < updatedResults.length; i++) {
        const res = updatedResults[i];
        
        // Find the question definition in the database to be 100% sure of the type
        const q = attempt.quiz.questions.find(q => q.question === res.question);
        const type = res.type || q?.type;
        
        const isSubjectiveType = type === "SHORT_ANSWER" || type === "ESSAY" || type === "FILL_BLANK";
        
        if (isSubjectiveType) {
           if (q) {
              const aiResult = await callGradeAI(q.question, res.studentAnswer, q.correctAnswer || "", q.points);
              
              if (aiResult.score !== undefined) {
                 updatedResults[i] = {
                    ...res,
                    earned: aiResult.score,
                    isCorrect: aiResult.score >= (q.points * 0.7),
                    feedback: aiResult.feedback,
                    aiGraded: true,
                    manual: false,
                    type: type // Ensure type is saved
                 };
              }
           }
        }
        totalEarned += updatedResults[i].earned || 0;
    }

    const newScore = (totalEarned / attempt.totalPoints) * 100;

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        results: updatedResults,
        earnedPoints: totalEarned,
        score: newScore,
        passed: newScore >= 70,
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

// Fetch a single submission for a specific student attempt
export async function getSingleSubmission(attemptId: string) {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          }
        },
        quiz: {
          select: {
            title: true,
          }
        }
      },
    });
    return attempt;
  } catch (error) {
    console.error("Error fetching single submission:", error);
    return null;
  }
}
