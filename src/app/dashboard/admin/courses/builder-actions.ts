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
    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' }
    })
    const order = lastLesson ? lastLesson.order + 1 : 0
    
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
    const lastQuiz = await prisma.quiz.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' }
    })
    const order = lastQuiz ? lastQuiz.order + 1 : 0
    
    const quiz = await prisma.quiz.create({
      data: { sectionId, title, order },
      include: { section: true }
    })

    const courseId = quiz.section.courseId
    revalidatePath(`/dashboard/admin/courses/${courseId}/builder`)
    revalidatePath(`/dashboard/admin/courses/${courseId}/preview`)
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function updateLesson(lessonId: string, data: any) {
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
    return { success: false }
  }
}

export async function updateQuiz(quizId: string, data: any) {
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
    return { success: false }
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
