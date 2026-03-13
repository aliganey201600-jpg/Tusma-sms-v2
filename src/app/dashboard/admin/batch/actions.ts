"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function fetchBatches() {
  try {
    const batches = await (prisma as any).batch.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return batches.map((b: any) => ({
      ...b,
      studentCount: b._count.students,
      startDate: b.startDate.toISOString(),
      status: b.status || "ACTIVE"
    }))
  } catch (error) {
    console.error("Error fetching batches:", error)
    return []
  }
}

export async function createBatch(data: { name: string, startDate: string, academicYear: string, status?: string }) {
  try {
    const batch = await (prisma as any).batch.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        academicYear: data.academicYear,
        status: data.status || "ACTIVE"
      }
    })
    revalidatePath("/dashboard/admin/batch")
    return { success: true, data: batch }
  } catch (error) {
    console.error("Error creating batch:", error)
    return { success: false, error: "This batch already exists or the data is invalid" }
  }
}

export async function updateBatch(id: string, data: { name: string, startDate: string, academicYear: string, status?: string }) {
  try {
    const batch = await (prisma as any).batch.update({
      where: { id },
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        academicYear: data.academicYear,
        status: data.status
      }
    })
    revalidatePath("/dashboard/admin/batch")
    return { success: true, data: batch }
  } catch (error) {
    console.error("Error updating batch:", error)
    return { success: false, error: "Failed to update batch" }
  }
}

export async function deleteBatch(id: string) {
  try {
    await (prisma as any).batch.delete({ where: { id } })
    revalidatePath("/dashboard/admin/batch")
    return { success: true }
  } catch (error) {
    console.error("Error deleting batch:", error)
    return { success: false, error: "Failed to delete batch" }
  }
}

export async function advanceAcademicYear(batchId: string) {
  try {
    const batch = await (prisma as any).batch.findUnique({
      where: { id: batchId },
      include: {
        classes: true,
        students: {
          where: { status: "ACTIVE" },
          include: { class: true }
        }
      }
    });

    if (!batch) return { success: false, error: "Batch not found" };
    if (batch.status !== "ACTIVE") return { success: false, error: "Only ACTIVE batches can be transitioned." };

    const parts = batch.academicYear.split("-");
    const nextYear = `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}`;

    let graduatedCount = 0;
    let progressedCount = 0;

    await prisma.$transaction(async (tx: any) => {
      // 1. Graduation: Graduate anyone who IS CURRENTLY in a Grade 12 class in this batch
      const grade12ClassIds = batch.classes
        .filter((c: any) => c.grade === 12)
        .map((c: any) => c.id);

      console.log(`Graduating students in classes: ${grade12ClassIds.join(", ")}`);

      if (grade12ClassIds.length > 0) {
        const graduateResult = await tx.student.updateMany({
          where: {
            classId: { in: grade12ClassIds },
            status: { in: ["ACTIVE", "PENDING"] }
          },
          data: {
            status: "GRADUATED",
            classId: null
          }
        });
        graduatedCount = graduateResult.count;
        console.log(`Graduated ${graduatedCount} students.`);
      }

      // 2. Rename to TEMPORARY names first to avoid "Unique Constraint" collisions
      for (const cls of batch.classes) {
        await tx.class.update({
          where: { id: cls.id },
          data: { name: `TEMP_UPGRADING_${cls.id.slice(0, 8)}` }
        });
      }

      // 3. Final Update: New Grade, New Level, and New Final Name
      for (const cls of batch.classes) {
        if (cls.grade < 12) {
          const nextGrade = cls.grade + 1;
          const section = cls.section || "A";

          let newLevel = "Secondary";
          if (nextGrade >= 1 && nextGrade <= 4) newLevel = "Lower Primary";
          else if (nextGrade >= 5 && nextGrade <= 8) newLevel = "Upper Primary";

          const updateResult = await tx.class.update({
            where: { id: cls.id },
            data: {
              grade: nextGrade,
              name: `Grade ${nextGrade}-${section} (${batch.name})`,
              level: newLevel
            },
            include: { _count: { select: { students: true } } }
          });
          progressedCount += updateResult._count.students;
        } else {
          // Grade 12 stays as is but rename it back correctly as GRADUATED to avoid collisions with promoting Grade 11s
          await tx.class.update({
            where: { id: cls.id },
            data: { name: `GRADUATED-Grade 12-${cls.section || "A"} (${batch.name})` }
          });
        }
      }

      // 4. Update Batch Year
      await tx.batch.update({
        where: { id: batchId },
        data: { academicYear: nextYear }
      });
    }, {
      timeout: 10000 // Give it more time for larger batches
    });

    revalidatePath("/dashboard/admin/batch");
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/dashboard/admin/classes");
    return {
      success: true,
      newYear: nextYear,
      graduatedCount,
      progressedCount
    };
  } catch (error: any) {
    console.error("Error advancing year:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Collision Error: A class with the target name already exists in another batch. Please check your class names." };
    }
    return { success: false, error: error.message || "Failed to advance." };
  }
}

