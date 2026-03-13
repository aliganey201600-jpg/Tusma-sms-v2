const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma Connection...");
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("Connection Success:", result);
  } catch (error) {
    console.error("Connection Failed!");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
