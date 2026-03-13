const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphans() {
  try {
    const batches = await prisma.batch.findMany({
      where: { name: { startsWith: 'VERIFY-BATCH-' } }
    });

    console.log(`Found ${batches.length} orphaned test batches.`);

    for (const batch of batches) {
      console.log(`Cleaning up ${batch.name}...`);
      await prisma.student.deleteMany({ where: { batchId: batch.id } });
      await prisma.class.deleteMany({ where: { batchId: batch.id } });
      await prisma.batch.delete({ where: { id: batch.id } });
    }

    console.log("Cleanup finished.");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphans();
