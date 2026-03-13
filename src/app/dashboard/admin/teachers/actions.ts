"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function fetchTeachers() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        _count: {
          select: { classes: true, courses: true, resources: true }
        }
      },
      orderBy: { firstName: "asc" }
    })

    return teachers.map((t: any) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.user.email,
      department: t.department || "General",
      classes: t._count.classes,
      courses: t._count.courses,
      resources: t._count.resources,
      joinDate: t.joinDate.toISOString(),
      status: t.status,
      phone: t.phone,
      specialization: t.specialization,
      qualification: t.qualification
    }))
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return []
  }
}

export async function createTeacher(data: { 
  firstName: string, 
  lastName: string, 
  email: string, 
  department: string, 
  joinDate: string,
  phone?: string,
  bio?: string,
  specialization?: string,
  qualification?: string,
  gender?: "MALE" | "FEMALE" | "OTHER",
  address?: string,
  status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE"
}) {
  try {
    const res = await prisma.$transaction(async (tx) => {
      // 1. Check if user exists
      let user = await tx.user.findUnique({ where: { email: data.email } });
      
      if (user) {
        const existingTeacher = await tx.teacher.findUnique({ where: { userId: user.id } });
        if (existingTeacher) throw new Error("A teacher with this email already exists.");
        
        await tx.user.update({
          where: { id: user.id },
          data: { role: "TEACHER" }
        });
      } else {
        user = await tx.user.create({
          data: {
            email: data.email,
            role: "TEACHER"
          }
        });
      }

      // 2. Create teacher
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          phone: data.phone,
          bio: data.bio,
          specialization: data.specialization,
          qualification: data.qualification,
          gender: data.gender,
          address: data.address,
          status: data.status || "ACTIVE",
          joinDate: new Date(data.joinDate)
        }
      });

      return teacher;
    });

    revalidatePath("/dashboard/admin/teachers");
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    return { success: false, error: error.message || "Failed to create teacher" };
  }
}

export async function updateTeacher(id: string, data: { 
  firstName: string, 
  lastName: string, 
  email: string, 
  department: string, 
  joinDate: string,
  phone?: string,
  bio?: string,
  specialization?: string,
  qualification?: string,
  gender?: "MALE" | "FEMALE" | "OTHER",
  address?: string,
  status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE"
}) {
  try {
    await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({ 
        where: { id },
        include: { user: true }
      });
      if (!teacher) throw new Error("Teacher not found");

      if (teacher.user.email !== data.email) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { email: data.email }
        });
      }

      await tx.teacher.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          phone: data.phone,
          bio: data.bio,
          specialization: data.specialization,
          qualification: data.qualification,
          gender: data.gender,
          address: data.address,
          status: data.status,
          joinDate: new Date(data.joinDate)
        }
      });
    });

    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return { success: false, error: error.message || "Failed to update teacher" };
  }
}

export async function getTeacherPerformance(teacherId: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        courses: {
          include: {
            assignments: {
              include: {
                grades: true
              }
            }
          }
        },
        _count: {
          select: { resources: true }
        }
      }
    });

    if (!teacher) throw new Error("Teacher not found");

    // 1. Student Success Rate (Average score across all assignments)
    let totalScore = 0;
    let totalGrades = 0;
    
    // 2. Grading Efficiency (Avg days after due date)
    let totalDelayDays = 0;
    let gradedAssignmentsCount = 0;

    teacher.courses.forEach(course => {
      course.assignments.forEach(assignment => {
        assignment.grades.forEach(grade => {
          totalScore += grade.score;
          totalGrades++;

          // Efficiency logic
          const dueDate = new Date(assignment.dueDate);
          const gradedDate = new Date(grade.gradedAt);
          const delay = (gradedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
          totalDelayDays += delay;
          gradedAssignmentsCount++;
        });
      });
    });

    const avgScore = totalGrades > 0 ? (totalScore / totalGrades) : 0;
    const avgGradingDelay = gradedAssignmentsCount > 0 ? (totalDelayDays / gradedAssignmentsCount) : 0;
    
    // 3. Resource Score (Resources per course)
    const resourceCount = teacher._count.resources;
    const courseCount = teacher.courses.length;
    const resourceRatio = courseCount > 0 ? (resourceCount / courseCount) : 0;

    return {
      success: true,
      metrics: {
        avgScore: Math.round(avgScore * 10) / 10,
        gradingEfficiency: Math.max(0, 100 - Math.round(avgGradingDelay * 10)), // Higher is better (0 delay = 100%)
        resourceConsistency: Math.min(100, Math.round(resourceRatio * 20)), // 5 resources/course = 100%
        raw: {
          avgGradingDelay: Math.round(avgGradingDelay * 10) / 10,
          totalResources: resourceCount,
          totalCourses: courseCount
        }
      }
    };
  } catch (error: any) {
    console.error("Error fetching performance:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (teacher) {
      // Deleting user will cascade delete the teacher due to onDelete: Cascade
      await prisma.user.delete({
        where: { id: teacher.userId }
      });
    }
    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return { success: false, error: "Failed to remove faculty member." };
  }
}

export async function fetchTeacherStats() {
  try {
    const [totalTeachers, departments] = await Promise.all([
      prisma.teacher.count(),
      prisma.teacher.groupBy({
        by: ['department'],
        _count: true
      })
    ]);

    const activeDepts = departments.filter(d => d.department).length;

    // Get total classes assigned to teachers
    const classes = await prisma.class.count({
      where: { teacherId: { not: null } }
    });

    return {
      totalTeachers,
      activeDepts,
      assignedClasses: classes
    };
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return {
      totalTeachers: 0,
      activeDepts: 0,
      assignedClasses: 0
    };
  }
}

export async function getAnnouncements() {
  try {
    const announcements = await prisma.$queryRawUnsafe<any[]>(`
      SELECT "id", "title", "content", "priority", "expiresAt", "createdAt"
      FROM "FacultyAnnouncement"
      WHERE "expiresAt" IS NULL OR "expiresAt" > NOW()
      ORDER BY "createdAt" DESC
    `);

    return { success: true, announcements };
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return { success: false, announcements: [] };
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  expiresAt?: string;
}) {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "FacultyAnnouncement" ("id", "title", "content", "priority", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4::\"AnnouncementPriority\", $5, $6, $7)`,
      id, data.title, data.content, data.priority, expiresAt, now, now
    );

    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await (prisma as any).facultyAnnouncement.delete({ where: { id } });
    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// RESOURCE SHARING ACTIONS
// ==========================================

export async function getTeacherResources(teacherId: string) {
  try {
    const resources = await prisma.teacherResource.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, resources };
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    return { success: false, resources: [] };
  }
}

export async function createTeacherResource(data: {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  teacherId: string;
}) {
  try {
    const resource = await prisma.teacherResource.create({
      data: {
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        teacherId: data.teacherId,
      }
    });
    
    revalidatePath("/dashboard/admin/teachers");
    return { success: true, resource };
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeacherResource(id: string) {
  try {
    await prisma.teacherResource.delete({ where: { id } });
    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return { success: false, error: error.message };
  }
}
