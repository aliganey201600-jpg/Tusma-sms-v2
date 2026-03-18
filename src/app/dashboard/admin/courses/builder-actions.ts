"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCourseStructure(courseId: string, studentId?: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
            quizzes: { orderBy: { order: 'asc' } }
          }
        },
        enrollments: studentId ? {
          where: { studentId },
          take: 1
        } : false
      }
    })
    return course
  } catch (error) {
    console.error("Error fetching course structure:", error)
    return null
  }
}

export async function addSection(courseId: string, title: string) {
  try {
    const lastSection = await prisma.courseSection.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    })
    const order = lastSection ? lastSection.order + 1 : 0
    
    await prisma.courseSection.create({
      data: { courseId, title, order }
    })
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error: any) {
    console.error("CURRICULUM_LOG_ERROR:", error);
    return { success: false, error: error.message || "Failed to add section" }
  }
}

export async function addLesson(sectionId: string, title: string) {
  try {
    const [lastL, lastQ] = await Promise.all([
      prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } }),
      prisma.quiz.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } })
    ])
    const maxL = lastL?.order ?? -1
    const maxQ = lastQ?.order ?? -1
    const order = Math.max(maxL, maxQ) + 1
    
    const lesson = await prisma.lesson.create({
      data: { sectionId, title, order },
      include: { section: true }
    })
    
    const courseId = lesson.section.courseId
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function addQuiz(sectionId: string, title: string) {
  try {
    const [lastL, lastQ] = await Promise.all([
      prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } }),
      prisma.quiz.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } })
    ])
    const maxL = lastL?.order ?? -1
    const maxQ = lastQ?.order ?? -1
    const order = Math.max(maxL, maxQ) + 1
    
    const quiz = await prisma.quiz.create({
      data: { sectionId, title, order },
      include: { section: true }
    })

    const courseId = quiz.section.courseId
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true, quizId: quiz.id }
  } catch (error) {
    return { success: false }
  }
}

export async function updateLesson(lessonId: string, data: {
  title?: string;
  content?: string;
  objectives?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  duration?: number;
}) {
  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
      include: { section: true }
    })
    
    const courseId = updatedLesson.section.courseId
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error) {
    console.error("Update Lesson Error:", error)
    return { success: false }
  }
}

export async function updateQuiz(quizId: string, data: {
  title?: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  description?: string;
  lessonId?: string | null;
}) {
  try {
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data,
      include: { section: true }
    })

    const courseId = updatedQuiz.section.courseId
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error) {
    console.error("Update Quiz Error:", error)
    return { success: false }
  }
}

// ─── Quiz Question CRUD ─────────────────────────────────────────────────────

export async function getQuizWithQuestions(quizId: string, studentId?: string) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } }
        },
        section: { select: { courseId: true } },
        lesson: { select: { id: true, title: true } }, 
        attempts: studentId ? {
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 10
        } : false
      }
    })
    return quiz as any
  } catch (error) {
    return null
  }
}

