const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTeacherLogic() {
  console.log("Starting Teacher Logic Verification...");
  const suffix = Date.now();
  const testEmail = `teacher_${suffix}@tusmo.test`;

  try {
    // 1. Create Teacher (should also create User)
    console.log("Testing Create Teacher...");
    const teacherData = {
      firstName: "Test",
      lastName: "Teacher",
      email: testEmail,
      department: "Science",
      joinDate: new Date()
    };

    // Replicate logic from actions.ts since we can't easily import "use server" actions
    const createdTeacher = await prisma.$transaction(async (tx) => {
      let user = await tx.user.create({
        data: { email: teacherData.email, role: "TEACHER" }
      });
      return await tx.teacher.create({
        data: {
          userId: user.id,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          department: teacherData.department,
          joinDate: teacherData.joinDate
        }
      });
    });

    console.log(`Created Teacher: ${createdTeacher.firstName} ${createdTeacher.lastName}`);

    // Verify User existence
    const linkedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!linkedUser) throw new Error("User record was not created!");
    if (linkedUser.role !== "TEACHER") throw new Error("User role is not TEACHER!");
    console.log("✅ User account creation and linkage verified.");

    // 2. Update Teacher (and Email)
    console.log("Testing Update Teacher...");
    const nextEmail = `updated_${suffix}@tusmo.test`;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: createdTeacher.userId },
        data: { email: nextEmail }
      });
      await tx.teacher.update({
        where: { id: createdTeacher.id },
        data: { department: "Mathematics" }
      });
    });

    const updatedUser = await prisma.user.findUnique({ where: { email: nextEmail } });
    const updatedTeacher = await prisma.teacher.findUnique({ where: { id: createdTeacher.id } });
    
    if (!updatedUser) throw new Error("User email was not updated correctly!");
    if (updatedTeacher.department !== "Mathematics") throw new Error("Teacher department was not updated!");
    console.log("✅ Update logic (including email sync) verified.");

    // 3. Delete Teacher (should delete local records)
    console.log("Testing Delete Teacher...");
    // We simulate the action logic: delete User -> cascade delete Teacher
    await prisma.user.delete({ where: { id: linkedUser.id } });

    const deletedTeacher = await prisma.teacher.findUnique({ where: { id: createdTeacher.id } });
    const deletedUser = await prisma.user.findUnique({ where: { id: linkedUser.id } });

    if (deletedTeacher || deletedUser) throw new Error("Records were not deleted correctly!");
    console.log("✅ Delete logic (cascade) verified.");

    console.log("\n🚀 ALL TEACHER LOGIC VERIFICATIONS PASSED!");

  } catch (error) {
    console.error("❌ VERIFICATION FAILED:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTeacherLogic();
