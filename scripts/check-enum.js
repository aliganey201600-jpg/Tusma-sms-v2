const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnum() {
  try {
    const result = await prisma.$queryRaw`SELECT enum_range(NULL::"StudentStatus")`;
    console.log("Database StudentStatus Enum Values:", result);
  } catch (error) {
    console.error("Error checking enum:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnum();