export async function saveQuizQuestions(quizId: string, questions: any[]) {
  try {
    // Delete all existing questions (cascade deletes options)
    await prisma.quizQuestion.deleteMany({ where: { quizId } })

    // Re-create all questions with their options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      await prisma.quizQuestion.create({
        data: {
          quizId,
          question: q.question,
          type: q.type,
          points: q.points ?? 1,
          required: q.required ?? true,
          shuffleOptions: q.shuffleOptions ?? false,
          hint: q.hint || null,
          correctAnswer: q.correctAnswer || null,
          order: i,
          options: {
            create: (q.options || []).map((opt: any, oi: number) => ({
              text: opt.text,
              isCorrect: opt.isCorrect ?? false,
              matchKey: opt.matchKey || null,
              points: opt.points ?? 1,
              order: oi,
            }))
          }
        }
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("saveQuizQuestions error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteSection(id: string) {
  try {
    const section = await prisma.courseSection.delete({ 
      where: { id },
      select: { courseId: true }
    })
    revalidatePath(`/dashboard/admin/courses/${section.courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${section.courseId}/preview`)
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function reorderSections(courseId: string, sections: { id: string, order: number }[]) {
  try {
    const updates = sections.map(s => prisma.courseSection.update({
      where: { id: s.id },
      data: { order: s.order }
    }))
    await prisma.$transaction(updates)
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error) {
    console.error("Reorder Sections Error:", error)
    return { success: false }
  }
}

export async function reorderItems(courseId: string, items: { id: string, type: 'lesson' | 'quiz', order: number }[]) {
  try {
    const updates = items.map(item => {
      if (item.type === 'lesson') {
        return prisma.lesson.update({ where: { id: item.id }, data: { order: item.order } })
      } else {
        return prisma.quiz.update({ where: { id: item.id }, data: { order: item.order } })
      }
    })
    await prisma.$transaction(updates)
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    revalidatePath(`/dashboard/student/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function saveQuizAttempt(data: {
  quizId: string
  studentId: string
  score: number
  earnedPoints: number
  totalPoints: number
  passed: boolean
  results: any
  timeSpent?: number
}) {
  try {
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        studentId: data.studentId,
        score: data.score,
        earnedPoints: data.earnedPoints,
        totalPoints: data.totalPoints,
        passed: data.passed,
        results: data.results,
        timeSpent: data.timeSpent
      }
    })

    // Gamification XP calculation
    if (data.passed) {
      const xpGained = Math.round(data.score / 2) // Example: 100 score = 50 XP
      await prisma.student.update({
        where: { id: data.studentId },
        data: { totalXp: { increment: xpGained } }
      })
      
      const quiz = await prisma.quiz.findUnique({ where: { id: data.quizId }, select: { section: { select: { courseId: true } } } })
      if (quiz?.section?.courseId) {
        await prisma.enrollment.updateMany({
           where: { studentId: data.studentId, courseId: quiz.section.courseId },
           data: { points: { increment: xpGained } }
        })
      }
    }

    return { success: true, attempt }
  } catch (error) {
    console.error("Error saving quiz attempt:", error)
    return { success: false }
  }
}

export async function getQuizAttempts(quizId: string, studentId: string) {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, studentId },
      orderBy: { createdAt: 'desc' }
    })
    return JSON.parse(JSON.stringify(attempts))
  } catch (error) {
    console.error("Error fetching attempts:", error)
    return []
  }
}

export async function completeLesson(lessonId: string, studentId: string) {
  try {
    const existing = await prisma.lessonCompletion.findUnique({
      where: { lessonId_studentId: { lessonId, studentId } }
    })

    if (!existing) {
      await prisma.lessonCompletion.create({
        data: { lessonId, studentId }
      })
      
      const xpGained = 15 // 15 XP for watching a lesson
      await prisma.student.update({
        where: { id: studentId },
        data: { totalXp: { increment: xpGained } }
      })
      
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { section: { select: { courseId: true } } } })
      if (lesson?.section?.courseId) {
         await prisma.enrollment.updateMany({
           where: { studentId, courseId: lesson.section.courseId },
           data: { points: { increment: xpGained } }
         })
      }
    }
    return { success: true }
  } catch (error) {
    console.error("Error completing lesson:", error)
    return { success: false }
  }
}

export async function getCourseProgress(courseId: string, studentId: string) {
  try {
    const [totalLessons, totalQuizzes, lessonCompletions, passedQuizAttempts] = await Promise.all([
      prisma.lesson.count({
        where: { section: { courseId } }
      }),
      prisma.quiz.count({
        where: { section: { courseId } }
      }),
      prisma.lessonCompletion.findMany({
        where: {
          studentId,
          lesson: { section: { courseId } }
        },
        select: { lessonId: true }
      }),
      // Get the best (highest score) attempt per quiz—if passed, count it as completed
      prisma.quizAttempt.findMany({
        where: {
          studentId,
          passed: true,
          quiz: { section: { courseId } }
        },
        select: { quizId: true },
        distinct: ['quizId']
      })
    ])

    const completedLessonIds = lessonCompletions.map(c => c.lessonId)
    const passedQuizIds = passedQuizAttempts.map(a => a.quizId)

    // Unified list of all completed items (lessons + passed quizzes)
    const completedItemIds = [...completedLessonIds, ...passedQuizIds]

    // Progress is based on the total number of lessons + quizzes
    const totalItems = totalLessons + totalQuizzes
    const progress = totalItems > 0
      ? Math.round((completedItemIds.length / totalItems) * 100)
      : 0

    return { progress, completedLessonIds: completedItemIds }
  } catch (error) {
    console.error("Error fetching progress:", error)
    return { progress: 0, completedLessonIds: [] }
  }
}

export async function updateLastAccessed(courseId: string, studentId: string, lessonId: string) {
  try {
    await prisma.enrollment.update({
      where: {
        studentId_courseId: { studentId, courseId }
      },
      data: {
        lastLessonId: lessonId,
        lastAccessedAt: new Date()
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating last accessed:", error)
    return { success: false }
  }
}

export async function issueCertificate(courseId: string, studentId: string) {
  try {
    const existing = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    })

    if (existing) return { success: true, certificate: existing }

    const uniqueId = `CER-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    const certificate = await prisma.certificate.create({
      data: {
        courseId,
        studentId,
        certificateUniqueId: uniqueId
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } }
      }
    })

    return { success: true, certificate }
  } catch (error) {
    console.error("Error issuing certificate:", error)
    return { success: false }
  }
}

export async function getCertificate(courseId: string, studentId: string) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } }
      }
    })
    return certificate
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return null
  }
}

