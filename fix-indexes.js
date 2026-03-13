const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIndexes() {
  try {
    console.log("Dropping constraint 'Class_name_key'...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_name_key"');
    console.log("Successfully dropped constraint 'Class_name_key'!");

    console.log("Creating composite unique index '(name, batchId)'...");
    // Prisma usually names it Class_name_batchId_key
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Class_name_batchId_key" ON public."Class" (name, "batchId")');
    console.log("Successfully created composite index!");

    // Verify
    const result = await prisma.$queryRaw`
      SELECT
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        tablename = 'Class';
    `;
    console.log("Updated Indexes on 'Class' table:");
    console.table(result);

  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIndexes();
