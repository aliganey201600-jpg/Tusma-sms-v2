"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getLessonDiscussions(lessonId: string) {
  try {
    const discussions = await prisma.courseDiscussion.findMany({
      where: {
        lessonId,
        parentId: null // Only fetch main threads
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            student: { select: { firstName: true, lastName: true } },
            teacher: { select: { firstName: true, lastName: true } },
            parent: { select: { firstName: true, lastName: true } },
            role: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                student: { select: { firstName: true, lastName: true } },
                teacher: { select: { firstName: true, lastName: true } },
                parent: { select: { firstName: true, lastName: true } },
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, discussions }
  } catch (error: any) {
    console.error("Failed to fetch discussions", error)
    return { success: false, error: error.message }
  }
}

export async function createDiscussion(lessonId: string, userId: string, content: string) {
  try {
    const discussion = await prisma.courseDiscussion.create({
      data: {
        lessonId,
        userId,
        content
      }
    })

    return { success: true, discussion }
  } catch (error: any) {
    console.error("Failed to create discussion", error)
    return { success: false, error: error.message }
  }
}

export async function replyToDiscussion(lessonId: string, userId: string, parentId: string, content: string) {
  try {
    const reply = await prisma.courseDiscussion.create({
      data: {
        lessonId,
        userId,
        parentId,
        content
      }
    })

    return { success: true, reply }
  } catch (error: any) {
    console.error("Failed to reply", error)
    return { success: false, error: error.message }
  }
}