export async function generateLessonContentAI(topicName: string, courseName?: string, sourceContext?: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "GEMINI_API_KEY is missing." };

  try {
    const prompt = `You are an expert academic curriculum designer. 
    
    ${sourceContext ? `CRITICAL SOURCE MATERIAL (Use this for the core factual content):
    -------------------------------------------------------
    ${sourceContext}
    -------------------------------------------------------` : ""}

    TASK: Write a highly detailed, comprehensive, and engaging lesson about "${topicName}" ${courseName ? `within the context of a course titled "${courseName}"` : ""}. 
    
    Requirements:
    - If Source Material is provided above, ensure the lesson accurately reflects those facts and concepts.
    - Write the content using professional Markdown styling (headings, bold technical terms, structured lists).
    - Start with a clear introduction and learning objectives.
    - Include 3 to 4 well-developed main sections explaining the primary concepts in depth.
    - End with a summary or "Gunaanad & Qodobbada Muhiimka ah" (Key Takeaways) section.
    - Write EXCLUSIVELY in Somali, maintaining a formal academic yet accessible tone. Use Somali for explanations while keeping standard international technical terms in English (but explain them).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) return { error: "Failed to connect to AI service." };

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts) {
        return { content: data.candidates[0].content.parts[0].text };
    }
    return { error: "Empty response from AI." };
  } catch (error: any) {
    return { error: error.message || "Internal server error" };
  }
}

export async function fetchYoutubeTranscript(url: string) {
  try {
    const { YoutubeTranscript } = require('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const fullText = (transcript as any[]).map(t => t.text).join(" ");
    return { text: fullText };
  } catch (err: any) {
    console.error("YouTube Error:", err);
    return { error: "Could not fetch YouTube transcript. Ensure the video has subtitles enabled." };
  }
}

export async function extractPdfTextAction(formData: FormData) {
  try {
    const pdf = require('pdf-parse');
    const file = formData.get('file') as File;
    if (!file) return { error: "No file provided" };
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    
    return { text: data.text };
  } catch (err: any) {
    console.error("PDF Parse Error:", err);
    return { error: "Failed to extract text from PDF." };
  }
}
