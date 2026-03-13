"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function fetchCourses() {
  try {
    // Using raw query to bypass Prisma Client generation issues on Windows
    const courses = await prisma.$queryRawUnsafe(`
      SELECT 
        c.*, 
        t."firstName", 
        t."lastName",
        (SELECT COUNT(*) FROM "Enrollment" e WHERE e."courseId" = c.id)::int as enrollment_count
      FROM "Course" c
      LEFT JOIN "Teacher" t ON c."teacherId" = t.id
      ORDER BY c.level ASC
    `);

    return (courses as any[]).map((c: any) => ({
      id: c.id,
      code: c.code || `CRS-${c.id.slice(0, 4)}`,
      rawCode: c.code || "",
      title: c.name,
      description: c.description || "",
      grade: c.level,
      category: c.category || "General",
      credits: c.credits || "3.0",
      teacherId: c.teacherId,
      teacher: c.firstName ? `${c.firstName} ${c.lastName}` : "Unassigned",
      enrollments: c.enrollment_count || 0
    }))
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function deleteCourse(id: string) {
  try {
    await (prisma as any).course.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, error: "Failed to delete course." }
  }
}

export async function fetchTeachersForDropdown() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
      }
    });
    return teachers.map((t: any) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      department: t.department || "General"
    }));
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export async function createCourse(data: {
  title: string;
  code?: string;
  description?: string;
  grade: number;
  category?: string;
  credits?: string;
  teacherId: string;
}) {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Course" (id, name, code, description, level, category, credits, "teacherId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      id, data.title, data.code || null, data.description || null, Number(data.grade), 
      data.category || "General", data.credits || "3.0", data.teacherId, now, now
    );

    revalidatePath("/dashboard/admin/courses");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function updateCourse(id: string, data: {
  title: string;
  code?: string;
  description?: string;
  grade: number;
  category?: string;
  credits?: string;
  teacherId: string;
}) {
  try {
    const now = new Date();
    
    await prisma.$executeRawUnsafe(
      `UPDATE "Course" 
       SET name = $1, code = $2, description = $3, level = $4, category = $5, credits = $6, "teacherId" = $7, "updatedAt" = $8
       WHERE id = $9`,
      data.title, data.code || null, data.description || null, Number(data.grade), 
      data.category || "General", data.credits || "3.0", data.teacherId, now, id
    );

    revalidatePath("/dashboard/admin/courses");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating course:", error);
    return { success: false, error: error.message || "Failed to update course" };
  }
}