export async function revertAcademicYear(batchId: string) {
  try {
    const batch = await (prisma as any).batch.findUnique({
      where: { id: batchId },
      include: {
        classes: true,
        students: { include: { class: true } }
      }
    });

    if (!batch) return { success: false, error: "Batch not found" };

    const parts = batch.academicYear.split("-");
    const prevYear = `${parseInt(parts[0]) - 1}-${parseInt(parts[1]) - 1}`;

    await prisma.$transaction(async (tx: any) => {
      // 1. Rename to TEMP
      for (const cls of batch.classes) {
        await tx.class.update({
          where: { id: cls.id },
          data: { name: `TEMP_REVERTING_${cls.id.slice(0, 8)}` }
        });
      }

      // 2. Final Revert
      for (const cls of batch.classes) {
        if (cls.grade > 1) {
          const prevGrade = cls.grade - 1;
          const section = cls.section || "A";

          let prevLevel = "Secondary";
          if (prevGrade >= 1 && prevGrade <= 4) prevLevel = "Lower Primary";
          else if (prevGrade >= 5 && prevGrade <= 8) prevLevel = "Upper Primary";

          await tx.class.update({
            where: { id: cls.id },
            data: {
              grade: prevGrade,
              name: `Grade ${prevGrade}-${section} (${batch.name})`,
              level: prevLevel
            }
          });
        } else {
          await tx.class.update({
            where: { id: cls.id },
            data: { name: `Grade 1-${cls.section || "A"} (${batch.name})` }
          });
        }
      }

      await tx.batch.update({
        where: { id: batchId },
        data: { academicYear: prevYear }
      });

      for (const student of batch.students) {
        if (student.status === "GRADUATED") {
          await tx.student.update({
            where: { id: student.id },
            data: { status: "ACTIVE" }
          });
        }
      }
    });

    revalidatePath("/dashboard/admin/batch");
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/dashboard/admin/classes");
    return { success: true, prevYear };
  } catch (error: any) {
    console.error("Error reverting year:", error);
    return { success: false, error: "Failed to revert year. Check for naming conflicts." };
  }
}

