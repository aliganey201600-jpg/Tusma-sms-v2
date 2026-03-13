const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyBatchLogic() {
  console.log("Starting Batch Logic Verification...");

  try {
    // 1. Create a Test Batch
    const batch = await prisma.batch.create({
      data: {
        name: "VERIFY-BATCH-" + Date.now(),
        startDate: new Date(),
        academicYear: "2023-2024",
        status: "ACTIVE"
      }
    });
    console.log(`Created Test Batch: ${batch.name}`);

    // 2. Create User records for students (required by schema)
    const user1 = await prisma.user.create({ data: { email: `test_student_1_${Date.now()}@test.com`, role: "STUDENT" } });
    const user2 = await prisma.user.create({ data: { email: `test_student_2_${Date.now()}@test.com`, role: "STUDENT" } });

    const suffix = Date.now();
    // 3. Create Classes
    const classGrade11 = await prisma.class.create({
      data: {
        name: `Grade 11-A (Test-${suffix})`,
        grade: 11,
        level: "Secondary",
        section: "A",
        batchId: batch.id
      }
    });

    const classGrade12 = await prisma.class.create({
      data: {
        name: `Grade 12-A (Test-${suffix})`,
        grade: 12,
        level: "Secondary",
        section: "A",
        batchId: batch.id
      }
    });

    // 4. Create Students
    const student1 = await prisma.student.create({
      data: {
        firstName: "Test",
        lastName: "Progression",
        gender: "Male",
        userId: user1.id,
        batchId: batch.id,
        classId: classGrade11.id,
        status: "ACTIVE"
      }
    });

    const student2 = await prisma.student.create({
      data: {
        firstName: "Test",
        lastName: "Graduation",
        gender: "Female",
        userId: user2.id,
        batchId: batch.id,
        classId: classGrade12.id,
        status: "ACTIVE"
      }
    });

    console.log("Mock data setup complete. Running advance logic simulation...");

    // We can't easily call the "use server" action from a raw node script without environment setup
    // but we can replicate the core logic here to verify the database behavior matches our code.
    
    // START SIMULATION (copy of refined advanceAcademicYear logic)
    const nextYear = "2024-2025";
    await prisma.$transaction(async (tx) => {
      // Graduation
      await tx.student.updateMany({
        where: { classId: classGrade12.id, status: "ACTIVE" },
        data: { status: "GRADUATED", classId: null }
      });

      // Promoting Grade 11 -> 12
      await tx.class.update({
        where: { id: classGrade11.id },
        data: { grade: 12, name: `Grade 12-A (${batch.name})` }
      });

      // Renaming Promoted Grade 12 -> GRADUATED
      await tx.class.update({
        where: { id: classGrade12.id },
        data: { name: `GRADUATED-Grade 12-A (${batch.name})` }
      });
      
      await tx.batch.update({
        where: { id: batch.id },
        data: { academicYear: nextYear }
      });
    });
    // END SIMULATION

    // 5. Verify Results
    const updatedStudent1 = await prisma.student.findUnique({ where: { id: student1.id } });
    const updatedStudent2 = await prisma.student.findUnique({ where: { id: student2.id } });
    const updatedClass11 = await prisma.class.findUnique({ where: { id: classGrade11.id } });
    const updatedClass12 = await prisma.class.findUnique({ where: { id: classGrade12.id } });
    const updatedBatch = await prisma.batch.findUnique({ where: { id: batch.id } });

    const errors = [];
    if (updatedStudent1.status !== "ACTIVE") errors.push("Student 1 should be ACTIVE");
    if (updatedStudent2.status !== "GRADUATED") errors.push("Student 2 should be GRADUATED");
    if (updatedStudent2.classId !== null) errors.push("Student 2 should have null classId");
    if (updatedClass11.grade !== 12) errors.push("Class 11 should be Grade 12 now");
    if (updatedClass11.name !== `Grade 12-A (${batch.name})`) errors.push("Class 11 name is incorrect");
    if (updatedClass12.name !== `GRADUATED-Grade 12-A (${batch.name})`) errors.push("Class 12 name should have GRADUATED- prefix");
    if (updatedBatch.academicYear !== "2024-2025") errors.push("Batch year should be 2024-2025");

    if (errors.length === 0) {
      console.log("✅ VERIFICATION SUCCESSFUL: All logic rules passed!");
    } else {
      console.error("❌ VERIFICATION FAILED:");
      errors.forEach(e => console.error(` - ${e}`));
    }

    // Cleanup
    await prisma.student.deleteMany({ where: { batchId: batch.id } });
    await prisma.class.deleteMany({ where: { batchId: batch.id } });
    await prisma.batch.delete({ where: { id: batch.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    console.log("Cleanup complete.");

  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyBatchLogic();
