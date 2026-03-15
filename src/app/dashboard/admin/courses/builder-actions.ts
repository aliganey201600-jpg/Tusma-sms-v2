"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCourseStructure(courseId: string) {
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
        }
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
        attempts: studentId ? {
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 10
        } : false
      }
    })
    return quiz
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