export async function advanceAllBatches() {
  try {
    const activeBatches = await (prisma as any).batch.findMany({
      where: { status: "ACTIVE" },
      include: {
        classes: true,
        students: {
          where: { status: "ACTIVE" },
          include: { class: true }
        }
      }
    });

    if (activeBatches.length === 0) return { success: true, message: "No active batches to advance." };

    let totalGraduated = 0;
    let totalProgressed = 0;

    await prisma.$transaction(async (tx: any) => {
      // PHASE 1: Move ALL classes of ALL active batches to TEMP names
      // This clears the way for the new names and avoids unique constraint errors between batches
      for (const batch of activeBatches) {
        for (const cls of batch.classes) {
          await tx.class.update({
            where: { id: cls.id },
            data: { name: `T_ADV_${cls.id.slice(0, 8)}_${Math.floor(Math.random() * 1000)}` }
          });
        }
      }

      // PHASE 2: Apply Final Updates
      for (const batch of activeBatches) {
        // Calculate new year
        let nextYear = batch.academicYear;
        if (batch.academicYear.includes("-")) {
          const parts = batch.academicYear.split("-");
          nextYear = `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}`;
        } else if (!isNaN(parseInt(batch.academicYear))) {
          nextYear = (parseInt(batch.academicYear) + 1).toString();
        }

        // STEP A: Graduation (BEFORE class updates)
        const grade12ClassIds = batch.classes
          .filter((c: any) => c.grade === 12)
          .map((c: any) => c.id);

        if (grade12ClassIds.length > 0) {
          const graduateResult = await tx.student.updateMany({
            where: {
              classId: { in: grade12ClassIds },
              status: { in: ["ACTIVE", "PENDING"] }
            },
            data: {
              status: "GRADUATED",
              classId: null
            }
          });
          totalGraduated += graduateResult.count;
        }

        // STEP B: Update classes
        for (const cls of batch.classes) {
          if (cls.grade < 12) {
            const nextGrade = cls.grade + 1;
            const section = cls.section || "A";

            let newLevel = "Secondary";
            if (nextGrade >= 1 && nextGrade <= 4) newLevel = "Lower Primary";
            else if (nextGrade >= 5 && nextGrade <= 8) newLevel = "Upper Primary";

            const updateResult = await tx.class.update({
              where: { id: cls.id },
              data: {
                grade: nextGrade,
                name: `Grade ${nextGrade}-${section} (${batch.name})`,
                level: newLevel
              },
              include: { _count: { select: { students: true } } }
            });
            totalProgressed += updateResult._count.students;
          } else {
            // Keep Grade 12 but mark as GRADUATED to avoid collisions with promoting Grade 11s
            await tx.class.update({
              where: { id: cls.id },
              data: { name: `GRADUATED-Grade 12-${cls.section || "A"} (${batch.name})` }
            });
          }
        }

        // STEP C: Update Batch Year
        await tx.batch.update({
          where: { id: batch.id },
          data: { academicYear: nextYear }
        });
      }
    }, {
      timeout: 30000 // Extended timeout for multiple batches
    });

    revalidatePath("/dashboard/admin/batch");
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/dashboard/admin/classes");
    return { success: true, totalGraduated, totalProgressed };
  } catch (error: any) {
    console.error("Error advancing all batches:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Collision Error: Some class names already exist in the system of ARCHIVED/INACTIVE batches. Please check manually." };
    }
    return { success: false, error: error.message || "Failed to advance all batches." };
  }
}

export async function revertAllBatches() {
  try {
    const activeBatches = await (prisma as any).batch.findMany({
      where: { status: "ACTIVE" },
      include: {
        classes: true,
        students: { include: { class: true } }
      }
    });

    if (activeBatches.length === 0) return { success: true, message: "No active batches to revert." };

    await prisma.$transaction(async (tx: any) => {
      // PHASE 1: Move to TEMP
      for (const batch of activeBatches) {
        for (const cls of batch.classes) {
          await tx.class.update({
            where: { id: cls.id },
            data: { name: `T_REV_${cls.id.slice(0, 8)}_${Math.floor(Math.random() * 1000)}` }
          });
        }
      }

      // PHASE 2: Revert
      for (const batch of activeBatches) {
        let prevYear = batch.academicYear;
        if (batch.academicYear.includes("-")) {
          const parts = batch.academicYear.split("-");
          prevYear = `${parseInt(parts[0]) - 1}-${parseInt(parts[1]) - 1}`;
        } else if (!isNaN(parseInt(batch.academicYear))) {
          prevYear = (parseInt(batch.academicYear) - 1).toString();
        }

        for (const cls of batch.classes) {
          if (cls.grade > 1) {
            const prevGrade = cls.grade - 1;
            const section = cls.section || "A";

            let prevLevel = "Secondary";
            if (prevGrade >= 1 && prevGrade <= 4) prevLevel = "Lower Primary";
            else if (prevGrade >= 5 && prevGrade <= 8) prevLevel = "Upper Primary";

            await tx.class.update({
              where: { id: cls.id },
              data: {
                grade: prevGrade,
                name: `Grade ${prevGrade}-${section} (${batch.name})`,
                level: prevLevel
              }
            });
          } else {
            await tx.class.update({
              where: { id: cls.id },
              data: { name: `Grade 1-${cls.section || "A"} (${batch.name})` }
            });
          }
        }

        await tx.batch.update({
          where: { id: batch.id },
          data: { academicYear: prevYear }
        });

        for (const student of batch.students) {
          if (student.status === "GRADUATED") {
            await tx.student.update({
              where: { id: student.id },
              data: { status: "ACTIVE" }
            });
          }
        }
      }
    }, {
      timeout: 30000
    });

    revalidatePath("/dashboard/admin/batch");
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/dashboard/admin/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Error reverting all batches:", error);
    return { success: false, error: error.message || "Failed to revert all batches." };
  }
}
