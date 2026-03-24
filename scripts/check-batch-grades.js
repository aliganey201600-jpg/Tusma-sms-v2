const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBatchGrades() {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: 'ACTIVE' },
      include: {
        classes: true
      }
    });

    for (const batch of batches) {
      const grades = new Set(batch.classes.map(c => c.grade));
      if (grades.size > 1) {
        console.log(`⚠️ Batch '${batch.name}' (ID: ${batch.id}) has MULTIPLE grades: ${Array.from(grades).join(', ')}`);
        console.log("Classes:", batch.classes.map(c => `${c.name} (Grade ${c.grade})`));
      } else {
        console.log(`✅ Batch '${batch.name}' has a single grade: ${Array.from(grades)[0] || 'NONE'}`);
      }
    }

  } catch (error) {
    console.error("Error checking batch grades:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBatchGrades();
