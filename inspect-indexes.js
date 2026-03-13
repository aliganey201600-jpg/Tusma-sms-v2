const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectIndexes() {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        tablename = 'Class';
    `;
    console.log("Indexes on 'Class' table:");
    console.table(result);
  } catch (error) {
    console.error("Error inspecting indexes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectIndexes();
