"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Class validation schema
const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  level: z.string().min(1, "Level is required"),
  grade: z.coerce.number().int().min(1).max(12),
  section: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  capacity: z.coerce.number().int().min(1).max(100).default(30),
  batchId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
})

export type ClassData = z.infer<typeof classSchema>

/**
 * Fetch all classes with student counts, teachers, and batches
 */
export async function fetchClasses() {
  try {
    const classes = await (prisma as any).class.findMany({
      include: {
        _count: {
          select: { students: true }
        },
        teacher: true,
        batch: true
      },
      orderBy: { createdAt: "desc" }
    })

    return classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      grade: c.grade,
      section: c.section,
      room: c.room,
      capacity: c.capacity,
      students: c._count.students,
      batchId: c.batchId,
      batchName: c.batch?.name || "No Batch",
      teacherId: c.teacherId,
      teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : "No Teacher Assigned",
      status: c._count.students >= c.capacity ? "Full" : "Available"
    }))
  } catch (error) {
    console.error("Error fetching classes:", error)
    return []
  }
}

/**
 * Fetch teachers for selection in dropdowns
 */
export async function fetchTeachers() {
  try {
    const teachers = await (prisma as any).teacher.findMany({
      orderBy: { firstName: "asc" }
    })
    return teachers.map((t: any) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`
    }))
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return []
  }
}

/**
 * Fetch batches for selection
 */
export async function fetchBatches() {
  try {
    const batches = await (prisma as any).batch.findMany({
      orderBy: { createdAt: "desc" }
    })
    return batches.map((b: any) => ({
      id: b.id,
      name: b.name
    }))
  } catch (error) {
    console.error("Error fetching batches:", error)
    return []
  }
}

/**
 * Create a new class
 */
export async function createClass(rawData: ClassData) {
  try {
    const validatedData = classSchema.parse(rawData)

    // Check if a class with exactly this name already exists
    const existingClass = await (prisma as any).class.findUnique({
      where: { name: validatedData.name }
    })

    if (existingClass) {
      return { 
        success: false, 
        error: `A class named '${validatedData.name}' already exists. Please choose a different section (e.g., Change Section to B).` 
      }
    }

    const newClass = await (prisma as any).class.create({
      data: validatedData
    })

    revalidatePath("/dashboard/admin/classes")
    return { success: true, data: newClass }
  } catch (error) {
    console.error("Error creating class:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" }
    }
    return { success: false, error: "Database error: Could not create class." }
  }
}

/**
 * Update class details
 */
export async function updateClass(id: string, rawData: Partial<ClassData>) {
  try {
    const validatedData = classSchema.partial().parse(rawData)

    const updatedClass = await (prisma as any).class.update({
      where: { id },
      data: validatedData
    })

    revalidatePath("/dashboard/admin/classes")
    return { success: true, data: updatedClass }
  } catch (error) {
    console.error("Error updating class:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" }
    }
    return { success: false, error: "Failed to update class details" }
  }
}

/**
 * Delete a class
 */
export async function deleteClass(id: string) {
  try {
    const classInfo = await (prisma as any).class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } }
    })

    if (classInfo?._count.students > 0) {
      return { 
        success: false, 
        error: `Cannot delete class. It currently has ${classInfo._count.students} students.` 
      }
    }

    await (prisma as any).class.delete({
      where: { id }
    })

    revalidatePath("/dashboard/admin/classes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting class:", error)
    return { success: false, error: "Failed to delete class" }
  }
}

/**
 * Get core stats for classes
 */
export async function getClassStats() {
  try {
    const [totalClasses, totalStudents, totalCapacity] = await Promise.all([
      (prisma as any).class.count(),
      (prisma as any).student.count(),
      (prisma as any).class.aggregate({ _sum: { capacity: true } })
    ])

    return {
      totalClasses,
      totalStudents,
      totalCapacity: totalCapacity._sum.capacity || 0,
      averageStudentsPerClass: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      utilizationRate: totalCapacity._sum.capacity ? Math.round((totalStudents / totalCapacity._sum.capacity) * 100) : 0
    }
  } catch (error) {
    console.error("Error fetching class stats:", error)
    return null
  }
}
